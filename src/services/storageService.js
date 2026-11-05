// Servicio de Almacenamiento Local Offline-First para KAIRO
// Almacena y gestiona: usuarios, intentos, evaluaciones diagnósticas, módulos subidos localmente y cola de eventos.

const STORAGE_KEYS = {
  CURRENT_USER: 'kairo_current_user',
  USERS: 'kairo_users',
  PROGRESS: 'kairo_progreso_v2',
  DIAGNOSTICS: 'kairo_diagnosticos',
  MODULES: 'kairo_modulos_locales',
  OUTBOX_QUEUE: 'kairo_sync_outbox'
};

// Cuentas iniciales predeterminadas para entorno sin conexión (semillas)
const DEFAULT_USERS = [
  {
    id: 'doc-001',
    role: 'teacher',
    username: 'profesor.panama',
    email: 'profesor.panama@meduca.pa',
    name: 'Prof. Carlos Mendoza',
    school: 'C.E.B.G. Río Caña (Comarca)',
    grade: '7.° Grado - Español',
    // Hash SHA-256 precalculado de 'docente2026'
    passwordHash: 'b4bfa4f40f353aa5aaecb2e9e623eb6dfb4c2b8dd8d3a7d47ba8429ec56605a9',
    assignedStudentIds: ['est-001', 'est-002', 'est-003']
  },
  {
    id: 'est-001',
    role: 'student',
    code: 'EST-101',
    pinHash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', // Hash de '1234'
    name: 'Yarisbel Batista',
    grade: '7.° A',
    teacherId: 'doc-001'
  },
  {
    id: 'est-002',
    role: 'student',
    code: 'EST-102',
    pinHash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', // Hash de '1234'
    name: 'Erick González',
    grade: '7.° A',
    teacherId: 'doc-001'
  },
  {
    id: 'est-003',
    role: 'student',
    code: 'EST-103',
    pinHash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', // Hash de '1234'
    name: 'Danna Santos',
    grade: '7.° B',
    teacherId: 'doc-001'
  }
];

export const storageService = {
  // Inicializa las tablas locales si no existen (con migración retrocompatible si venían de la clave previa)
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const prevUsers = localStorage.getItem('alf_users');
      localStorage.setItem(STORAGE_KEYS.USERS, prevUsers || JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
      const prevProg = localStorage.getItem('alf_progreso_v2');
      localStorage.setItem(STORAGE_KEYS.PROGRESS, prevProg || JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DIAGNOSTICS)) {
      const prevDiag = localStorage.getItem('alf_diagnosticos');
      localStorage.setItem(STORAGE_KEYS.DIAGNOSTICS, prevDiag || JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MODULES)) {
      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      const prevUser = localStorage.getItem('alf_current_user');
      if (prevUser) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, prevUser);
    }
  },

  getUsers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch {
      return DEFAULT_USERS;
    }
  },

  saveUser(newUser) {
    const users = this.getUsers();
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Progreso por estudiante
  getStudentProgress(studentId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS)) || {};
      return all[studentId] || {
        studentId,
        completedActivities: 0,
        attempts: 0,
        correct: 0,
        competencies: {
          vocabulario: { correct: 0, total: 0 },
          gramatica: { correct: 0, total: 0 },
          comprension_lectora: { correct: 0, total: 0 },
          comprension_oral: { correct: 0, total: 0 }
        },
        rewards: ['Bienvenido a KAIRO'],
        lastActive: new Date().toISOString()
      };
    } catch {
      return null;
    }
  },

  saveStudentProgress(studentId, progressData) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS)) || {};
      all[studentId] = {
        ...progressData,
        lastActive: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
    } catch (e) {
      console.error('Error al guardar progreso local en KAIRO:', e);
    }
  },

  // Diagnóstico
  getDiagnostic(studentId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DIAGNOSTICS)) || {};
      return all[studentId] || null;
    } catch {
      return null;
    }
  },

  saveDiagnostic(studentId, diagnosticData) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DIAGNOSTICS)) || {};
      all[studentId] = {
        ...diagnosticData,
        completedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.DIAGNOSTICS, JSON.stringify(all));
    } catch (e) {
      console.error('Error al guardar diagnóstico local en KAIRO:', e);
    }
  },

  // Gestión de Módulos Locales subidos por el Docente
  getUploadedModules() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MODULES)) || [];
    } catch {
      return [];
    }
  },

  saveUploadedModule(moduleData) {
    const modules = this.getUploadedModules();
    const existingIndex = modules.findIndex(m => m.id === moduleData.id);
    if (existingIndex >= 0) {
      modules[existingIndex] = { ...moduleData, updatedAt: new Date().toISOString() };
    } else {
      modules.push({
        ...moduleData,
        uploadedAt: new Date().toISOString()
      });
    }
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
    return moduleData;
  },

  deleteUploadedModule(moduleId) {
    const modules = this.getUploadedModules().filter(m => m.id !== moduleId);
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
    return modules;
  }
};
