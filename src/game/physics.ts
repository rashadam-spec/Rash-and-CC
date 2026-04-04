import { GRAVITY, JUMP_VELOCITY, MAX_JUMPS } from './constants';

export function applyGravity(vy: number, deltaTime: number): number {
  return vy + GRAVITY * deltaTime;
}

export function applyJumpImpulse(jumpsRemaining: number): number {
  if (jumpsRemaining <= 0) return 0; // no jump available, return sentinel
  return JUMP_VELOCITY;
}

export interface BunnyState {
  y: number;
  vy: number;
  onGround: boolean;
  jumpsRemaining: number;
}

export function updateBunnyPosition(
  y: number,
  vy: number,
  deltaTime: number,
  jumpsRemaining: number
): BunnyState {
  const newVY = applyGravity(vy, deltaTime);
  let newY = y - newVY * deltaTime; // y increases downward, so subtract

  let onGround = false;
  let newJumps = jumpsRemaining;

  if (newY <= 0) {
    newY = 0;
    onGround = true;
    newJumps = MAX_JUMPS;
    return { y: newY, vy: 0, onGround, jumpsRemaining: newJumps };
  }

  return { y: newY, vy: newVY, onGround, jumpsRemaining: newJumps };
}

