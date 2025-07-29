import React, { useState } from 'react';
import { Frown, Meh, Smile, Laugh, Plus } from 'lucide-react';
import { MoodEntry } from '../types';
import { storage } from '../utils/storage';
import { useHaptics } from '../hooks/useCapacitor';

interface MoodTrackerProps {
  onMoodAdded?: () => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodAdded }) => {
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [note, setNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const { impact } = useHaptics();

  const moods = [
    { id: 'sad' as const, label: 'Sad', icon: Frown, color: 'text-red-500', bgColor: 'bg-red-50' },
    { id: 'normal' as const, label: 'Normal', icon: Meh, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { id: 'happy' as const, label: 'Happy', icon: Smile, color: 'text-green-500', bgColor: 'bg-green-50' },
    { id: 'excited' as const, label: 'Excited', icon: Laugh, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  ];

  const handleMoodSelect = (mood: MoodEntry['mood']) => {
    impact(); // Haptic feedback
    setSelectedMood(mood);
    setIsAdding(true);
  };

  const handleSaveMood = () => {
    if (!selectedMood) return;

    const newEntry: MoodEntry = {
      id: crypto.randomUUID(),
      mood: selectedMood,
      timestamp: new Date(),
      note: note.trim() || undefined
    };

    storage.saveMoodEntry(newEntry);
    setSelectedMood(null);
    setNote('');
    setIsAdding(false);
    onMoodAdded?.();
  };

  const handleCancel = () => {
    setSelectedMood(null);
    setNote('');
    setIsAdding(false);
  };

  if (isAdding) {
    const selectedMoodData = moods.find(m => m.id === selectedMood);
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-400">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">😊</span>
          <h3 className="text-lg font-semibold text-gray-800">Add Mood Entry</h3>
        </div>
        
        <div className="flex items-center justify-center mb-6">
          {selectedMoodData && (
            <div className={`p-6 rounded-2xl ${selectedMoodData.bgColor} border-2 border-opacity-50`}>
              <div className="text-center">
                <selectedMoodData.icon size={32} className={selectedMoodData.color} />
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💭 How are you feeling? (Optional note)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any notes about your mood..."
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSaveMood}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
          >
            ✅ Save Mood
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-400">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">😊</span>
          <h3 className="text-lg font-semibold text-gray-800">How are you feeling?</h3>
        </div>
        <div className="p-2 bg-orange-50 rounded-lg">
          <Plus size={20} className="text-orange-600" />
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-6 flex items-center">
        <span className="mr-2">📊</span>
        Track your mood 4 times a day
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodSelect(mood.id)}
            className={`p-4 rounded-2xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${mood.bgColor}`}
          >
            <div className="flex flex-col items-center space-y-2">
              <mood.icon size={28} className={mood.color} />
              <span className="text-sm font-medium text-gray-700">{mood.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker;