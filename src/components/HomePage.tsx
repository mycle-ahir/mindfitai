import React from 'react';
import Header from './Header';
import MoodTracker from './MoodTracker';
import SleepTracker from './SleepTracker';
import InitialAssessment from './InitialAssessment';
import UpcomingTasks from './UpcomingTasks';
import { storage } from '../utils/storage';

interface HomePageProps {
  onRefresh?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onRefresh }) => {
  const userProfile = storage.getUserProfile();
  const assessment = storage.getAssessment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header 
        title="Dashboard" 
        subtitle={userProfile ? `Welcome, ${userProfile.name} 👋` : 'Welcome to Mindfit AI 🌟'} 
      />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Main features grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Mood Tracker */}
          <MoodTracker onMoodAdded={onRefresh} />
          
          {/* Sleep Tracker */}
          <SleepTracker onSleepAdded={onRefresh} />
          
          {/* Initial Assessment - only show if not completed */}
          {!assessment && (
            <InitialAssessment onCompleted={onRefresh} />
          )}
          
          {/* Upcoming Tasks */}
          <UpcomingTasks />
        </div>

        {/* Today's Summary */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-semibold">Today's Summary</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white bg-opacity-20 rounded-xl">
              <div className="text-2xl font-bold">{storage.getMoodEntries().filter(entry => 
                new Date(entry.timestamp).toDateString() === new Date().toDateString()
              ).length}</div>
              <div className="text-sm opacity-90 flex items-center justify-center space-x-1">
                <span>😊</span>
                <span>Mood Check-ins</span>
              </div>
            </div>
            <div className="text-center p-3 bg-white bg-opacity-20 rounded-xl">
              <div className="text-2xl font-bold">{storage.getTasks().filter(task => !task.completed).length}</div>
              <div className="text-sm opacity-90 flex items-center justify-center space-x-1">
                <span>📋</span>
                <span>Pending Tasks</span>
              </div>
            </div>
            <div className="text-center p-3 bg-white bg-opacity-20 rounded-xl">
              <div className="text-2xl font-bold">{storage.getFaceDiaryEntries().length}</div>
              <div className="text-sm opacity-90 flex items-center justify-center space-x-1">
                <span>📸</span>
                <span>Face Diary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Card */}
        <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">🌟</div>
            <h3 className="text-lg font-semibold mb-2">You're doing great!</h3>
            <p className="text-sm opacity-90">
              Every step towards better mental health matters. Keep tracking your progress! 💪
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;