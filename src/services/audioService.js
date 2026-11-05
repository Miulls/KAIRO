// Servicio de Audio y Accesibilidad Offline-First para KAIRO
// Diseñado para funcionar 100% sin Internet mediante la SpeechSynthesis API nativa del navegador.
// Incluye control de velocidad (normal y lenta), detección de pronunciación en español,
// estados de reproducción observables y un sintetizador fallback Web Audio API.

class AudioService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.currentPlayingId = null;
    this.rate = 0.95; // Velocidad normal pedagógica
    this.isSlow = false;
    this.listeners = new Set();
    this.selectedVoice = null;

    if (this.synth) {
      this.initVoice();
      if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioridad: español panameño (es-PA) -> español latinoamericano -> español general
    this.selectedVoice = voices.find(v => v.lang === 'es-PA') ||
      voices.find(v => v.lang === 'es-MX' || v.lang === 'es-US' || v.lang === 'es-419') ||
      voices.find(v => v.lang.startsWith('es')) ||
      null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(cb => cb({
      isPlaying: this.isPlaying,
      currentPlayingId: this.currentPlayingId,
      isSlow: this.isSlow
    }));
  }

  setSlowSpeed(enableSlow) {
    this.isSlow = enableSlow;
    this.rate = enableSlow ? 0.65 : 0.95;
    this.notify();
  }

  toggleSpeed() {
    this.setSlowSpeed(!this.isSlow);
    return this.isSlow;
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.currentPlayingId = null;
    this.notify();
  }

  /**
   * Reproduce un texto en español con accesibilidad y control de concurrencia
   * @param {string} text - Texto o frase a pronunciar
   * @param {string} [id] - Identificador único opcional para marcar visualmente el elemento
   * @param {object} [options] - Opciones adicionales (rate, onEnd)
   */
  speak(text, id = 'global', options = {}) {
    if (!text) return;

    // Detener cualquier audio previo para evitar superposición
    this.stop();

    if (!this.synth) {
      console.warn('SpeechSynthesis no disponible en este entorno.');
      return;
    }

    // Limpieza de caracteres de marcado para una lectura fonética limpia
    const cleanText = text
      .replace(/_{2,}/g, 'espacio en blanco')
      .replace(/[•→←]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-PA';
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = options.rate || (this.isSlow ? 0.65 : 0.95);
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isPlaying = true;
      this.currentPlayingId = id;
      this.notify();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.currentPlayingId = null;
      this.notify();
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Evento error de síntesis en KAIRO:', e);
      this.isPlaying = false;
      this.currentPlayingId = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  // Reproducción de sonido de refuerzo positivo o de reintento offline
  playChime(isPositive = true) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isPositive) {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      } else {
        osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
        osc.frequency.linearRampToValueAtTime(261.63, ctx.currentTime + 0.25); // C4
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Ignorar si el audio context está bloqueado antes del primer gesto
    }
  }
}

export const audioService = new AudioService();
