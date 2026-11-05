import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';

/**
 * Botón interactivo de audio accesible con estado visual de reproducción
 */
export default function AudioButton({ text, id, label = 'Escuchar', size = 'medium', className = '' }) {
  const [audioState, setAudioState] = useState({
    isPlaying: audioService.isPlaying,
    currentPlayingId: audioService.currentPlayingId
  });

  useEffect(() => {
    return audioService.subscribe(setAudioState);
  }, []);

  const isCurrent = audioState.isPlaying && audioState.currentPlayingId === id;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      audioService.stop();
    } else {
      audioService.speak(text, id);
    }
  };

  return (
    <button
      type="button"
      className={`audio-btn ${size} ${isCurrent ? 'playing' : ''} ${className}`}
      onClick={handleClick}
      title={isCurrent ? 'Detener audio' : `Escuchar: ${text}`}
      aria-label={label}
    >
      <span className="audio-icon">{isCurrent ? '⏹️' : '🔊'}</span>
      {label && <span className="audio-label">{label}</span>}
      {isCurrent && <span className="audio-pulse" />}
    </button>
  );
}
