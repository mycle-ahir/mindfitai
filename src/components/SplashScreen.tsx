import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Heart, Shield, Zap, Star } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  const features = [
    { icon: Brain, text: "AI-Powered Analysis", color: "text-orange-500", emoji: "🧠" },
    { icon: Heart, text: "Mental Health Tracking", color: "text-red-500", emoji: "❤️" },
    { icon: Shield, text: "Secure & Private", color: "text-green-500", emoji: "🛡️" },
  ];

  useEffect(() => {
    // Show logo animation first
    setTimeout(() => setShowLogo(true), 500);
    
    const timer = setTimeout(() => {
      if (currentStep < features.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setTimeout(onComplete, 1500);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-20 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-300 bg-opacity-30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-green-300 bg-opacity-30 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-orange-300 bg-opacity-20 rounded-full animate-bounce"></div>
        
        {/* Floating Stars */}
        <div className="absolute top-32 left-1/4 animate-spin">
          <Star size={24} className="text-yellow-300 opacity-70" />
        </div>
        <div className="absolute bottom-32 right-1/4 animate-spin" style={{ animationDelay: '1s' }}>
          <Sparkles size={20} className="text-pink-300 opacity-70" />
        </div>
        <div className="absolute top-1/2 left-16 animate-spin" style={{ animationDelay: '2s' }}>
          <Zap size={28} className="text-orange-300 opacity-70" />
        </div>
      </div>

      <div className="text-center z-10">
        {/* Logo with Animation */}
        <div className={`mb-8 transition-all duration-1000 ${showLogo ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className="relative">
            <div className="p-8 bg-white bg-opacity-20 rounded-full backdrop-blur-sm border-4 border-white border-opacity-30 shadow-2xl animate-pulse">
              <Brain size={80} className="text-white mx-auto" />
            </div>
            <div className="absolute -top-4 -right-4 animate-bounce">
              <div className="text-4xl">🧠</div>
            </div>
            <div className="absolute -bottom-2 -left-2 animate-spin">
              <Sparkles size={32} className="text-yellow-300" />
            </div>
          </div>
        </div>

        {/* App Name with Gradient */}
        <div className={`transition-all duration-1000 delay-500 ${showLogo ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Mindfit
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> AI</span>
          </h1>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">🌟</span>
            <p className="text-2xl text-white text-opacity-90 font-light">Your Mental Health Companion</p>
            <span className="text-2xl">🌟</span>
          </div>
        </div>

        {/* Feature Animation */}
        <div className="space-y-8 mt-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = index <= currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-center space-x-6 transition-all duration-1000 ${
                  isActive ? 'opacity-100 translate-x-0 scale-100' : 'opacity-30 translate-x-8 scale-95'
                }`}
              >
                <div className={`p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm ${isActive ? 'animate-bounce' : ''}`}>
                  <Icon size={32} className="text-white" />
                </div>
                <div className="text-4xl animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}>
                  {feature.emoji}
                </div>
                <span className="text-white text-xl font-semibold">{feature.text}</span>
              </div>
            );
          })}
        </div>

        {/* Loading Indicator */}
        <div className="mt-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl animate-spin">⭐</span>
            <span className="text-white text-lg">Loading your wellness journey...</span>
            <span className="text-2xl animate-spin" style={{ animationDelay: '0.5s' }}>🌟</span>
          </div>
          <div className="w-80 h-3 bg-white bg-opacity-20 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full transition-all duration-2000 ease-out"
              style={{ width: `${((currentStep + 1) / features.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;