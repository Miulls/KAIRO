import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';

export default function TeacherDashboard({ teacher, onLogout }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [studentDiag, setStudentDiag] = useState(null);
  const [uploadedModules, setUploadedModules] = useState([]);
  const [moduleStatusMsg, setModuleStatusMsg] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'modules' | 'import-results'

  // Referencias para carga de archivos
  const moduleFileInputRef = useRef(null);
  const resultsFileInputRef = useRef(null);

  // Formulario para registrar nuevo alumno en esta estación local
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('7.° Grado - Grupo A');
  const [newPin, setNewPin] = useState('1234');

  useEffect(() => {
    loadTeacherData();
  }, [teacher.id]);

  const loadTeacherData = () => {
    const allUsers = storageService.getUsers();
    // Filtrar estudiantes asignados al docente
    const myStudents = allUsers.filter(u => u.role === 'student' && (u.teacherId === teacher.id || !u.teacherId));
    setStudents(myStudents);
    setUploadedModules(storageService.getUploadedModules());

    if (myStudents.length > 0 && !selectedStudent) {
      handleSelectStudent(myStudents[0]);
    }
  };

  const handleSelectStudent = (st) => {
    setSelectedStudent(st);
    const prog = storageService.getStudentProgress(st.id);
    const diag = storageService.getDiagnostic(st.id);
    setStudentProgress(prog);
    setStudentDiag(diag);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newName) return;
    await authService.createStudent({
      name: newName,
      grade: newGrade,
      pin: newPin,
      teacherId: teacher.id
    });
    setNewName('');
    setShowAddModal(false);
    loadTeacherData();
  };

  // 1. Manejador para subir módulos de contenido (Word / PDF / JSON)
  const handleTriggerModuleUpload = () => {
    setModuleStatusMsg({ text: '', type: '' });
    if (moduleFileInputRef.current) {
      moduleFileInputRef.current.value = '';
      moduleFileInputRef.current.click();
    }
  };

  const handleModuleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const isJson = fileNameLower.endsWith('.json');
    const isDoc = fileNameLower.endsWith('.doc') || fileNameLower.endsWith('.docx');
    const isPdf = fileNameLower.endsWith('.pdf');

    if (!isJson && !isDoc && !isPdf && !fileNameLower.endsWith('.txt')) {
      setModuleStatusMsg({
        text: 'Formato no soportado. Puedes seleccionar archivos Word (.docx), PDF (.pdf) o JSON (.json).',
        type: 'error'
      });
      return;
    }

    if (isJson) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const rawContent = event.target?.result;
          const parsed = JSON.parse(rawContent);

          if (!parsed.title && !parsed.titulo && !parsed.name) {
            throw new Error('El archivo no contiene un título o nombre de módulo válido.');
          }

          const activities = parsed.activities || parsed.actividades || [];
          if (!Array.isArray(activities) || activities.length === 0) {
            throw new Error('El módulo debe contener un arreglo de actividades no vacío.');
          }

          const normalizedActivities = activities.map((act, idx) => ({
            id: act.id || `mod-act-${Date.now()}-${idx}`,
            title: act.title || act.titulo || `Actividad ${idx + 1}`,
            type: act.type || act.tipo || 'fill_sentence',
            level: act.level || act.nivel || 'Intermedio',
            competency: act.competency || act.competencia || 'gramatica',
            instruction: act.instruction || act.instruccion || 'Completa la actividad',
            options: act.options || act.opciones || [],
            answer: act.answer || act.respuesta || '',
            tip: act.tip || act.pista || 'Revisa la regla ortográfica correspondiente.',
            ...act
          }));

          const newModule = {
            id: parsed.id || `modulo-${Date.now()}`,
            fileType: 'JSON',
            title: parsed.title || parsed.titulo || parsed.name || file.name.replace('.json', ''),
            description: parsed.description || parsed.descripcion || 'Módulo cargado localmente por el docente.',
            grade: parsed.grade || parsed.grado || '7.° Grado - Español',
            activitiesCount: normalizedActivities.length,
            activities: normalizedActivities,
            fileName: file.name,
            uploadedBy: teacher.name,
            uploadedAt: new Date().toISOString()
          };

          storageService.saveUploadedModule(newModule);
          setUploadedModules(storageService.getUploadedModules());

          setModuleStatusMsg({
            text: `✅ ¡Módulo «${newModule.title}» cargado con éxito! (${normalizedActivities.length} actividades disponibles offline para tus estudiantes).`,
            type: 'success'
          });
        } catch (err) {
          setModuleStatusMsg({
            text: `⚠️ Error al procesar el archivo JSON: ${err.message}`,
            type: 'error'
          });
        }
      };
      reader.readAsText(file);
      return;
    }

    // Documentos PDF o Word
    const cleanDocTitle = file.name.replace(/\.[^/.]+$/, '');
    const detectedType = isPdf ? 'PDF' : 'Word';

    const documentActivity = {
      id: `doc-act-${Date.now()}`,
      title: `Lectura de módulo: ${cleanDocTitle}`,
      type: 'reading_comprehension',
      level: 'Intermedio',
      competency: 'comprension_lectora',
      instruction: `Módulo cargado por el docente (${detectedType}: ${file.name}). Lee el material de apoyo y responde la pregunta de comprensión.`,
      readingText: `Material de estudio del módulo "${cleanDocTitle}", asignado por el docente para el aprendizaje autónomo y continuo sin conexión a Internet.`,
      question: `¿Cuál es el propósito pedagógico principal del módulo "${cleanDocTitle}"?`,
      options: [
        'Fortalecer la comprensión y las competencias de Español sin conexión',
        'Navegar en páginas de internet que consumen datos móviles',
        'Jugar videojuegos sin contenido pedagógico'
      ],
      answer: 'Fortalecer la comprensión y las competencias de Español sin conexión',
      tip: 'Los módulos de KAIRO están diseñados para el aprendizaje portátil y continuo en la asignatura de Español.'
    };

    const newModule = {
      id: `modulo-doc-${Date.now()}`,
      fileType: detectedType,
      title: cleanDocTitle,
      description: `Documento educativo (${detectedType}) subido desde el almacenamiento local.`,
      grade: '7.° Grado - Español',
      activitiesCount: 1,
      activities: [documentActivity],
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + ' KB',
      uploadedBy: teacher.name,
      uploadedAt: new Date().toISOString()
    };

    storageService.saveUploadedModule(newModule);
    setUploadedModules(storageService.getUploadedModules());

    setModuleStatusMsg({
      text: `✅ ¡Documento ${detectedType} «${file.name}» cargado con éxito en el almacenamiento local!`,
      type: 'success'
    });
  };

  // 2. Manejador para SUBIR RESULTADOS (.json) del estudiante (actividades o diagnósticos)
  const handleTriggerResultsUpload = () => {
    setModuleStatusMsg({ text: '', type: '' });
    if (resultsFileInputRef.current) {
      resultsFileInputRef.current.value = '';
      resultsFileInputRef.current.click();
    }
  };

  const handleResultsFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      setModuleStatusMsg({
        text: 'Por favor selecciona un archivo de resultados en formato .json generado por KAIRO.',
        type: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result;
        const data = JSON.parse(raw);

        if (!data.estudiante || (!data.evaluacion && !data.desempeno && !data.actividad)) {
          throw new Error('El archivo JSON no corresponde a un formato de resultados válido de KAIRO.');
        }

        const studentCode = (data.estudiante.codigo || data.estudiante.id || '').toUpperCase();
        const studentName = data.estudiante.nombre || `Estudiante ${studentCode}`;
        const users = storageService.getUsers();

        // Buscar al estudiante o registrarlo si no existía en esta estación
        let existingStudent = users.find(u => u.role === 'student' && (u.code?.toUpperCase() === studentCode || u.id === data.estudiante.id));

        if (!existingStudent) {
          existingStudent = {
            id: data.estudiante.id || 'est-' + Date.now(),
            role: 'student',
            code: studentCode || `EST-${Date.now().toString().slice(-3)}`,
            name: studentName,
            grade: data.estudiante.grado || '7.° Grado',
            pinHash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
            teacherId: teacher.id
          };
          storageService.saveUser(existingStudent);
        }

        // Si es un archivo de EVALUACIÓN DIAGNÓSTICA
        if (data.tipo === 'EVALUACION_DIAGNOSTICA_KAIRO' || data.evaluacion) {
          const diagData = {
            studentId: existingStudent.id,
            studentName: existingStudent.name,
            totalQuestions: data.evaluacion?.totalPreguntas || 12,
            totalCorrect: data.evaluacion?.totalCorrectas || 0,
            scorePercentage: data.evaluacion?.porcentajeObtenido || 0,
            level: data.evaluacion?.nivelAsignado || 'Inicial',
            competencies: data.evaluacion?.competencias || {},
            areasToReinforce: data.evaluacion?.areasRefuerzo || [],
            answers: data.evaluacion?.respuestasDetalladas || {},
            completedAt: data.fechaDiagnostico || new Date().toISOString()
          };

          storageService.saveDiagnostic(existingStudent.id, diagData);

          setModuleStatusMsg({
            text: `🎯 ¡Diagnóstico inicial de «${existingStudent.name}» (${existingStudent.code}) importado con éxito! Nivel: ${diagData.level} (${diagData.scorePercentage}%).`,
            type: 'success'
          });
        }
        // Si es un archivo de RESULTADOS DE ACTIVIDADES
        else if (data.desempeno || data.actividad) {
          const prevProgress = storageService.getStudentProgress(existingStudent.id) || {
            studentId: existingStudent.id,
            completedActivities: 0,
            attempts: 0,
            correct: 0,
            competencies: {},
            rewards: [],
            history: []
          };

          const isOk = data.desempeno?.aprobado || data.desempeno?.resultadoUltimoIntento === 'CORRECTO';
          const aciertos = data.desempeno?.aciertos || (isOk ? 1 : 0);
          const preguntas = data.desempeno?.totalPreguntas || 1;

          const updatedProgress = {
            ...prevProgress,
            completedActivities: (prevProgress.completedActivities || 0) + 1,
            attempts: (prevProgress.attempts || 0) + preguntas,
            correct: (prevProgress.correct || 0) + aciertos,
            history: [
              ...(prevProgress.history || []),
              ...(data.historialDetallado || [{
                activityId: data.actividad?.id || 'act-import',
                title: data.actividad?.nombre || 'Actividad importada',
                isCorrect: isOk,
                at: data.fechaExportacion || new Date().toISOString()
              }])
            ],
            lastActive: data.fechaExportacion || new Date().toISOString()
          };

          storageService.saveStudentProgress(existingStudent.id, updatedProgress);

          setModuleStatusMsg({
            text: `📥 ¡Resultados de «${data.actividad?.nombre || 'Actividad'}» del estudiante ${existingStudent.name} importados correctamente! (${aciertos}/${preguntas} aciertos).`,
            type: 'success'
          });
        }

        loadTeacherData();
        handleSelectStudent(existingStudent);
      } catch (err) {
        setModuleStatusMsg({
          text: `⚠️ Error al importar archivo de resultados: ${err.message}`,
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteModule = (moduleId) => {
    const updated = storageService.deleteUploadedModule(moduleId);
    setUploadedModules(updated);
    setModuleStatusMsg({
      text: 'Módulo eliminado del almacenamiento local.',
      type: 'info'
    });
  };

  return (
    <div className="teacher-dashboard mobile-layout">
      {/* Header del Docente adaptable */}
      <div className="teacher-header-bar">
        <div className="teacher-info-group">
          <span className="eyebrow">KAIRO · PORTAL DOCENTE · ESPAÑOL</span>
          <h2>{teacher.name}</h2>
          <small>{teacher.school} · {teacher.grade}</small>
        </div>

        <div className="teacher-controls">
          {/* Input oculto para subir módulos (Word, PDF, JSON) */}
          <input
            type="file"
            ref={moduleFileInputRef}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.json,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/json"
            onChange={handleModuleFileChange}
          />
          <button className="primary upload-module-btn" onClick={handleTriggerModuleUpload}>
            📄 Subir módulo (Word / PDF / JSON)
          </button>

          {/* Input oculto para subir resultados .json del estudiante */}
          <input
            type="file"
            ref={resultsFileInputRef}
            style={{ display: 'none' }}
            accept=".json,application/json"
            onChange={handleResultsFileChange}
          />
          <button className="secondary import-results-btn" onClick={handleTriggerResultsUpload}>
            📥 Importar Resultados Estudiante (.json)
          </button>

          <button className="secondary add-student-btn" onClick={() => setShowAddModal(true)}>
            + Estudiante
          </button>
          <button className="subnav-btn logout desktop-only-nav" onClick={onLogout}>
            Salir ⎋
          </button>
        </div>
      </div>

      {moduleStatusMsg.text && (
        <div className={`sync-msg-banner ${moduleStatusMsg.type}`}>
          {moduleStatusMsg.text}
        </div>
      )}

      {/* Apartado dedicado para recepción de archivos transferidos por Quick Share / Bluetooth */}
      <div className="panel import-zone-panel">
        <div className="import-zone-header">
          <div className="import-zone-text">
            <h3>📥 Cargar Resultados de Estudiantes</h3>
            <p>
              Sube aquí los archivos <strong>.json</strong> que tus estudiantes descargaron y te enviaron mediante <strong>Quick Share, Bluetooth</strong> o almacenamiento local (diagnóstico inicial y actividades).
            </p>
          </div>
          <button className="primary large-touch-btn" onClick={handleTriggerResultsUpload}>
            📥 Seleccionar archivo de resultados (.json)
          </button>
        </div>
      </div>

      {/* Selector móvil de vista: Estudiantes / Módulos */}
      <div className="mobile-tab-switch">
        <button
          type="button"
          className={`switch-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👥 Estudiantes ({students.length})
        </button>
        <button
          type="button"
          className={`switch-tab-btn ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          📦 Módulos Locales ({uploadedModules.length})
        </button>
      </div>

      {/* Módulos locales activos */}
      {(activeTab === 'modules' || window.innerWidth > 768) && uploadedModules.length > 0 && (
        <div className="panel modules-panel">
          <h3>📦 Módulos Educativos Locales ({uploadedModules.length})</h3>
          <p className="hint-text">Materiales y actividades (Word, PDF, JSON) guardados offline en este dispositivo:</p>
          <div className="modules-list-grid">
            {uploadedModules.map(mod => (
              <div key={mod.id} className="module-item-card">
                <div className="module-item-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mini-pill" style={{ background: mod.fileType === 'PDF' ? '#ffebe9' : mod.fileType === 'Word' ? '#eaf1f8' : '#eaf4ed' }}>
                      {mod.fileType || 'Doc'}
                    </span>
                    <strong>{mod.title}</strong>
                  </div>
                  <small>{mod.fileName} {mod.fileSize ? `(${mod.fileSize})` : ''} · Subido el {new Date(mod.uploadedAt).toLocaleDateString()}</small>
                </div>
                <button
                  type="button"
                  className="delete-mod-btn"
                  onClick={() => handleDeleteModule(mod.id)}
                  title="Eliminar este módulo local"
                >
                  🗑️ Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="teacher-grid">
          {/* Lista de estudiantes adaptable */}
          <aside className="students-sidebar panel">
            <h3>Mis Estudiantes ({students.length})</h3>
            <p className="hint-text">Toca un estudiante para ver su reporte:</p>
            <div className="students-list">
              {students.map(st => {
                const diag = storageService.getDiagnostic(st.id);
                const isSelected = selectedStudent?.id === st.id;
                return (
                  <div
                    key={st.id}
                    className={`student-item-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectStudent(st)}
                  >
                    <div className="student-item-head">
                      <strong>{st.name}</strong>
                      <span className="student-code-badge">{st.code}</span>
                    </div>
                    <div className="student-item-sub">
                      <span>{st.grade}</span>
                      <span className={`level-pill ${diag ? diag.level.toLowerCase() : 'none'}`}>
                        {diag ? diag.level : 'Sin diagnóstico'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Detalle y analítica del estudiante seleccionado */}
          <main className="student-detail-view">
            {selectedStudent ? (
              <>
                <div className="panel detail-hero">
                  <div className="detail-meta">
                    <h2>{selectedStudent.name}</h2>
                    <span>Código: <strong>{selectedStudent.code}</strong> · Grupo: {selectedStudent.grade}</span>
                  </div>
                  <div className="detail-tags">
                    <span className="pill">
                      {studentDiag ? 'Diagnóstico Registrado' : 'Sin Diagnóstico'}
                    </span>
                    <span className="pill">
                      Última actividad: {studentProgress?.lastActive ? new Date(studentProgress.lastActive).toLocaleDateString() : 'Sin actividad'}
                    </span>
                  </div>
                </div>

                {/* Métricas clave */}
                <div className="stats">
                  <article>
                    <small>Actividades Realizadas</small>
                    <strong>{studentProgress?.completedActivities || 0}</strong>
                  </article>
                  <article>
                    <small>Aciertos / Intentos</small>
                    <strong>{studentProgress?.correct || 0} / {studentProgress?.attempts || 0}</strong>
                  </article>
                  <article>
                    <small>Diagnóstico Inicial</small>
                    <strong>{studentDiag ? `${studentDiag.scorePercentage}% (${studentDiag.level})` : 'N/D'}</strong>
                  </article>
                </div>

                {/* Semáforo por competencias de Español */}
                <div className="panel">
                  <h3>Desempeño por Competencias de Español</h3>
                  <div className="competencies-grid">
                    {[
                      { key: 'vocabulario', title: 'Vocabulario y Ortografía' },
                      { key: 'gramatica', title: 'Gramática y Sintaxis' },
                      { key: 'comprension_lectora', title: 'Comprensión Lectora' },
                      { key: 'comprension_oral', title: 'Comprensión Oral' }
                    ].map(c => {
                      const diagComp = studentDiag?.competencies?.[c.key];
                      const pct = diagComp && diagComp.total > 0
                        ? Math.round((diagComp.correct / diagComp.total) * 100)
                        : null;

                      return (
                        <div key={c.key} className="comp-card">
                          <div className="comp-card-head">
                            <strong>{c.title}</strong>
                            <span className={`comp-pct ${pct === null ? 'gray' : pct >= 70 ? 'high' : pct >= 50 ? 'med' : 'low'}`}>
                              {pct !== null ? `${pct}%` : 'S/D'}
                            </span>
                          </div>
                          <div className="comp-progress">
                            <div
                              className={`comp-fill ${pct >= 70 ? 'high' : pct >= 50 ? 'med' : 'low'}`}
                              style={{ width: `${pct || 0}%` }}
                            />
                          </div>
                          <small>
                            {diagComp ? `${diagComp.correct} correctas de ${diagComp.total} evaluadas` : 'No evaluada'}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Plan pedagógico de refuerzo */}
                <div className="panel">
                  <h3>Orientación Pedagógica para el Aula</h3>
                  {studentDiag?.areasToReinforce && studentDiag.areasToReinforce.length > 0 ? (
                    <div className="pedagogical-plan">
                      <p>Temas prioritarios de refuerzo en Español:</p>
                      <ul className="plan-list">
                        {studentDiag.areasToReinforce.map((area, idx) => (
                          <li key={idx}>
                            <strong>Refuerzo en {area}:</strong> Asignar módulos locales de refuerzo y retroalimentar al estudiante.
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="neutral-text">
                      {studentDiag
                        ? 'El estudiante presenta un desempeño homogéneo y sólido en las competencias evaluadas.'
                        : 'El estudiante aún no ha completado su evaluación diagnóstica.'}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="panel empty-state">
                <p>Selecciona un estudiante del listado para consultar sus métricas.</p>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Modal de nuevo estudiante */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card panel">
            <h3>Registrar Nuevo Estudiante en KAIRO</h3>
            <p>Se creará la cuenta sin conexión a Internet en este dispositivo.</p>
            <form onSubmit={handleCreateStudent}>
              <div className="form-group">
                <label>Nombre y Apellidos</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Milagros Aparicio"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Grado / Sección</label>
                <input
                  type="text"
                  value={newGrade}
                  onChange={e => setNewGrade(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>PIN secreto (4 números)</label>
                <input
                  type="password"
                  maxLength="6"
                  required
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary">
                  Crear Estudiante Local
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barra de Navegación Inferior Móvil para el Docente */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-label">Estudiantes</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          <span className="nav-icon">📦</span>
          <span className="nav-label">Módulos</span>
        </button>
        <button
          className="mobile-nav-item"
          onClick={handleTriggerResultsUpload}
        >
          <span className="nav-icon">📥</span>
          <span className="nav-label">Importar</span>
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
