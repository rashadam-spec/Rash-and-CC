import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameWorld, GamePhase } from '../game/types';
import { BASE_SPEED, GROUND_Y, MAX_JUMPS, GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { useGameLoop } from '../game/useGameLoop';
import Bunny from './Bunny';
import Background from './Background';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';

function makeInitialWorld(highScore: number): GameWorld {
  return {
    bunnyY: 0,
    bunnyVY: 0,
    jumpsRemaining: MAX_JUMPS,
    isOnGround: true,
    obstacles: [],
    collectibles: [],
    score: 0,
    highScore,
    distance: 0,
    speed: BASE_SPEED,
    nextSpawnDistance: 300,
    phase: 'idle',
    lastSpeedRampScore: 0,
    entityIdCounter: 0,
  };
}

export default function Game() {
  const savedHighScore = parseFloat(localStorage.getItem('bunnyJumpHighScore') ?? '0') || 0;

  const [phase, setPhase] = useState<GamePhase>('idle');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayHighScore, setDisplayHighScore] = useState(savedHighScore);

  const worldRef = useRef<GameWorld>(makeInitialWorld(savedHighScore));

  const bunnyEl = useRef<HTMLDivElement>(null);
  const obstacleContainer = useRef<HTMLDivElement>(null);
  const collectibleContainer = useRef<HTMLDivElement>(null);
  const scoreEl = useRef<HTMLSpanElement>(null);

  const domRefs = { bunnyEl, obstacleContainer, collectibleContainer, scoreEl };

  const handleSetPhase = useCallback((p: GamePhase) => {
    if (p === 'gameover') {
      setDisplayScore(Math.floor(worldRef.current.score));
      setDisplayHighScore(Math.floor(worldRef.current.highScore));
    }
    setPhase(p);
  }, []);

  const { startLoop, doJump } = useGameLoop(worldRef, domRefs, handleSetPhase);

  const handleStart = useCallback(() => {
    // Reset world
    const hs = worldRef.current.highScore;
    worldRef.current = makeInitialWorld(hs);

    // Clear obstacle/collectible DOM
    if (obstacleContainer.current) obstacleContainer.current.innerHTML = '';
    if (collectibleContainer.current) collectibleContainer.current.innerHTML = '';

    // Reset bunny position
    if (bunnyEl.current) {
      bunnyEl.current.style.bottom = `${GROUND_Y}px`;
      bunnyEl.current.classList.remove('bunny--jumping');
    }
    if (scoreEl.current) scoreEl.current.textContent = '0';

    worldRef.current.phase = 'playing';
    setPhase('playing');
    startLoop();
  }, [startLoop]);

  const handleJump = useCallback(() => {
    if (phase === 'idle' || phase === 'gameover') {
      handleStart();
      return;
    }
    doJump();
  }, [phase, handleStart, doJump]);

  // Keyboard support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handleJump]);

  return (
    <div
      className="game-wrapper"
      onClick={handleJump}
      onTouchStart={(e) => { e.preventDefault(); handleJump(); }}
    >
      <div className="game-container" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        <Background />

        {/* Ground */}
        <div className="ground" />

        {/* Obstacle layer */}
        <div ref={obstacleContainer} className="entity-layer obstacle-layer" />

        {/* Collectible layer */}
        <div ref={collectibleContainer} className="entity-layer collectible-layer" />

        {/* Bunny */}
        <Bunny ref={bunnyEl} />

        {/* Score HUD */}
        {phase === 'playing' && (
          <div className="score-hud">
            🥚 <span ref={scoreEl}>0</span>
          </div>
        )}

        {/* Overlays */}
        {phase === 'idle' && (
          <StartScreen highScore={displayHighScore} onStart={handleStart} />
        )}
        {phase === 'gameover' && (
          <GameOverScreen
            score={displayScore}
            highScore={displayHighScore}
            onRestart={handleStart}
          />
        )}
      </div>
    </div>
  );
}
