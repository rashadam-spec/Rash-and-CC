import type { Box, ObstacleEntity, CollectibleEntity } from './types';
import {
  BUNNY_X, GROUND_Y,
  BUNNY_HITBOX, BASKET_HITBOX, CHICK_HITBOX, FENCE_HITBOX, EGG_HITBOX,
  BUNNY_H, BASKET_H, CHICK_H, FENCE_H, EGG_H,
} from './constants';

export function overlaps(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function getBunnyBox(bunnyY: number): Box {
  const GAME_HEIGHT = 400;
  const topFromBottom = GROUND_Y + bunnyY;
  const topFromTop = GAME_HEIGHT - topFromBottom - BUNNY_H;
  return {
    x: BUNNY_X + BUNNY_HITBOX.offsetX,
    y: topFromTop + BUNNY_HITBOX.offsetY,
    w: BUNNY_HITBOX.w,
    h: BUNNY_HITBOX.h,
  };
}

export function getObstacleBox(obs: ObstacleEntity): Box {
  const GAME_HEIGHT = 400;
  let hitbox = BASKET_HITBOX;
  let h = BASKET_H;
  if (obs.type === 'chick') { hitbox = CHICK_HITBOX; h = CHICK_H; }
  if (obs.type === 'fence') { hitbox = FENCE_HITBOX; h = FENCE_H; }

  const topFromBottom = GROUND_Y;
  const topFromTop = GAME_HEIGHT - topFromBottom - h;
  return {
    x: obs.x + hitbox.offsetX,
    y: topFromTop + hitbox.offsetY,
    w: hitbox.w,
    h: hitbox.h,
  };
}

export function getEggBox(egg: CollectibleEntity): Box {
  const GAME_HEIGHT = 400;
  // egg.y is px above ground
  const topFromBottom = GROUND_Y + egg.y;
  const topFromTop = GAME_HEIGHT - topFromBottom - EGG_H;
  return {
    x: egg.x + EGG_HITBOX.offsetX,
    y: topFromTop + EGG_HITBOX.offsetY,
    w: EGG_HITBOX.w,
    h: EGG_HITBOX.h,
  };
}
