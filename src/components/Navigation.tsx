import React from 'react';
import { Home, Calendar, Camera, User, MessageCircle } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, emoji: '🏠' },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle, emoji: '🤖' },
    { id: 'planner', label: 'Planner', icon: Calendar, emoji: '📅' },
    { id: 'face-diary', label: 'Face Diary', icon: Camera, emoji: '📸' },
    { id: 'profile', label: 'Profile', icon: User, emoji: '👤' },
  ];

  return (
    <nav className="bg-white shadow-2xl border-t-2 border-orange-200">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 transform ${
                  isActive
                    ? 'text-orange-600 bg-gradient-to-t from-orange-50 to-red-50 scale-110 shadow-lg'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 hover:scale-105'
                }`}
              >
                <div className="relative">
                  <Icon size={24} />
                  {isActive && (
                    <div className="absolute -top-1 -right-1 text-sm">
                      {item.emoji}
                    </div>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-orange-500 rounded-full mt-1"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;