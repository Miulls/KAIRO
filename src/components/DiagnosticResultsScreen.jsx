import React, { useState, useEffect } from 'react';
import AudioButton from './AudioButton';

export default function DiagnosticResultsScreen({
  student,
  diagnostic,
  onRestart,
  onContinue
}) {
  const handleDownloadDiagnosticJson = () => {
    const payload = {
      tipo: 'EVALUACION_DIAGNOSTICA_KAIRO',
      sistema: 'KAIRO — Aprendizaje portátil y offline',
      version: '1.0.0-offline',
      fechaDiagnostico: diagnostic.completedAt || new Date().toISOString(),
      estudiante: {
        id: student.id,
        codigo: student.code,
        nombre: student.name,
        grado: student.grade || '7.° Grado',
        docenteAsignadoId: student.teacherId || 'doc-001'
      },
      evaluacion: {
        totalPreguntas: diagnostic.totalQuestions || 12,
        totalCorrectas: diagnostic.totalCorrect || 0,
        porcentajeObtenido: diagnostic.scorePercentage || 0,
        nivelAsignado: diagnostic.level || 'Inicial',
        competencias: diagnostic.competencies || {},
        areasRefuerzo: diagnostic.areasToReinforce || [],
        respuestasDetalladas: diagnostic.answers || {}
      }
    };

    const fileName = `KAIRO_DIAGNOSTICO_${(student.code || 'ESTUDIANTE').toUpperCase()}_${Date.now()}.json`;
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
          🎯
        </div>

        <h1 className="results-headline">¡Diagnóstico Completado!</h1>

        <div className="results-activity-title">
          <span className="pill">Evaluación Diagnóstica Inicial · Español 7.°</span>
          <h2>Nivel Alcanzado: {diagnostic.level}</h2>
          <AudioButton
            id="diag-res-audio"
            text={`¡Diagnóstico inicial completado! Has respondido ${diagnostic.totalCorrect} de ${diagnostic.totalQuestions} preguntas correctas, logrando un puntaje de ${diagnostic.scorePercentage} por ciento. Nivel asignado: ${diagnostic.level}.`}
            label="Escuchar resultados"
            size="small"
          />
        </div>

        <div className="results-metrics-grid">
          <div className="metric-box">
            <small>Preguntas acertadas</small>
            <strong className="metric-number">{diagnostic.totalCorrect} / {diagnostic.totalQuestions}</strong>
          </div>
          <div className="metric-box highlight">
            <small>Puntaje diagnóstico</small>
            <strong className="metric-number pct">{diagnostic.scorePercentage}%</strong>
          </div>
        </div>

        {/* Resumen por competencias */}
        <div className="diag-summary-box">
          <h4>Desempeño en las 4 competencias evaluadas:</h4>
          <div className="mini-competencies-list">
            {[
              { key: 'vocabulario', label: 'Vocabulario y Ortografía' },
              { key: 'gramatica', label: 'Gramática y Sintaxis' },
              { key: 'comprension_lectora', label: 'Comprensión Lectora' },
              { key: 'comprension_oral', label: 'Comprensión Oral' }
            ].map(c => {
              const comp = diagnostic.competencies?.[c.key];
              const pct = comp && comp.total > 0 ? Math.round((comp.correct / comp.total) * 100) : 0;
              return (
                <div key={c.key} className="mini-comp-row">
                  <span>{c.label}:</span>
                  <strong>{pct}% ({comp?.correct || 0}/{comp?.total || 0})</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="results-actions-stack">
          <button
            type="button"
            className="primary download-usb-btn"
            onClick={handleDownloadDiagnosticJson}
          >
            📥 Descargar resultados diagnósticos (.json)
          </button>

          <button
            type="button"
            className="secondary restart-btn"
            onClick={onRestart}
          >
            🔄 Repetir evaluación diagnóstica
          </button>

          <button
            type="button"
            className="primary next-act-link-btn"
            onClick={onContinue}
          >
            Ir a mis actividades de Español →
          </button>
        </div>
      </div>
    </div>
  );
}
