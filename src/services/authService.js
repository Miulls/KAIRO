// Servicio de Autenticación con Hashing Criptográfico SHA-256 Nativo y Auto-Registro Offline
// Funciona 100% Offline y soporta tanto inicio de sesión como registro con cualquier usuario/contraseña.

import { storageService } from './storageService';

async function sha256(message) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message.trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback simple si el contexto no es seguro (ej: sin https)
    }
  }
  // Fallback simple determinista para desarrollo offline si crypto.subtle no estuviera disponible
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = ((hash << 5) - hash) + message.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

export const authService = {
  // Iniciar sesión como Estudiante (Código + PIN numérico)
  // Si el estudiante no existe, lo crea automáticamente o permite registrarse
  async loginStudent(code, pin, studentName = null, grade = '7.° Grado') {
    if (!code || !pin) {
      return { success: false, error: 'Por favor ingresa tu código y tu PIN.' };
    }
    const cleanCode = code.trim().toUpperCase();
    const pinHash = await sha256(pin.trim());
    const users = storageService.getUsers();

    let student = users.find(u => u.role === 'student' && u.code && u.code.toUpperCase() === cleanCode);

    if (!student) {
      // Auto-registro instantáneo para facilitar pruebas con cualquier código/PIN
      const displayName = studentName && studentName.trim() ? studentName.trim() : `Estudiante ${cleanCode}`;
      student = {
        id: 'est-' + Date.now(),
        role: 'student',
        code: cleanCode,
        name: displayName,
        grade: grade || '7.° Grado',
        pinHash: pinHash,
        teacherId: 'doc-001'
      };
      storageService.saveUser(student);
    } else {
      // Si existe pero el pin no coincide
      if (student.pinHash && student.pinHash !== pinHash) {
        return { success: false, error: 'PIN incorrecto para este código. Inténtalo de nuevo o usa otro código.' };
      }
    }

    const sessionUser = {
      id: student.id,
      role: 'student',
      code: student.code,
      name: student.name,
      grade: student.grade,
      teacherId: student.teacherId
    };

    storageService.setCurrentUser(sessionUser);
    return { success: true, user: sessionUser };
  },

  // Registrar explícitamente un nuevo Estudiante
  async registerStudent(code, pin, name, grade) {
    if (!code || !pin || !name) {
      return { success: false, error: 'Completa todos los campos para registrarte.' };
    }
    const cleanCode = code.trim().toUpperCase();
    const pinHash = await sha256(pin.trim());
    const users = storageService.getUsers();

    if (users.some(u => u.role === 'student' && u.code && u.code.toUpperCase() === cleanCode)) {
      return { success: false, error: 'Ese código ya está en uso. Puedes iniciar sesión o elegir otro.' };
    }

    const newStudent = {
      id: 'est-' + Date.now(),
      role: 'student',
      code: cleanCode,
      name: name.trim(),
      grade: grade || '7.° Grado',
      pinHash: pinHash,
      teacherId: 'doc-001'
    };

    storageService.saveUser(newStudent);
    storageService.setCurrentUser(newStudent);
    return { success: true, user: newStudent };
  },

  // Iniciar sesión como Docente (Usuario/Correo + Contraseña)
  // Si no existe, permite auto-crearlo o registrarlo
  async loginTeacher(identifier, password, teacherName = null) {
    if (!identifier || !password) {
      return { success: false, error: 'Ingresa tu usuario o correo y tu contraseña.' };
    }
    const cleanId = identifier.trim().toLowerCase();
    const passHash = await sha256(password);
    const users = storageService.getUsers();

    let teacher = users.find(u => 
      u.role === 'teacher' && 
      ((u.username && u.username.toLowerCase() === cleanId) || (u.email && u.email.toLowerCase() === cleanId))
    );

    if (!teacher) {
      // Auto-registro de docente con cualquier usuario y contraseña
      const displayName = teacherName && teacherName.trim() ? teacherName.trim() : `Prof. ${identifier.split('@')[0]}`;
      teacher = {
        id: 'doc-' + Date.now(),
        role: 'teacher',
        username: cleanId,
        email: cleanId.includes('@') ? cleanId : `${cleanId}@meduca.pa`,
        name: displayName,
        school: 'C.E.B.G. República de Panamá',
        grade: '7.° Grado - Español',
        passwordHash: passHash,
        assignedStudentIds: []
      };
      storageService.saveUser(teacher);
    } else {
      if (teacher.passwordHash && teacher.passwordHash !== passHash) {
        return { success: false, error: 'Contraseña incorrecta. Inténtalo de nuevo o usa otro usuario.' };
      }
    }

    const sessionUser = {
      id: teacher.id,
      role: 'teacher',
      username: teacher.username,
      name: teacher.name,
      school: teacher.school,
      grade: teacher.grade,
      assignedStudentIds: teacher.assignedStudentIds || []
    };

    storageService.setCurrentUser(sessionUser);
    return { success: true, user: sessionUser };
  },

  // Registrar explícitamente un nuevo Docente
  async registerTeacher(identifier, password, name, school, grade) {
    if (!identifier || !password || !name) {
      return { success: false, error: 'Completa los campos obligatorios.' };
    }
    const cleanId = identifier.trim().toLowerCase();
    const passHash = await sha256(password);
    const users = storageService.getUsers();

    if (users.some(u => u.role === 'teacher' && (u.username === cleanId || u.email === cleanId))) {
      return { success: false, error: 'Ese usuario docente ya existe. Inicia sesión con su contraseña.' };
    }

    const newTeacher = {
      id: 'doc-' + Date.now(),
      role: 'teacher',
      username: cleanId,
      email: cleanId.includes('@') ? cleanId : `${cleanId}@meduca.pa`,
      name: name.trim(),
      school: school || 'C.E.B.G. República de Panamá',
      grade: grade || '7.° Grado - Español',
      passwordHash: passHash,
      assignedStudentIds: []
    };

    storageService.saveUser(newTeacher);
    storageService.setCurrentUser(newTeacher);
    return { success: true, user: newTeacher };
  },

  getCurrentUser() {
    return storageService.getCurrentUser();
  },

  logout() {
    storageService.setCurrentUser(null);
  }
};
