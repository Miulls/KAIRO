import React, { useState } from 'react';
import { authService } from '../services/authService';

export default function TeacherLogin({ onLoginSuccess, onBack }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('C.E.B.G. República de Panamá');
  const [grade, setGrade] = useState('7.° Grado - Español');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isRegisterMode) {
        result = await authService.registerTeacher(identifier, password, name, school, grade);
      } else {
        // En login: si no existe, se auto-crea con el usuario y contraseña proporcionados
        result = await authService.loginTeacher(identifier, password, name || identifier);
      }

      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al procesar la autenticación: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setIdentifier('profesor.panama');
    setPassword('docente2026');
    setIsRegisterMode(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card panel">
        <div className="login-header">
          <button className="back-link" onClick={onBack}>← Volver a inicio</button>
          <div className="login-icon">👩‍🏫</div>
          <h2>{isRegisterMode ? 'Registrar Cuenta Docente' : 'Portal de Docentes'}</h2>
          <p>
            {isRegisterMode
              ? 'Crea tu usuario y contraseña institucional para supervisar estudiantes en Español.'
              : 'Ingresa con cualquier usuario y contraseña. Si es nuevo, se registrará de inmediato.'}
          </p>
        </div>

        {error && <div className="error-alert">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegisterMode && (
            <>
              <div className="form-group">
                <label htmlFor="teacher-name">Nombre y Apellido del Docente</label>
                <input
                  id="teacher-name"
                  type="text"
                  placeholder="Ej: Prof. María Villarreal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegisterMode}
                />
              </div>

              <div className="form-group">
                <label htmlFor="teacher-school">Centro Educativo / Escuela</label>
                <input
                  id="teacher-school"
                  type="text"
                  placeholder="Ej: C.E.B.G. Las Lajas"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="teacher-user">Usuario o correo institucional</label>
            <input
              id="teacher-user"
              type="text"
              placeholder="Cualquier usuario o correo"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="teacher-pass">Contraseña de acceso</label>
            <input
              id="teacher-pass"
              type="password"
              placeholder="Cualquier contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary large-btn" disabled={loading}>
            {loading ? 'Accediendo...' : (isRegisterMode ? 'Registrar Docente y Entrar →' : 'Ingresar al Panel Docente →')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            className="secondary"
            style={{ width: '100%', fontSize: '13px' }}
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
            }}
          >
            {isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Deseas registrar una nueva cuenta docente con tu nombre y escuela? Haz clic aquí'}
          </button>
        </div>

        <div className="demo-accounts-box">
          <small><strong>💡 Credenciales precargadas:</strong></small>
          <div className="demo-badges">
            <button type="button" className="demo-badge-btn" onClick={handleQuickDemo}>
              Autocompletar: profesor.panama / docente2026
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
