import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import DoctorDashboard from './components/DoctorDashboard';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import TaskPlanner from './components/TaskPlanner';
import AIChatbot from './components/AIChatbot';
import FaceDiary from './components/FaceDiary';
import ProfilePage from './components/ProfilePage';
import { storage } from './utils/storage';
import { UserProfile } from './types';

function App() {
  const [appState, setAppState] = useState<'splash' | 'auth' | 'app'>('splash');
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Check authentication state
    const authState = storage.getAuthState();
    if (authState.isAuthenticated && authState.userType) {
      setUserType(authState.userType);
      setAppState('app');
    } else {
      // Show splash screen first
      setTimeout(() => setAppState('auth'), 100);
    }
  }, []);

  const handleSplashComplete = () => {
    setAppState('auth');
  };

  const handleAuthSuccess = (type: 'patient' | 'doctor') => {
    setUserType(type);
    setAppState('app');
  };

  const handleLogout = () => {
    storage.clearAuthState();
    setUserType(null);
    setAppState('auth');
    setActiveTab('home');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (appState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (appState === 'auth') {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (userType === 'doctor') {
    return <DoctorDashboard onLogout={handleLogout} />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage key={refreshKey} onRefresh={handleRefresh} />;
      case 'chat':
        return <AIChatbot />;
      case 'planner':
        return <TaskPlanner onTaskUpdated={handleRefresh} />;
      case 'face-diary':
        return <FaceDiary />;
      case 'profile':
        return <ProfilePage key={refreshKey} onLogout={handleLogout} />;
      default:
        return <HomePage key={refreshKey} onRefresh={handleRefresh} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        {renderActiveComponent()}
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default App;