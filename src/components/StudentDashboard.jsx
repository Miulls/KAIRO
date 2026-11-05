import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { adaptiveEngine } from '../services/adaptiveEngine';
import AudioButton from './AudioButton';
import ActivityRenderer from './ActivityRenderer';
import ActivityResultsScreen from './ActivityResultsScreen';
import DiagnosticAssessment from './DiagnosticAssessment';
import DiagnosticResultsScreen from './DiagnosticResultsScreen';

export default function StudentDashboard({ student, onLogout }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'diagnostic' | 'diagnostic-results' | 'activities' | 'results'
  const [diagnostic, setDiagnostic] = useState(null);
  const [progress, setProgress] = useState(null);
  const [recommendedActivities, setRecommendedActivities] = useState([]);
  const [currentActIndex, setCurrentActIndex] = useState(0);

  // Estado para la pantalla de resultados de la actividad recién completada
  const [lastActivityResult, setLastActivityResult] = useState(null);

  useEffect(() => {
    loadStudentData();
  }, [student.id]);

  const loadStudentData = () => {
    const diag = storageService.getDiagnostic(student.id);
    const prog = storageService.getStudentProgress(student.id);
    setDiagnostic(diag);
    setProgress(prog);

    // Obtener actividades integradas + módulos locales subidos por docentes
    const localModules = storageService.getUploadedModules();
    const extraActivities = localModules.flatMap(m => m.activities || []);

    const recs = adaptiveEngine.getRecommendedActivities(diag, prog, extraActivities);
    setRecommendedActivities(recs);

    // Si no tiene diagnóstico, sugerirle directamente ir a la evaluación
    if (!diag) {
      setActiveTab('diagnostic');
    }
  };

  const handleDiagnosticComplete = (diagResult) => {
    setDiagnostic(diagResult);
    const localModules = storageService.getUploadedModules();
    const extraActivities = localModules.flatMap(m => m.activities || []);
    const updatedRecs = adaptiveEngine.getRecommendedActivities(diagResult, progress, extraActivities);
    setRecommendedActivities(updatedRecs);
    // Mostrar pantalla de resultados diagnósticos para que pueda descargar su JSON
    setActiveTab('diagnostic-results');
  };

  const handleAnswerCompleted = (isCorrect, activity) => {
    const updatedAttempts = (progress.attempts || 0) + 1;
    const updatedCorrect = (progress.correct || 0) + (isCorrect ? 1 : 0);

    const updatedCompetencies = { ...progress.competencies };
    const compKey = activity.competency;
    if (updatedCompetencies[compKey]) {
      updatedCompetencies[compKey].total += 1;
      if (isCorrect) updatedCompetencies[compKey].correct += 1;
    }

    // Sistema de logros pedagógicos
    const updatedRewards = [...(progress.rewards || [])];
    if (updatedAttempts === 1 && !updatedRewards.includes('Primera Actividad')) {
      updatedRewards.push('Primera Actividad');
    }
    if (updatedCorrect >= 5 && !updatedRewards.includes('Lector Constante')) {
      updatedRewards.push('Lector Constante (5 aciertos)');
    }
    if (updatedCorrect >= 10 && !updatedRewards.includes('Maestría en Español')) {
      updatedRewards.push('Maestría en Español (10 aciertos)');
    }

    const historyItem = {
      activityId: activity.id,
      title: activity.title,
      competency: activity.competency,
      isCorrect,
      at: new Date().toISOString()
    };

    const newProgress = {
      ...progress,
      attempts: updatedAttempts,
      correct: updatedCorrect,
      completedActivities: (progress.completedActivities || 0) + 1,
      competencies: updatedCompetencies,
      rewards: updatedRewards,
      history: [...(progress.history || []), historyItem]
    };

    setProgress(newProgress);
    storageService.saveStudentProgress(student.id, newProgress);

    // Guardar contexto para la pantalla de resultados
    setLastActivityResult({
      activity,
      isCorrect,
      correctCount: isCorrect ? 1 : 0,
      totalQuestions: 1,
      historyItem
    });
  };

  const handleShowResults = (isCorrect) => {
    const currentActivity = recommendedActivities[currentActIndex];
    setLastActivityResult({
      activity: currentActivity,
      isCorrect,
      correctCount: isCorrect ? 1 : 0,
      totalQuestions: 1,
      historyItem: {
        activityId: currentActivity.id,
        title: currentActivity.title,
        isCorrect,
        at: new Date().toISOString()
      }
    });
    setActiveTab('results');
  };

  const handleRestartCurrentActivity = () => {
    setActiveTab('activities');
  };

  const handleNextActivity = () => {
    if (currentActIndex + 1 < recommendedActivities.length) {
      setCurrentActIndex(currentActIndex + 1);
    } else {
      // Si completó todas las actividades del bloque, mostrar la pantalla de resultados
      handleShowResults(true);
      return;
    }
    setActiveTab('activities');
  };

  const accuracy = progress?.attempts > 0
    ? Math.round((progress.correct / progress.attempts) * 100)
    : 0;

  const pedagogicalFeedback = adaptiveEngine.getPedagogicalFeedback(progress, diagnostic);

  return (
    <div className="student-dashboard mobile-layout">
      {/* Barra superior del estudiante (en móvil o escritorio) */}
      <div className="student-subnav">
        <div className="student-profile-pill">
          <span className="profile-emoji">🎒</span>
          <div className="profile-text-group">
            <strong>{student.name}</strong>
            <small>{student.code} · {student.grade}</small>
          </div>
        </div>
        <div className="nav-buttons-group desktop-only-nav">
          <button
            className={`subnav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            🏠 Mi Panel
          </button>
          <button
            className={`subnav-btn ${activeTab === 'activities' || activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            ✏️ Mis Actividades
          </button>
          <button
            className={`subnav-btn ${activeTab === 'diagnostic' || activeTab === 'diagnostic-results' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagnostic')}
          >
            📋 {diagnostic ? 'Repetir Diagnóstico' : 'Diagnóstico'}
          </button>
          <button className="subnav-btn logout" onClick={onLogout}>
            Salir ⎋
          </button>
        </div>
      </div>

      {activeTab === 'home' && (
        <div className="dashboard-content">
          <section className="hero student-hero">
            <div className="hero-text-wrap">
              <span className="eyebrow">KAIRO · ESPAÑOL · 7.° GRADO</span>
              <h1>¡Hola, {student.name.split(' ')[0]}!</h1>
              <p>
                {diagnostic
                  ? `Nivel actual: ${diagnostic.level}. Continúa realizando tus actividades interactivas con audio y descarga tus resultados para compartirlos con tu docente.`
                  : 'Bienvenido a KAIRO. Completa tu Diagnóstico Inicial para crear tu ruta personalizada de Español.'}
              </p>
              <div className="action-row hero-actions">
                {diagnostic ? (
                  <button className="primary hero-main-btn" onClick={() => setActiveTab('activities')}>
                    Comenzar actividades →
                  </button>
                ) : (
                  <button className="primary hero-main-btn" onClick={() => setActiveTab('diagnostic')}>
                    Iniciar Diagnóstico →
                  </button>
                )}
                <AudioButton
                  id="dash-welcome"
                  text={`Hola ${student.name}. Bienvenido a KAIRO. ${diagnostic ? 'Tu nivel en español es ' + diagnostic.level : 'Te sugerimos realizar tu evaluación diagnóstica'}`}
                  label="Escuchar"
                  size="small"
                />
              </div>
            </div>
            <div className="hero-art">🇵🇦<span>📖</span><span>⭐</span></div>
          </section>

          {/* Estadísticas de progreso táctiles */}
          <section className="stats">
            <article>
              <small>Actividades completadas</small>
              <strong>{progress?.completedActivities || 0}</strong>
            </article>
            <article>
              <small>Precisión acumulada</small>
              <strong>{accuracy}%</strong>
            </article>
            <article>
              <small>Nivel pedagógico</small>
              <strong>{diagnostic?.level || 'Sin diagnóstico'}</strong>
            </article>
          </section>

          {/* Orientación adaptativa pedagógica */}
          <section className="panel">
            <div className="panel-head-flex">
              <div>
                <h2>Ruta Adaptativa en KAIRO</h2>
                <p>El tutor analiza tus aciertos y diseña una ruta continua de actividades a tu medida:</p>
              </div>
              <AudioButton
                id="adaptive-tip"
                text={`${pedagogicalFeedback.recommendation} Área de enfoque: ${pedagogicalFeedback.focusCompetency}`}
                label="Escuchar recomendación"
                size="small"
              />
            </div>
            <div className="recommendation-badge">
              <strong>💡 Recomendación del Tutor:</strong> {pedagogicalFeedback.recommendation}
            </div>

            <div className="progress">
              <span style={{ width: `${accuracy}%` }} />
            </div>
            <small>{accuracy}% de efectividad general acumulada</small>
          </section>

          {/* Logros alcanzados */}
          <section className="panel rewards-panel">
            <h2>🏆 Tus Logros y Reconocimientos</h2>
            <div className="rewards-grid">
              {(progress?.rewards || []).map((rw, idx) => (
                <div key={idx} className="reward-badge">
                  <span className="reward-icon">🎖️</span>
                  <span>{rw}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'diagnostic' && (
        <DiagnosticAssessment
          student={student}
          onComplete={handleDiagnosticComplete}
        />
      )}

      {activeTab === 'diagnostic-results' && diagnostic && (
        <DiagnosticResultsScreen
          student={student}
          diagnostic={diagnostic}
          onRestart={() => setActiveTab('diagnostic')}
          onContinue={() => setActiveTab('activities')}
        />
      )}

      {activeTab === 'activities' && (
        <div className="activities-screen">
          <div className="activities-top-bar">
            <span>
              Actividad en curso: <strong>{currentActIndex + 1}</strong> de {recommendedActivities.length}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="secondary" onClick={() => handleShowResults(true)}>
                Terminar y ver resultados
              </button>
              <button className="secondary" onClick={() => setActiveTab('home')}>
                ← Volver al panel
              </button>
            </div>
          </div>
          {recommendedActivities.length > 0 && (
            <ActivityRenderer
              activity={recommendedActivities[currentActIndex]}
              onAnswerCompleted={handleAnswerCompleted}
              onNextActivity={handleNextActivity}
              onShowResults={handleShowResults}
            />
          )}
        </div>
      )}

      {activeTab === 'results' && lastActivityResult && (
        <ActivityResultsScreen
          student={student}
          activity={lastActivityResult.activity}
          isCorrect={lastActivityResult.isCorrect}
          correctCount={progress?.correct || lastActivityResult.correctCount}
          totalQuestions={progress?.attempts || lastActivityResult.totalQuestions}
          history={progress?.history || [lastActivityResult.historyItem]}
          onRestart={handleRestartCurrentActivity}
          onNextActivity={handleNextActivity}
          hasMoreActivities={recommendedActivities.length > 1}
        />
      )}

      {/* Barra de Navegación Inferior Móvil (Bottom Navigation Bar) */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Inicio</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <span className="nav-icon">✏️</span>
          <span className="nav-label">Actividades</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'diagnostic' || activeTab === 'diagnostic-results' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagnostic')}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Diagnóstico</span>
        </button>
        <button
          className="mobile-nav-item logout"
          onClick={onLogout}
        >
          <span className="nav-icon">⎋</span>
          <span className="nav-label">Salir</span>
        </button>
      </nav>
    </div>
  );
}
