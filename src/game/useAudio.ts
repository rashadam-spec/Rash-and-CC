import { useRef, useState, useEffect, useCallback } from 'react';

// ─── Melody ─────────────────────────────────────────────────────────────────
// C major pentatonic, cheerful Easter tune, 120 BPM
// [frequency Hz, duration ms]
const MELODY: [number, number][] = [
  [659.25, 250], [784.00, 250], [880.00, 250], [784.00, 250],
  [659.25, 250], [587.33, 250], [523.25, 500],
  [784.00, 250], [659.25, 250], [587.33, 250], [659.25, 250],
  [523.25, 500],
  [659.25, 250], [587.33, 250], [880.00, 250], [784.00, 250],
  [659.25, 250], [784.00, 250], [587.33, 250], [659.25, 250],
  [587.33, 500],
  [659.25, 125], [587.33, 125], [523.25, 125], [587.33, 125],
  [659.25, 250], [784.00, 250], [659.25, 250], [587.33, 250],
  [523.25, 500],
];

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AudioControls {
  playJump: () => void;
  playDoubleJump: () => void;
  playEggCollect: () => void;
  playGameOver: () => void;
  playBossWarning: () => void;
  startMusic: () => Promise<void>;
  stopMusic: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAudio(): AudioControls {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const musicTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isMutedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  function getOrCreateCtx(): AudioContext {
    if (ctxRef.current?.state === 'closed') {
      ctxRef.current = null;
    }
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      const master = ctxRef.current.createGain();
      master.gain.value = 1;
      master.connect(ctxRef.current.destination);
      masterGainRef.current = master;
    }
    return ctxRef.current;
  }

  // iOS Safari requires AudioContext.resume() to be called within a user
  // gesture AND awaited before scheduling any audio. This also plays a silent
  // buffer — a well-known iOS unlock pattern.
  async function unlockCtx(): Promise<AudioContext> {
    const ctx = getOrCreateCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    // Unlock iOS by playing a zero-length silent buffer
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    return ctx;
  }

  function getDest(): AudioNode {
    return masterGainRef.current ?? getOrCreateCtx().destination;
  }

  // ── Sound Effect Helpers ──────────────────────────────────────────────────

  function osc(
    ctx: AudioContext,
    dest: AudioNode,
    type: OscillatorType,
    freqStart: number,
    freqEnd: number,
    gainPeak: number,
    duration: number,
    startOffset = 0,
  ) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const now = ctx.currentTime + startOffset;
    o.type = type;
    o.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart) {
      o.frequency.linearRampToValueAtTime(freqEnd, now + duration);
    }
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gainPeak, now + 0.005);
    g.gain.linearRampToValueAtTime(0, now + duration);
    o.connect(g);
    g.connect(dest);
    o.start(now);
    o.stop(now + duration + 0.01);
  }

  // ── Sound Effects ─────────────────────────────────────────────────────────
  // These are called after startMusic has already unlocked the ctx, so they
  // can use the ctx synchronously.

  const playJump = useCallback(() => {
    if (isMutedRef.current || ctxRef.current?.state !== 'running') return;
    osc(ctxRef.current, getDest(), 'sine', 300, 600, 0.28, 0.12);
  }, []);

  const playDoubleJump = useCallback(() => {
    if (isMutedRef.current || ctxRef.current?.state !== 'running') return;
    const ctx = ctxRef.current;
    const dest = getDest();
    osc(ctx, dest, 'sine', 450, 900, 0.30, 0.15);
    osc(ctx, dest, 'sine', 600, 1200, 0.14, 0.10, 0.02);
  }, []);

  const playEggCollect = useCallback(() => {
    if (isMutedRef.current || ctxRef.current?.state !== 'running') return;
    const ctx = ctxRef.current;
    const dest = getDest();
    [523.25, 659.25, 784.00].forEach((freq, i) => {
      osc(ctx, dest, 'triangle', freq, freq, 0.35, 0.10, i * 0.06);
    });
  }, []);

  const playGameOver = useCallback(() => {
    if (isMutedRef.current || ctxRef.current?.state !== 'running') return;
    const ctx = ctxRef.current;
    const dest = getDest();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.connect(dest);
    [400, 300, 200].forEach((freq, i) => {
      osc(ctx, filter, 'sawtooth', freq, freq * 0.85, 0.3, 0.25, i * 0.18);
    });
  }, []);

  const playBossWarning = useCallback(() => {
    if (isMutedRef.current || ctxRef.current?.state !== 'running') return;
    const ctx = ctxRef.current;
    const dest = getDest();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.connect(dest);
    osc(ctx, filter, 'square', 440, 440, 0.35, 0.25);
    osc(ctx, filter, 'square', 370, 330, 0.40, 0.35, 0.20);
    // Low rumble
    const bufLen = Math.floor(ctx.sampleRate * 0.5);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buf;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 200;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + 0.5);
  }, []);

  // ── Background Music ──────────────────────────────────────────────────────

  function scheduleNote() {
    if (!isPlayingRef.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const dest = getDest();
    const [freq, dur] = MELODY[noteIndexRef.current];

    if (!isMutedRef.current && ctx.state === 'running') {
      osc(ctx, dest, 'triangle', freq, freq, 0.16, (dur - 50) / 1000);
      osc(ctx, dest, 'sine', freq / 2, freq / 2, 0.07, (dur - 50) / 1000);
    }

    noteIndexRef.current = (noteIndexRef.current + 1) % MELODY.length;
    musicTimerRef.current = setTimeout(scheduleNote, dur - 10);
  }

  const startMusic = useCallback(async () => {
    stopMusicInternal();
    // Unlock AudioContext — must be called in a user gesture and awaited
    // before scheduling any audio (required by iOS Safari)
    await unlockCtx();
    noteIndexRef.current = 0;
    isPlayingRef.current = true;
    scheduleNote();
  }, []);

  function stopMusicInternal() {
    isPlayingRef.current = false;
    if (musicTimerRef.current !== null) {
      clearTimeout(musicTimerRef.current);
      musicTimerRef.current = null;
    }
  }

  const stopMusic = useCallback(() => {
    stopMusicInternal();
  }, []);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    if (masterGainRef.current && ctxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        isMutedRef.current ? 0 : 1,
        ctxRef.current.currentTime,
        0.02,
      );
    }
    setIsMuted(isMutedRef.current);
  }, []);

  useEffect(() => {
    return () => {
      stopMusicInternal();
      ctxRef.current?.close();
    };
  }, []);

  return {
    playJump,
    playDoubleJump,
    playEggCollect,
    playGameOver,
    playBossWarning,
    startMusic,
    stopMusic,
    toggleMute,
    isMuted,
  };
}
