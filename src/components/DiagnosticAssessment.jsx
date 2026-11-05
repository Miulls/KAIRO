import React, { useState, useEffect } from 'react';
import { diagnosticQuestions } from '../data/diagnosticQuestions';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import AudioButton from './AudioButton';

export default function DiagnosticAssessment({ student, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [speedSlow, setSpeedSlow] = useState(false);

  const currentItem = diagnosticQuestions[currentIndex];
  const progressPercent = Math.round(((currentIndex) / diagnosticQuestions.length) * 100);

  // Reproducir automáticamente la instrucción con voz tranquila al cambiar de pregunta
  useEffect(() => {
    setSelectedOption(null);
    setFeedback(null);
    const textToSpeak = `${currentItem.prompt}. ${currentItem.readingPassage ? 'Lectura: ' + currentItem.readingPassage : ''}`;
    audioService.speak(currentItem.audioPrompt || textToSpeak, `diag-q-${currentItem.id}`);
  }, [currentIndex]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    audioService.speak(option, `opt-${option}`);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentItem.answer;
    audioService.playChime(isCorrect);

    const newAnswers = {
      ...answers,
      [currentItem.id]: {
        selected: selectedOption,
        isCorrect,
        competency: currentItem.competency
      }
    };
    setAnswers(newAnswers);

    setFeedback({
      isCorrect,
      msg: isCorrect ? '¡Excelente respuesta!' : 'Respuesta registrada. Continuemos.',
      tip: currentItem.explanation
    });

    audioService.speak(
      isCorrect
        ? `¡Excelente! ${currentItem.explanation}`
        : `Respuesta guardada. ${currentItem.explanation}`,
      'feedback-diag'
    );
  };

  const handleNext = () => {
    if (currentIndex + 1 < diagnosticQuestions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishDiagnostic(answers);
    }
  };

  const finishDiagnostic = (finalAnswers) => {
    // Cálculo por competencias
    const competencies = {
      vocabulario: { correct: 0, total: 0 },
      gramatica: { correct: 0, total: 0 },
      comprension_lectora: { correct: 0, total: 0 },
      comprension_oral: { correct: 0, total: 0 }
    };

    let totalCorrect = 0;
    diagnosticQuestions.forEach(q => {
      const ans = finalAnswers[q.id];
      if (competencies[q.competency]) {
        competencies[q.competency].total += 1;
        if (ans && ans.isCorrect) {
          competencies[q.competency].correct += 1;
          totalCorrect += 1;
        }
      }
    });

    const scorePercentage = Math.round((totalCorrect / diagnosticQuestions.length) * 100);
    let level = 'Inicial';
    if (scorePercentage >= 80) level = 'Avanzado';
    else if (scorePercentage >= 50) level = 'Intermedio';

    // Identificar áreas de mayor dificultad (menos del 60% de aciertos)
    const areasToReinforce = [];
    if ((competencies.vocabulario.correct / competencies.vocabulario.total) < 0.6) {
      areasToReinforce.push('Vocabulario y Ortografía');
    }
    if ((competencies.gramatica.correct / competencies.gramatica.total) < 0.6) {
      areasToReinforce.push('Gramática y Estructura');
    }
    if ((competencies.comprension_lectora.correct / competencies.comprension_lectora.total) < 0.6) {
      areasToReinforce.push('Comprensión Lectora');
    }
    if (competencies.comprension_oral.total > 0 && (competencies.comprension_oral.correct / competencies.comprension_oral.total) < 0.6) {
      areasToReinforce.push('Comprensión Oral');
    }

    const diagnosticResult = {
      studentId: student.id,
      studentName: student.name,
      totalQuestions: diagnosticQuestions.length,
      totalCorrect,
      scorePercentage,
      level,
      competencies,
      areasToReinforce,
      answers: finalAnswers
    };

    storageService.saveDiagnostic(student.id, diagnosticResult);
    onComplete(diagnosticResult);
  };

  const toggleSpeed = () => {
    const nextState = !speedSlow;
    setSpeedSlow(nextState);
    audioService.setSlowSpeed(nextState);
  };

  return (
    <div className="diagnostic-container panel">
      <div className="diag-header">
        <div className="diag-meta">
          <span className="eyebrow">EVALUACIÓN DIAGNÓSTICA INICIAL · ESPAÑOL</span>
          <h2>Pregunta {currentIndex + 1} de {diagnosticQuestions.length}</h2>
          <span className="pill pill-comp">{currentItem.competencyLabel}</span>
        </div>
        <div className="audio-controls-bar">
          <button
            type="button"
            className={`speed-btn ${speedSlow ? 'active' : ''}`}
            onClick={toggleSpeed}
            title="Cambiar velocidad de la voz"
          >
            🐢 {speedSlow ? 'Voz Lenta' : 'Voz Normal'}
          </button>
          <AudioButton
            id={`repeat-q-${currentItem.id}`}
            text={currentItem.audioPrompt || currentItem.prompt}
            label="Repetir instrucción"
            size="small"
          />
        </div>
      </div>

      <div className="diag-progress-bar">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Lectura contextualizada si aplica */}
      {currentItem.readingPassage && (
        <div className="reading-card">
          <div className="reading-header">
            <strong>📖 Texto para leer o escuchar:</strong>
            <AudioButton
              id={`passage-${currentItem.id}`}
              text={currentItem.readingPassage}
              label="Escuchar texto completo"
              size="small"
            />
          </div>
          <p className="reading-text">{currentItem.readingPassage}</p>
        </div>
      )}

      <div className="question-prompt-box">
        <h3>{currentItem.prompt}</h3>
      </div>

      <div className="options-grid">
        {currentItem.options.map((opt, i) => {
          const isSelected = selectedOption === opt;
          return (
            <div
              key={i}
              className={`option-card ${isSelected ? 'selected' : ''}`}
              onClick={() => !feedback && handleSelect(opt)}
            >
              <div className="opt-letter">{String.fromCharCode(65 + i)}</div>
              <div className="opt-text">{opt}</div>
              <AudioButton
                id={`opt-btn-${currentItem.id}-${i}`}
                text={opt}
                label=""
                size="small"
              />
            </div>
          );
        })}
      </div>

      {!feedback ? (
        <div className="diag-actions">
          <button
            type="button"
            className="primary large-btn"
            disabled={!selectedOption}
            onClick={handleConfirmAnswer}
          >
            Confirmar respuesta ✓
          </button>
        </div>
      ) : (
        <div className={`feedback-banner ${feedback.isCorrect ? 'good' : 'neutral'}`}>
          <div className="feedback-content">
            <strong>{feedback.msg}</strong>
            <p>{feedback.tip}</p>
          </div>
          <button type="button" className="primary" onClick={handleNext}>
            {currentIndex + 1 < diagnosticQuestions.length ? 'Siguiente pregunta →' : 'Ver resultados diagnósticos →'}
          </button>
        </div>
      )}
    </div>
  );
}
