/**
 * PharmSentinel AI - Web Audio Alert Synthesizer
 * Generates synthetic hospital-grade alert chimes and sonifications
 * without requiring external sound files.
 */

class AudioAlertSystem {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
  }

  _initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound(enabled) {
    this.soundEnabled = enabled !== undefined ? enabled : !this.soundEnabled;
    return this.soundEnabled;
  }

  playScanBlip() {
    if (!this.soundEnabled) return;
    try {
      this._initContext();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.09);
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  }

  playWarningAlert() {
    if (!this.soundEnabled) return;
    try {
      this._initContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      // Dual tone (F5 -> G5)
      const freqs = [698.46, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.15, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.22);
      });
    } catch (e) {
      console.warn("Audio alert failed", e);
    }
  }

  playCriticalEmergencyAlert() {
    if (!this.soundEnabled) return;
    try {
      this._initContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      // High urgency rapid medical alert: 3 pulsing high tones (B5, D6, F#6)
      const tones = [987.77, 1174.66, 1479.98];
      tones.forEach((tone, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        
        // Low pass filter to soften the harshness of sawtooth
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);

        osc.frequency.setValueAtTime(tone, now + idx * 0.1);
        gain.gain.setValueAtTime(0.18, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.16);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.18);
      });
    } catch (e) {
      console.warn("Critical alert sound error", e);
    }
  }

  playSuccessChime() {
    if (!this.soundEnabled) return;
    try {
      this._initContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      // Harmonious Major Chord (C5 -> E5 -> G5 -> C6)
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((note, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch (e) {
      console.warn("Success sound failed", e);
    }
  }
}

// Global audio alert instance
window.audioAlerts = new AudioAlertSystem();
