// Motor Adaptativo Pedagógico para la asignatura de Español en KAIRO
// Adapta la secuencia de actividades basándose en:
// 1. Diagnóstico inicial del estudiante (competencias prioritarias)
// 2. Historial de aciertos y errores en tiempo real
// 3. Reglas pedagógicas de nivelación progresiva (Inicial -> Intermedio -> Avanzado)
// 4. Inclusión de actividades dinámicas de módulos subidos por el docente

import { activitiesBank } from '../data/activitiesBank';

export const adaptiveEngine = {
  /**
   * Genera una lista ordenada de actividades recomendadas para el estudiante
   * @param {object} diagnostic - Objeto de evaluación diagnóstica
   * @param {object} progress - Progreso acumulado del estudiante
   * @param {Array} extraActivities - Actividades provenientes de módulos subidos por docentes
   * @returns {Array} Actividades priorizadas
   */
  getRecommendedActivities(diagnostic, progress, extraActivities = []) {
    const fullBank = [...activitiesBank, ...extraActivities];

    if (!diagnostic) {
      return fullBank;
    }

    const { competencies, level } = diagnostic;

    // Priorizar competencias donde el estudiante obtuvo menor porcentaje
    const compScores = [
      { comp: 'vocabulario', score: competencies?.vocabulario ? (competencies.vocabulario.correct / Math.max(1, competencies.vocabulario.total)) : 0.5 },
      { comp: 'gramatica', score: competencies?.gramatica ? (competencies.gramatica.correct / Math.max(1, competencies.gramatica.total)) : 0.5 },
      { comp: 'comprension_lectora', score: competencies?.comprension_lectora ? (competencies.comprension_lectora.correct / Math.max(1, competencies.comprension_lectora.total)) : 0.5 },
      { comp: 'comprension_oral', score: competencies?.comprension_oral ? (competencies.comprension_oral.correct / Math.max(1, competencies.comprension_oral.total)) : 0.5 }
    ];

    compScores.sort((a, b) => a.score - b.score);

    const sortedActivities = [...fullBank].sort((a, b) => {
      // Prioridad 1: Competencia más débil primero
      const rankA = compScores.findIndex(c => c.comp === a.competency);
      const rankB = compScores.findIndex(c => c.comp === b.competency);

      if (rankA !== -1 && rankB !== -1 && rankA !== rankB) {
        return rankA - rankB;
      }

      // Prioridad 2: Nivel adecuado al estudiante
      const levelPriority = { 'Inicial': 1, 'Intermedio': 2, 'Avanzado': 3 };
      const studentTarget = levelPriority[level] || 2;
      const diffA = Math.abs((levelPriority[a.level] || 2) - studentTarget);
      const diffB = Math.abs((levelPriority[b.level] || 2) - studentTarget);

      return diffA - diffB;
    });

    return sortedActivities;
  },

  /**
   * Analiza el desempeño reciente y entrega recomendaciones formativas
   */
  getPedagogicalFeedback(progress, diagnostic) {
    const attempts = progress?.attempts || 0;
    const correct = progress?.correct || 0;
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

    if (attempts === 0) {
      return {
        recommendation: 'Comienza explorando las actividades interactivas con audio.',
        focusCompetency: diagnostic?.areasToReinforce?.[0] || 'Vocabulario y Ortografía'
      };
    }

    if (accuracy >= 85) {
      return {
        recommendation: 'Excelente dominio. Puedes avanzar a textos más largos y retos de vocabulario avanzado.',
        focusCompetency: 'Comprensión Lectora y Expresión Oral'
      };
    } else if (accuracy >= 60) {
      return {
        recommendation: 'Buen avance. Practica la estructura de oraciones y conectores de causa.',
        focusCompetency: 'Gramática y Estructura'
      };
    } else {
      return {
        recommendation: 'Te sugerimos escuchar los audios a velocidad lenta y repasar las sílabas y reglas ortográficas.',
        focusCompetency: 'Vocabulario y Ortografía Básica'
      };
    }
  }
};
