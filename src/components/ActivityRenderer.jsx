import React, { useState, useEffect } from 'react';
import AudioButton from './AudioButton';
import { audioService } from '../services/audioService';

export default function ActivityRenderer({
  activity,
  onAnswerCompleted,
  onNextActivity,
  onShowResults
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [orderedList, setOrderedList] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [slowAudio, setSlowAudio] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setFeedback(null);
    setShowHint(false);

    // Preparar interactividad para tipo ordenamiento de palabras
    if (activity.type === 'order_sentence') {
      const words = [...activity.scrambledWords];
      setAvailableWords(words.sort(() => 0.5 - Math.random()));
      setOrderedList([]);
    } else if (activity.type === 'story_sequence') {
      setOrderedList([]);
      setAvailableWords([...activity.steps].sort(() => 0.5 - Math.random()));
    }

    // Auto-reproducir la consigna auditiva
    const instructionText = `${activity.instruction} ${activity.sentence || activity.sentenceTemplate || activity.question || ''}`;
    audioService.speak(instructionText, `act-inst-${activity.id}`);
  }, [activity.id]);

  const toggleSpeed = () => {
    const nextVal = !slowAudio;
    setSlowAudio(nextVal);
    audioService.setSlowSpeed(nextVal);
  };

  const handleStandardSelect = (opt) => {
    setSelectedOption(opt);
    audioService.speak(opt, `opt-${opt}`);
  };

  // Manejador para ordenar oraciones (hacer clic para agregar y quitar)
  const addWordToSentence = (word, index) => {
    setOrderedList([...orderedList, word]);
    const updated = [...availableWords];
    updated.splice(index, 1);
    setAvailableWords(updated);
    audioService.speak(word, `word-${word}`);
  };

  const removeWordFromSentence = (word, index) => {
    setAvailableWords([...availableWords, word]);
    const updated = [...orderedList];
    updated.splice(index, 1);
    setOrderedList(updated);
  };

  // Manejador de comprobación
  const checkAnswer = () => {
    let isCorrect = false;

    if (activity.type === 'order_sentence') {
      const builtSentence = orderedList.join(' ');
      isCorrect = builtSentence.trim() === activity.answerText.trim();
    } else if (activity.type === 'story_sequence') {
      isCorrect = orderedList.every((item, i) => item.id === activity.correctSequence[i]) &&
        orderedList.length === activity.correctSequence.length;
    } else {
      isCorrect = selectedOption === activity.answer;
    }

    audioService.playChime(isCorrect);

    const feedbackObj = {
      isCorrect,
      title: isCorrect ? '¡Excelente trabajo! 👏' : 'Buen intento. Vamos a reflexionar:',
      message: isCorrect
        ? 'Has respondido correctamente.'
        : 'Observa la pista para consolidar tu aprendizaje.',
      tip: activity.tip
    };

    setFeedback(feedbackObj);
    onAnswerCompleted(isCorrect, activity);

    audioService.speak(
      `${feedbackObj.title}. ${isCorrect ? 'Muy bien.' : ''} ${activity.tip}`,
      'act-feedback'
    );
  };

  return (
    <div className="activity-card panel lesson">
      <div className="lesson-head">
        <span className="pill">Modalidad: {activity.title} · Nivel {activity.level}</span>
        <div className="head-controls">
          <button
            type="button"
            className={`speed-btn ${slowAudio ? 'active' : ''}`}
            onClick={toggleSpeed}
            title="Cambiar velocidad del audio"
          >
            🐢 {slowAudio ? 'Lento' : 'Normal'}
          </button>
          <AudioButton
            id={`repeat-act-${activity.id}`}
            text={`${activity.instruction}. ${activity.readingText || activity.sentence || ''}`}
            label="Repetir instrucción"
            size="small"
          />
        </div>
      </div>

      <h2 className="activity-instruction">{activity.instruction}</h2>

      {/* Renderizado condicional según tipo de actividad */}
      {activity.type === 'listen_and_select' && (
        <div className="interactive-box">
          <div className="listen-prompt-center">
            <span className="big-icon">🎧</span>
            <p>Presiona el altavoz para escuchar la palabra:</p>
            <AudioButton
              id={`audio-word-${activity.id}`}
              text={activity.spokenAudio}
              label="Escuchar palabra"
              size="large"
            />
          </div>
          <div className="choices">
            {activity.options.map(opt => (
              <button
                key={opt}
                className={selectedOption === opt ? 'active-choice' : ''}
                onClick={() => !feedback && handleStandardSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {activity.type === 'image_and_word' && (
        <div className="interactive-box">
          <div className="animal-illustration-container">
            <div className="animal-image-frame">
              <img
                src={activity.visualImageSrc || '/guacamaya.svg'}
                alt={activity.visualDesc || 'Fauna panameña'}
                className="animal-main-img"
              />
            </div>
            <p className="animal-caption">{activity.visualDesc}</p>
          </div>
          <div className="choices">
            {activity.options.map(opt => (
              <button
                key={opt}
                className={selectedOption === opt ? 'active-choice' : ''}
                onClick={() => !feedback && handleStandardSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {activity.type === 'fill_sentence' && (
        <div className="interactive-box">
          <div className="sentence-display">
            {activity.sentenceTemplate.replace('___', selectedOption || '_____')}
            <AudioButton
              id={`read-fill-${activity.id}`}
              text={activity.sentenceTemplate.replace('___', selectedOption || 'espacio en blanco')}
              label=""
              size="small"
            />
          </div>
          <div className="choices">
            {activity.options.map(opt => (
              <button
                key={opt}
                className={selectedOption === opt ? 'active-choice' : ''}
                onClick={() => !feedback && handleStandardSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {activity.type === 'order_sentence' && (
        <div className="interactive-box">
          <p className="order-hint">Haz clic en cada palabra para construir la oración:</p>
          <div className="sentence-dropzone">
            {orderedList.length === 0 ? (
              <span className="placeholder-text">Pulsa las palabras abajo en orden...</span>
            ) : (
              orderedList.map((w, idx) => (
                <span
                  key={idx}
                  className="word-pill active-pill"
                  onClick={() => !feedback && removeWordFromSentence(w, idx)}
                  title="Clic para devolver palabra"
                >
                  {w} ✕
                </span>
              ))
            )}
          </div>

          <div className="words-pool">
            {availableWords.map((w, idx) => (
              <button
                key={idx}
                type="button"
                className="word-chip-btn"
                onClick={() => !feedback && addWordToSentence(w, idx)}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {(activity.type === 'reading_comprehension' || activity.type === 'audio_comprehension') && (
        <div className="interactive-box">
          <div className="reading-card">
            <div className="reading-header">
              <strong>{activity.type === 'audio_comprehension' ? '🎙️ Narración oral' : '📖 Texto'}</strong>
              <AudioButton
                id={`read-comp-${activity.id}`}
                text={activity.readingText || activity.narrationText}
                label="Escuchar narración completa"
                size="small"
              />
            </div>
            {activity.type === 'reading_comprehension' && (
              <p className="reading-text">{activity.readingText}</p>
            )}
          </div>

          <div className="activity-question">
            <h4>{activity.question}</h4>
            <AudioButton id={`question-${activity.id}`} text={activity.question} label="" size="small" />
          </div>

          <div className="choices-vertical">
            {activity.options.map((opt, i) => (
              <div
                key={i}
                className={`choice-row ${selectedOption === opt ? 'selected' : ''}`}
                onClick={() => !feedback && handleStandardSelect(opt)}
              >
                <span>{opt}</span>
                <AudioButton id={`opt-${activity.id}-${i}`} text={opt} label="" size="small" />
              </div>
            ))}
          </div>
        </div>
      )}

      {activity.type === 'find_error' && (
        <div className="interactive-box">
          <div className="sentence-display error-highlight">
            {activity.sentence}
            <AudioButton id={`error-sentence-${activity.id}`} text={activity.sentence} label="" size="small" />
          </div>
          <p>¿Cuál de estas tres palabras presenta el error ortográfico?</p>
          <div className="choices">
            {activity.options.map(opt => (
              <button
                key={opt}
                className={selectedOption === opt ? 'active-choice' : ''}
                onClick={() => !feedback && handleStandardSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {activity.type === 'story_sequence' && (
        <div className="interactive-box">
          <p>Arma la secuencia de la historia seleccionando las partes en orden:</p>
          <div className="sequence-builder">
            {orderedList.map((item, idx) => (
              <div key={idx} className="sequence-slot filled">
                <span className="step-num">{idx + 1}</span>
                <p>{item.text}</p>
                <button
                  type="button"
                  className="remove-step-btn"
                  onClick={() => {
                    if (feedback) return;
                    setAvailableWords([...availableWords, item]);
                    const up = [...orderedList];
                    up.splice(idx, 1);
                    setOrderedList(up);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="sequence-pool">
            {availableWords.map((item, idx) => (
              <div
                key={idx}
                className="sequence-card-choice"
                onClick={() => {
                  if (feedback) return;
                  setOrderedList([...orderedList, item]);
                  const up = [...availableWords];
                  up.splice(idx, 1);
                  setAvailableWords(up);
                }}
              >
                <p>{item.text}</p>
                <AudioButton id={`step-${idx}`} text={item.text} label="" size="small" />
              </div>
            ))}
          </div>
        </div>
      )}

      {(activity.type === 'match_concepts' || activity.type === 'vocab_context') && (
        <div className="interactive-box">
          <div className="sentence-display">
            Palabra clave: <strong>«{activity.targetConcept || activity.targetWord}»</strong>
          </div>
          <div className="choices-vertical">
            {activity.options.map((opt, i) => (
              <div
                key={i}
                className={`choice-row ${selectedOption === opt ? 'selected' : ''}`}
                onClick={() => !feedback && handleStandardSelect(opt)}
              >
                <span>{opt}</span>
                <AudioButton id={`match-${i}`} text={opt} label="" size="small" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones principales y retroalimentación */}
      {!feedback ? (
        <div className="action-footer">
          <button
            type="button"
            className="secondary hint-btn"
            onClick={() => setShowHint(!showHint)}
          >
            💡 {showHint ? 'Ocultar pista' : 'Solicitar pista'}
          </button>
          {showHint && (
            <div className="hint-box">
              <span>{activity.tip}</span>
              <AudioButton id={`hint-${activity.id}`} text={activity.tip} label="Escuchar pista" size="small" />
            </div>
          )}
          <button
            type="button"
            className="primary large-btn"
            disabled={
              activity.type === 'order_sentence'
                ? orderedList.length === 0
                : activity.type === 'story_sequence'
                  ? orderedList.length < activity.steps.length
                  : !selectedOption
            }
            onClick={checkAnswer}
          >
            Comprobar respuesta ✓
          </button>
        </div>
      ) : (
        <div className={`feedback ${feedback.isCorrect ? 'good' : 'try'}`}>
          <b>{feedback.title}</b>
          <p>{feedback.message}</p>
          <div className="feedback-tip">
            <strong>Explicación:</strong> {feedback.tip}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
            <button
              type="button"
              className="primary large-btn"
              onClick={onNextActivity}
            >
              Siguiente actividad de Español →
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => onShowResults && onShowResults(feedback.isCorrect)}
            >
              📊 Finalizar sesión y descargar resultados (.json)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
