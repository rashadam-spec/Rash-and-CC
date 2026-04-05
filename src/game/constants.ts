export const GROUND_Y = 80;           // px from bottom of game area
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 400;
export const BUNNY_X = 120;           // fixed horizontal position

export const BASE_SPEED = 0.3;        // px/ms
export const MAX_SPEED = 0.75;        // px/ms

export const GRAVITY = 0.0018;        // px/ms²
export const JUMP_VELOCITY = -0.55;   // px/ms (negative = up)
export const MAX_JUMPS = 2;           // double-jump support

export const SPAWN_INTERVAL_MIN = 1200; // ms between obstacles
export const SPAWN_INTERVAL_MAX = 2800;

export const SCORE_PER_MS = 0.003;
export const EGG_BONUS = 50;
export const SPEED_RAMP_INTERVAL = 500; // score pts between speed bumps
export const SPEED_RAMP_FACTOR = 0.10;

// Hitboxes (forgiveness-shrunk ~15%)
export const BUNNY_HITBOX   = { w: 40, h: 50, offsetX: 8, offsetY: 4 };
export const BASKET_HITBOX  = { w: 44, h: 38, offsetX: 6, offsetY: 2 };
export const CHICK_HITBOX   = { w: 30, h: 28, offsetX: 5, offsetY: 2 };
export const FENCE_HITBOX   = { w: 18, h: 52, offsetX: 6, offsetY: 2 };
export const EGG_HITBOX     = { w: 24, h: 30, offsetX: 4, offsetY: 2 };

// Visual sizes
export const BUNNY_W = 56;
export const BUNNY_H = 58;
export const BASKET_W = 56;
export const BASKET_H = 42;
export const CHICK_W = 40;
export const CHICK_H = 32;
export const FENCE_W = 30;
export const FENCE_H = 56;
export const EGG_W = 32;
export const EGG_H = 38;

export const EGG_COLORS = ['#f9a8d4', '#fde68a', '#a5f3fc', '#c4b5fd', '#bbf7d0'];

// Boss obstacle (requires double jump to clear — single jump apex ~84px, boss height 94px)
export const BOSS_MIN_SCORE    = 200;
export const BOSS_SPAWN_CHANCE = 0.15;
export const BOSS_W            = 64;
export const BOSS_H            = 94;
export const BOSS_HITBOX       = { w: 52, h: 80, offsetX: 6, offsetY: 2 };
export const BOSS_WARN_X       = 650;   // trigger warning banner when boss crosses this x
