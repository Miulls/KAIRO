import React from 'react';
import AudioButton from './AudioButton';

export default function WelcomeScreen({ onSelectRole }) {
  return (
    <div className="welcome-container">
      <div className="welcome-card hero">
        <div>
          <span className="eyebrow">KAIRO · APRENDIZAJE PORTÁTIL Y RESILIENTE</span>
          <h1>¡Bienvenido a KAIRO!</h1>
          <p className="kairo-motto">
            <strong>KAIRO</strong> — Aprendizaje portátil y offline para mantener la educación en adversidades y catástrofes.
          </p>
          <p>
            Inspirado en el concepto griego <em>Kairós</em>: el momento oportuno para que el aprendizaje continúe sin interrupciones. Diseñado para funcionar 100% sin Internet en la asignatura de <strong>Español</strong> (7.° Grado).
          </p>
          <div className="audio-helper-row">
            <AudioButton
              id="welcome-instructions"
              text="¡Bienvenido a Kairo! Aprendizaje portátil y offline para mantener la educación en adversidades y catástrofes. Para comenzar, indica si eres estudiante o docente seleccionando una de las opciones."
              label="Escuchar bienvenida"
              size="large"
            />
          </div>
        </div>
        <div className="hero-art">
          📚<span>✏️</span><span>🇵🇦</span>
        </div>
      </div>

      <div className="role-selection-section">
        <h2>¿Cómo deseas ingresar hoy?</h2>
        <p className="subtitle">Selecciona tu perfil para acceder a tus contenidos y actividades educativas:</p>

        <div className="roles-grid">
          <div className="role-card" onClick={() => onSelectRole('student')}>
            <div className="role-icon">🎒</div>
            <h3>Soy estudiante</h3>
            <p>Ingresa con tu código o PIN para realizar tu evaluación diagnóstica, practicar actividades interactivas y descargar tus resultados para entregarlos por USB.</p>
            <div className="role-action-row">
              <button className="primary" onClick={() => onSelectRole('student')}>
                Entrar como Estudiante →
              </button>
              <AudioButton
                id="role-student-audio"
                text="Opción: Soy estudiante. Presiona aquí para ingresar con tu código o PIN a tus actividades de Español en Kairo."
                label=""
                size="small"
              />
            </div>
          </div>

          <div className="role-card" onClick={() => onSelectRole('teacher')}>
            <div className="role-icon">👩‍🏫</div>
            <h3>Soy docente</h3>
            <p>Accede con tus credenciales para revisar diagnósticos de estudiantes, analizar desempeño y subir nuevos módulos educativos desde tu equipo o memoria USB.</p>
            <div className="role-action-row">
              <button className="secondary" onClick={() => onSelectRole('teacher')}>
                Entrar como Docente →
              </button>
              <AudioButton
                id="role-teacher-audio"
                text="Opción: Soy docente. Presiona aquí para ingresar al panel de seguimiento y subir módulos de actividades en Kairo."
                label=""
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="offline-feature-banner">
        <span className="badge-offline">⚡ 100% Offline-First</span>
        <span>KAIRO opera de manera local en cualquier dispositivo. Los contenidos, audios y diagnósticos funcionan sin consumir datos ni depender de la red.</span>
      </div>
    </div>
  );
}
