import { useEffect, useRef, useCallback } from 'react';
import type { GameWorld, GamePhase } from './types';
import {
  MAX_SPEED, SPEED_RAMP_INTERVAL, SPEED_RAMP_FACTOR,
  SCORE_PER_MS, EGG_BONUS, GROUND_Y, JUMP_VELOCITY, MAX_JUMPS, BOSS_WARN_X,
} from './constants';
import { updateBunnyPosition } from './physics';
import { overlaps, getBunnyBox, getObstacleBox, getEggBox } from './collision';
import { shouldSpawn, spawnObstacle, spawnCollectible, nextSpawnDistance } from './spawner';
import type { AudioControls } from './useAudio';

export interface DomRefs {
  bunnyEl: React.RefObject<HTMLDivElement | null>;
  obstacleContainer: React.RefObject<HTMLDivElement | null>;
  collectibleContainer: React.RefObject<HTMLDivElement | null>;
  scoreEl: React.RefObject<HTMLSpanElement | null>;
}

function createObstacleElement(obs: ReturnType<typeof spawnObstacle>): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `obstacle obstacle--${obs.type}`;
  el.style.position = 'absolute';
  el.style.bottom = `${GROUND_Y}px`;
  el.style.left = '0';
  el.style.transform = `translateX(${obs.x}px)`;
  el.dataset.id = String(obs.id);
  return el;
}

function createCollectibleElement(egg: NonNullable<ReturnType<typeof spawnCollectible>>): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'collectible collectible--egg';
  el.style.position = 'absolute';
  el.style.bottom = `${GROUND_Y + egg.y}px`;
  el.style.left = '0';
  el.style.transform = `translateX(${egg.x}px)`;
  el.style.setProperty('--egg-color', egg.color);
  el.dataset.id = String(egg.id);
  return el;
}

function showScorePopup(container: HTMLDivElement, x: number, y: number, text: string) {
  const popup = document.createElement('div');
  popup.className = 'score-popup';
  popup.textContent = text;
  popup.style.position = 'absolute';
  popup.style.left = `${x}px`;
  popup.style.bottom = `${y}px`;
  container.appendChild(popup);
  setTimeout(() => popup.remove(), 800);
}

export function useGameLoop(
  worldRef: React.MutableRefObject<GameWorld>,
  domRefs: DomRefs,
  setPhase: (phase: GamePhase) => void,
  audio: AudioControls,
  showBossWarning: () => void,
) {
  const rafHandle = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);
  const isRunning = useRef(false);

  // Keep stable refs to callbacks so the tick closure never goes stale
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const showBossWarningRef = useRef(showBossWarning);
  showBossWarningRef.current = showBossWarning;

  const doJump = useCallback(() => {
    const world = worldRef.current;
    if (world.phase !== 'playing') return;
    if (world.jumpsRemaining > 0) {
      const isDoubleJump = world.jumpsRemaining < MAX_JUMPS;
      world.bunnyVY = JUMP_VELOCITY;
      world.jumpsRemaining -= 1;
      if (isDoubleJump) {
        audioRef.current.playDoubleJump();
      } else {
        audioRef.current.playJump();
      }
      if (domRefs.bunnyEl.current) {
        domRefs.bunnyEl.current.classList.add('bunny--jumping');
      }
    }
  }, [worldRef, domRefs]);

  const stopLoop = useCallback(() => {
    isRunning.current = false;
    if (rafHandle.current) {
      cancelAnimationFrame(rafHandle.current);
      rafHandle.current = 0;
    }
  }, []);

  const startLoop = useCallback(() => {
    if (isRunning.current) return;
    isRunning.current = true;
    lastTimestamp.current = performance.now();

    function tick(timestamp: number) {
      if (!isRunning.current) return;

      const rawDelta = timestamp - lastTimestamp.current;
      const deltaTime = Math.min(rawDelta, 100);
      lastTimestamp.current = timestamp;

      const world = worldRef.current;
      if (world.phase !== 'playing') {
        isRunning.current = false;
        return;
      }

      // Update distance and speed
      world.distance += world.speed * deltaTime;

      // Speed ramp
      if (world.score - world.lastSpeedRampScore >= SPEED_RAMP_INTERVAL) {
        world.speed = Math.min(world.speed * (1 + SPEED_RAMP_FACTOR), MAX_SPEED);
        world.lastSpeedRampScore = world.score;
      }

      // Physics: bunny
      const { y, vy, onGround, jumpsRemaining } = updateBunnyPosition(
        world.bunnyY, world.bunnyVY, deltaTime, world.jumpsRemaining
      );
      world.bunnyY = y;
      world.bunnyVY = vy;
      world.isOnGround = onGround;
      if (onGround) {
        world.jumpsRemaining = jumpsRemaining;
        domRefs.bunnyEl.current?.classList.remove('bunny--jumping');
      }

      // Update bunny DOM
      if (domRefs.bunnyEl.current) {
        domRefs.bunnyEl.current.style.bottom = `${GROUND_Y + world.bunnyY}px`;
      }

      // Move obstacles + boss warning check
      for (const obs of world.obstacles) {
        obs.x -= world.speed * deltaTime;
        if (obs.el) {
          obs.el.style.transform = `translateX(${obs.x}px)`;
        }
        if (obs.type === 'boss' && !obs.warnTriggered && obs.x < BOSS_WARN_X) {
          obs.warnTriggered = true;
          audioRef.current.playBossWarning();
          showBossWarningRef.current();
        }
      }

      // Move collectibles
      for (const egg of world.collectibles) {
        if (!egg.collected) {
          egg.x -= world.speed * deltaTime;
          if (egg.el) {
            egg.el.style.transform = `translateX(${egg.x}px)`;
          }
        }
      }

      // Spawn new entities
      if (shouldSpawn(world)) {
        world.entityIdCounter += 2;
        const obs = spawnObstacle(world);
        const egg = spawnCollectible(world);

        if (domRefs.obstacleContainer.current) {
          const el = createObstacleElement(obs);
          obs.el = el;
          domRefs.obstacleContainer.current.appendChild(el);
        }

        if (egg && domRefs.collectibleContainer.current) {
          const el = createCollectibleElement(egg);
          egg.el = el;
          domRefs.collectibleContainer.current.appendChild(el);
          world.collectibles.push(egg);
        }

        world.obstacles.push(obs);
        world.nextSpawnDistance = nextSpawnDistance(world.distance, world.speed);
      }

      // Cull off-screen entities
      world.obstacles = world.obstacles.filter(obs => {
        if (obs.x < -200) {
          obs.el?.remove();
          return false;
        }
        return true;
      });
      world.collectibles = world.collectibles.filter(egg => {
        if (egg.x < -200 || egg.collected) {
          if (egg.x < -200) egg.el?.remove();
          return egg.x >= -200 && !egg.collected;
        }
        return true;
      });

      // Collision: obstacles
      const bunnyBox = getBunnyBox(world.bunnyY);
      for (const obs of world.obstacles) {
        if (overlaps(bunnyBox, getObstacleBox(obs))) {
          audioRef.current.playGameOver();
          audioRef.current.stopMusic();
          const hs = Math.max(world.score, world.highScore);
          world.highScore = hs;
          localStorage.setItem('bunnyJumpHighScore', String(Math.floor(hs)));
          world.phase = 'gameover';
          stopLoop();
          setPhase('gameover');
          return;
        }
      }

      // Collision: collectibles
      for (const egg of world.collectibles) {
        if (!egg.collected && overlaps(bunnyBox, getEggBox(egg))) {
          egg.collected = true;
          world.score += EGG_BONUS;
          audioRef.current.playEggCollect();
          if (egg.el) {
            egg.el.classList.add('collected');
            const cx = egg.x + 16;
            const cy = GROUND_Y + egg.y + 20;
            if (domRefs.collectibleContainer.current) {
              showScorePopup(domRefs.collectibleContainer.current, cx, cy, `+${EGG_BONUS}`);
            }
            setTimeout(() => egg.el?.remove(), 400);
          }
        }
      }

      // Score
      world.score += SCORE_PER_MS * deltaTime;
      if (domRefs.scoreEl.current) {
        domRefs.scoreEl.current.textContent = String(Math.floor(world.score));
      }

      rafHandle.current = requestAnimationFrame(tick);
    }

    rafHandle.current = requestAnimationFrame(tick);
  }, [worldRef, domRefs, setPhase, stopLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  return { startLoop, stopLoop, doJump };
}
