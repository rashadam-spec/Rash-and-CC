import type { ObstacleEntity, CollectibleEntity, GameWorld } from './types';
import {
  GAME_WIDTH,
  SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX,
  EGG_COLORS,
  BOSS_MIN_SCORE, BOSS_SPAWN_CHANCE,
} from './constants';

export function shouldSpawn(world: GameWorld): boolean {
  return world.distance >= world.nextSpawnDistance;
}

export function nextSpawnDistance(currentDistance: number, speed: number): number {
  const minDist = SPAWN_INTERVAL_MIN * speed;
  const maxDist = SPAWN_INTERVAL_MAX * speed;
  return currentDistance + minDist + Math.random() * (maxDist - minDist);
}

const OBSTACLE_TYPES: Array<ObstacleEntity['type']> = ['basket', 'basket', 'basket', 'basket', 'chick', 'chick', 'chick', 'fence', 'fence'];

export function spawnObstacle(world: GameWorld): ObstacleEntity {
  let type: ObstacleEntity['type'];
  if (world.score >= BOSS_MIN_SCORE && Math.random() < BOSS_SPAWN_CHANCE) {
    type = 'boss';
  } else {
    type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
  }
  return {
    id: world.entityIdCounter,
    x: GAME_WIDTH + 60,
    y: 0,
    type,
    warnTriggered: false,
  };
}

export function spawnCollectible(world: GameWorld): CollectibleEntity | null {
  // 60% chance to spawn a collectible alongside an obstacle
  if (Math.random() > 0.6) return null;

  // Spawn egg at a reachable height (60–180px above ground)
  const yAboveGround = 60 + Math.random() * 120;
  const color = EGG_COLORS[Math.floor(Math.random() * EGG_COLORS.length)];

  return {
    id: world.entityIdCounter + 1,
    x: GAME_WIDTH + 60 + 100 + Math.random() * 200, // offset from obstacle
    y: yAboveGround,
    type: 'egg',
    color,
    collected: false,
  };
}
