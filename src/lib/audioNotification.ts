/**
 * Web Audio API based subtle, professional notification chime/buzz.
 * Self-contained, zero external asset dependencies, zero network latency.
 * Complies strictly with browser autoplay policies: only plays after user interaction.
 */

export function playThresholdExceededSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Check if context is suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Master gentle gain (volume ~ 0.12 - calm and professional)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    // Warm two-tone acoustic chime (F4 -> D4 chord-like progression)
    // Tone 1: 349.23 Hz (F4)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(349.23, now);
    osc1.frequency.exponentialRampToValueAtTime(293.66, now + 0.28); // Glides to D4

    // Tone 2: Soft harmonic overtones (587.33 Hz / D5) for pleasantness
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(587.33, now);
    osc2.frequency.exponentialRampToValueAtTime(440.00, now + 0.25);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.04, now);
    osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    // Subtle low-pass filter to ensure sound is warm, never harsh
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.40);
    osc2.stop(now + 0.40);

    // Close context after playback
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 500);
  } catch (e) {
    // Fail silently if browser audio is completely disabled or blocked
    console.debug('Browser audio blocked or unsupported:', e);
  }
}
