import React, { useState } from 'react';
import { Brain, User, Stethoscope, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
import { UserProfile } from '../types';
import { storage } from '../utils/storage';

interface AuthScreenProps {
  onAuthSuccess: (userType: 'patient' | 'doctor') => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    doctorId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (userType === 'patient' && formData.age && (parseInt(formData.age) < 13 || parseInt(formData.age) > 120)) {
        newErrors.age = 'Age must be between 13 and 120';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const users = storage.getAllUsers();

    if (mode === 'login') {
      const user = users.find(u => u.email === formData.email && u.userType === userType);
      if (user) {
        storage.setCurrentUser(user.id);
        storage.setAuthState(true, userType);
        onAuthSuccess(userType);
      } else {
        setErrors({ email: 'Invalid credentials' });
      }
    } else {
      // Check if user already exists
      const existingUser = users.find(u => u.email === formData.email);
      if (existingUser) {
        setErrors({ email: 'User already exists' });
        return;
      }

      // Create new user
      const newUser: UserProfile = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : undefined,
        registeredAt: new Date(),
        userType,
        doctorId: userType === 'patient' && formData.doctorId ? formData.doctorId : undefined,
        patientIds: userType === 'doctor' ? [] : undefined
      };

      storage.addUser(newUser);
      storage.setCurrentUser(newUser.id);
      storage.setAuthState(true, userType);
      onAuthSuccess(userType);
    }
  };

  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <Brain size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Mindfit <span className="text-purple-400">AI</span>
            </h1>
            <p className="text-gray-300">Choose your account type</p>
          </div>

          {/* User Type Selection */}
          <div className="space-y-4 mb-8">
            <button
              onClick={() => {
                setUserType('patient');
                setMode('login');
              }}
              className="w-full p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <User size={32} />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">I'm a Patient</h3>
                  <p className="text-blue-100 text-sm">Track your mental health journey</p>
                </div>
                <ArrowRight size={24} className="ml-auto" />
              </div>
            </button>

            <button
              onClick={() => {
                setUserType('doctor');
                setMode('login');
              }}
              className="w-full p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl text-white hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <Stethoscope size={32} />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">I'm a Doctor</h3>
                  <p className="text-emerald-100 text-sm">Monitor your patients' progress</p>
                </div>
                <ArrowRight size={24} className="ml-auto" />
              </div>
            </button>
          </div>

          {/* Features */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">Trusted by healthcare professionals</p>
            <div className="flex justify-center space-x-6 text-gray-500">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">AI</div>
                <div className="text-xs">Analysis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => setMode('welcome')}
            className="mb-6 p-2 text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          
          <div className={`p-3 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
            userType === 'patient' ? 'bg-blue-600' : 'bg-emerald-600'
          }`}>
            {userType === 'patient' ? <User size={32} className="text-white" /> : <Stethoscope size={32} className="text-white" />}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-300">
            {userType === 'patient' ? 'Patient Portal' : 'Doctor Portal'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-4 bg-white bg-opacity-10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-4 pl-12 bg-white bg-opacity-10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-4 pl-12 pr-12 bg-white bg-opacity-10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          {mode === 'signup' && userType === 'patient' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age (Optional)</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full p-4 bg-white bg-opacity-10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your age"
                  min="13"
                  max="120"
                />
                {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Doctor ID (Optional)</label>
                <input
                  type="text"
                  value={formData.doctorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                  className="w-full p-4 bg-white bg-opacity-10 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your doctor's ID"
                />
                <p className="text-gray-400 text-xs mt-1">Your doctor can monitor your progress with this ID</p>
              </div>
            </>
          )}

          <button
            type="submit"
            className={`w-full p-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-xl ${
              userType === 'patient' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
            }`}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;