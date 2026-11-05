import React, { useState } from 'react';
import { authService } from '../services/authService';
import AudioButton from './AudioButton';

export default function StudentLogin({ onLoginSuccess, onBack }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('7.° Grado - Grupo A');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isRegisterMode) {
        result = await authService.registerStudent(code, pin, name, grade);
      } else {
        // En modo login: si el usuario no existe, se auto-crea con el nombre o código ingresado
        result = await authService.loginStudent(code, pin, name || code);
      }

      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al procesar el acceso: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoCode, demoPin) => {
    setCode(demoCode);
    setPin(demoPin);
    setIsRegisterMode(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card panel">
        <div className="login-header">
          <button className="back-link" onClick={onBack}>← Volver a inicio</button>
          <div className="login-icon">🎒</div>
          <h2>{isRegisterMode ? 'Registrar Nuevo Estudiante' : 'Acceso de Estudiante'}</h2>
          <p>
            {isRegisterMode
              ? 'Crea tu perfil con cualquier código y PIN para empezar tus actividades.'
              : 'Ingresa con cualquier código y PIN. Si es nuevo, se creará automáticamente.'}
          </p>
          <AudioButton
            id="student-login-instructions"
            text={isRegisterMode
              ? 'Formulario de registro de estudiante. Escribe tu código, tu nombre y tu PIN de cuatro dígitos.'
              : 'Acceso de estudiante. Escribe tu código y tu PIN para ingresar a tus actividades de Español.'}
            label="Escuchar instrucciones"
            size="small"
          />
        </div>

        {error && (
          <div className="error-alert">
            <span>⚠️ {error}</span>
            <AudioButton id="error-login-audio" text={error} label="" size="small" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegisterMode && (
            <>
              <div className="form-group">
                <label htmlFor="student-name">
                  Tu nombre y apellido
                  <AudioButton id="lbl-name-audio" text="Escribe tu nombre y apellido" label="" size="small" />
                </label>
                <input
                  id="student-name"
                  type="text"
                  placeholder="Ej: Ana Morales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegisterMode}
                />
              </div>

              <div className="form-group">
                <label htmlFor="student-grade">
                  Grado o grupo
                  <AudioButton id="lbl-grade-audio" text="Grado o grupo escolar" label="" size="small" />
                </label>
                <input
                  id="student-grade"
                  type="text"
                  placeholder="Ej: 7.° Grado - A"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="student-code">
              Código de estudiante (o nombre de usuario)
              <AudioButton
                id="lbl-code-audio"
                text="Código de estudiante. Puedes escribir cualquier código, por ejemplo EST-101 o tu nombre."
                label=""
                size="small"
              />
            </label>
            <input
              id="student-code"
              type="text"
              placeholder="Ej: EST-101 o MI_CODIGO"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-pin">
              PIN secreto o contraseña
              <AudioButton
                id="lbl-pin-audio"
                text="PIN numérico o contraseña secreta"
                label=""
                size="small"
              />
            </label>
            <input
              id="student-pin"
              type="password"
              placeholder="Ej: 1234"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary large-btn" disabled={loading}>
            {loading ? 'Entrando...' : (isRegisterMode ? 'Crear mi cuenta y comenzar →' : 'Iniciar sesión en Español →')}
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
            {isRegisterMode ? '¿Ya tienes un código? Inicia sesión aquí' : '¿Deseas registrar un nuevo estudiante con datos personalizados? Haz clic aquí'}
          </button>
        </div>

        <div className="demo-accounts-box">
          <small><strong>💡 Cuentas precargadas de prueba:</strong></small>
          <div className="demo-badges">
            <button
              type="button"
              className="demo-badge-btn"
              onClick={() => handleQuickDemo('EST-101', '1234')}
            >
              EST-101 (PIN: 1234)
            </button>
            <button
              type="button"
              className="demo-badge-btn"
              onClick={() => handleQuickDemo('EST-102', '1234')}
            >
              EST-102 (PIN: 1234)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
