import React from 'react';
import AudioButton from './AudioButton';

/**
 * Pantalla de Resultados de Actividad de KAIRO
 * Permite descargar el archivo JSON para transferencia offline (Quick Share, Bluetooth, etc.)
 */
export default function ActivityResultsScreen({
  student,
  activity,
  isCorrect,
  correctCount = 1,
  totalQuestions = 1,
  history = [],
  onRestart,
  onNextActivity,
  hasMoreActivities = true
}) {
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  const handleDownloadJson = () => {
    const payload = {
      sistema: 'KAIRO — Aprendizaje portátil y offline',
      version: '1.0.0-offline',
      fechaExportacion: new Date().toISOString(),
      estudiante: {
        id: student.id,
        codigo: student.code,
        nombre: student.name,
        grado: student.grade || '7.° Grado',
        docenteAsignadoId: student.teacherId || 'doc-001'
      },
      actividad: {
        id: activity.id,
        nombre: activity.title,
        tipo: activity.type,
        nivel: activity.level,
        competencia: activity.competency,
        consigna: activity.instruction
      },
      desempeno: {
        aciertos: correctCount,
        totalPreguntas: totalQuestions,
        porcentajeObtenido: percentage,
        aprobado: percentage >= 60,
        resultadoUltimoIntento: isCorrect ? 'CORRECTO' : 'REQUIRIO_APOYO'
      },
      historialDetallado: history.length > 0 ? history : [
        {
          actividadId: activity.id,
          titulo: activity.title,
          correcto: isCorrect,
          marcaTiempo: new Date().toISOString()
        }
      ]
    };

    const fileName = `KAIRO_${(student.code || 'ESTUDIANTE').toUpperCase()}_${activity.id}_${Date.now()}.json`;
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="activity-results-wrapper">
      <div className="activity-results-card panel">
        <div className="results-badge-icon">
          {percentage >= 70 ? '🎉' : '📘'}
        </div>

        <h1 className="results-headline">¡Actividad completada!</h1>

        <div className="results-activity-title">
          <span className="pill">Español · 7.° Grado</span>
          <h2>{activity.title}</h2>
          <AudioButton
            id="result-audio-title"
            text={`¡Actividad completada! Has finalizado la actividad ${activity.title}. Obtuviste ${correctCount} respuestas correctas de ${totalQuestions}, equivalente a un ${percentage} por ciento.`}
            label="Escuchar resumen"
            size="small"
          />
        </div>

        {/* Métricas clave */}
        <div className="results-metrics-grid">
          <div className="metric-box">
            <small>Respuestas correctas</small>
            <strong className="metric-number">{correctCount} / {totalQuestions}</strong>
          </div>
          <div className="metric-box highlight">
            <small>Porcentaje obtenido</small>
            <strong className="metric-number pct">{percentage}%</strong>
          </div>
        </div>

        {/* Botones de acción solicitados */}
        <div className="results-actions-stack">
          <button
            type="button"
            className="primary download-usb-btn"
            onClick={handleDownloadJson}
          >
            📥 Descargar resultados (.json)
          </button>

          <button
            type="button"
            className="secondary restart-btn"
            onClick={onRestart}
          >
            🔄 Volver a empezar
          </button>

          {hasMoreActivities && (
            <button
              type="button"
              className="primary next-act-link-btn"
              onClick={onNextActivity}
            >
              Siguiente actividad de Español →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
