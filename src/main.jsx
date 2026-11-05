import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

import { storageService } from './services/storageService';
import { authService } from './services/authService';

import WelcomeScreen from './components/WelcomeScreen';
import StudentLogin from './components/StudentLogin';
import TeacherLogin from './components/TeacherLogin';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('welcome'); // 'welcome' | 'student-login' | 'teacher-login' | 'dashboard'

  useEffect(() => {
    // Inicializar almacenamiento local de KAIRO
    storageService.init();

    // Comprobar si existe sesión activa previa
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setCurrentView('dashboard');
    }

    // Registro de Service Worker para caché offline
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW registration skipped or failed:', err);
      });
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('welcome');
  };

  return (
    <div className="app">
      <header>
        <div className="brand" onClick={() => !currentUser && setCurrentView('welcome')} style={{ cursor: 'pointer' }}>
          <div className="logo">K</div>
          <div>
            <b>KAIRO</b>
            <small>Aprendizaje portátil y offline · 7.° Grado · Español</small>
          </div>
        </div>

        <div className="header-right">
          <span className="badge-offline-header">
            ⚡ Modo Offline Resiliente
          </span>
          {currentUser && (
            <button className="header-logout-btn" onClick={handleLogout} title="Cerrar sesión">
              Salir ⎋
            </button>
          )}
        </div>
      </header>

      <main>
        {currentView === 'welcome' && (
          <WelcomeScreen
            onSelectRole={(role) => setCurrentView(role === 'student' ? 'student-login' : 'teacher-login')}
          />
        )}

        {currentView === 'student-login' && (
          <StudentLogin
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentView('welcome')}
          />
        )}

        {currentView === 'teacher-login' && (
          <TeacherLogin
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentView('welcome')}
          />
        )}

        {currentView === 'dashboard' && currentUser && (
          currentUser.role === 'student' ? (
            <StudentDashboard
              student={currentUser}
              onLogout={handleLogout}
            />
          ) : (
            <TeacherDashboard
              teacher={currentUser}
              onLogout={handleLogout}
            />
          )
        )}
      </main>

      <footer>
        <span><strong>KAIRO</strong> — Aprendizaje portátil y offline para mantener la educación en adversidades y catástrofes</span>
        <span>Datos y módulos protegidos localmente</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
