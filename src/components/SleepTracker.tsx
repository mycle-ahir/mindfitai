import React, { useState } from 'react';
import { Moon, Clock, TrendingUp } from 'lucide-react';
import { SleepEntry } from '../types';
import { storage } from '../utils/storage';

interface SleepTrackerProps {
  onSleepAdded?: () => void;
}

const SleepTracker: React.FC<SleepTrackerProps> = ({ onSleepAdded }) => {
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState(5);
  const [isAdding, setIsAdding] = useState(false);

  const calculateSleepScore = (duration: number, quality: number): number => {
    // Optimal sleep duration is 7-9 hours
    let durationScore = 0;
    if (duration >= 7 && duration <= 9) {
      durationScore = 100;
    } else if (duration >= 6 && duration <= 10) {
      durationScore = 80;
    } else if (duration >= 5 && duration <= 11) {
      durationScore = 60;
    } else {
      durationScore = 40;
    }

    // Quality score (1-10 scale)
    const qualityScore = quality * 10;

    // Weighted average
    return Math.round((durationScore * 0.6) + (qualityScore * 0.4));
  };

  const handleSaveSleep = () => {
    if (!bedtime || !wakeTime) return;

    const bedtimeDate = new Date(`2024-01-01T${bedtime}:00`);
    const wakeTimeDate = new Date(`2024-01-01T${wakeTime}:00`);
    
    // Handle overnight sleep
    if (wakeTimeDate < bedtimeDate) {
      wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
    }

    const duration = (wakeTimeDate.getTime() - bedtimeDate.getTime()) / (1000 * 60 * 60);
    const score = calculateSleepScore(duration, quality);

    const newEntry: SleepEntry = {
      id: crypto.randomUUID(),
      bedtime: bedtimeDate,
      wakeTime: wakeTimeDate,
      duration,
      quality,
      score
    };

    storage.saveSleepEntry(newEntry);
    setBedtime('');
    setWakeTime('');
    setQuality(5);
    setIsAdding(false);
    onSleepAdded?.();
  };

  const recentSleep = storage.getSleepEntries().slice(-1)[0];

  if (isAdding) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-400">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">🌙</span>
          <h3 className="text-lg font-semibold text-gray-800">Log Sleep</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🛏️ Bedtime
            </label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⏰ Wake Time
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⭐ Sleep Quality (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${quality * 10}%, #e5e7eb ${quality * 10}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold text-indigo-600">{quality}</span>
                <span className="text-lg">{'⭐'.repeat(Math.min(quality, 5))}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSaveSleep}
              disabled={!bedtime || !wakeTime}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg disabled:from-gray-300 disabled:to-gray-400"
            >
              💾 Save Sleep
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-400">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🌙</span>
          <h3 className="text-lg font-semibold text-gray-800">Sleep Tracker</h3>
        </div>
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Moon size={20} className="text-indigo-600" />
        </div>
      </div>

      {recentSleep ? (
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl border border-indigo-100">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⏰</span>
              <div>
                <div className="text-sm text-gray-600">Last Sleep</div>
                <div className="font-semibold text-gray-800">{recentSleep.duration.toFixed(1)} hours</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Quality</div>
              <div className="flex items-center space-x-1">
                <span className="font-bold text-indigo-600">{recentSleep.quality}/10</span>
                <span>{'⭐'.repeat(Math.min(recentSleep.quality, 5))}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <div className="text-sm text-gray-600">Sleep Score</div>
                <div className="font-bold text-green-600 text-xl">{recentSleep.score}/100</div>
              </div>
            </div>
            <TrendingUp size={24} className="text-green-600" />
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-xl">
          <span className="text-xl">💤</span>
          <p className="text-sm text-gray-600">Track your sleep quality and duration</p>
        </div>
      )}

      <button
        onClick={() => setIsAdding(true)}
        className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-cyan-600 transition-all duration-200 shadow-lg transform hover:scale-105"
      >
        🌙 Log Sleep
      </button>
    </div>
  );
};

export default SleepTracker;