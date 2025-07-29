import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Task } from '../types';
import { storage } from '../utils/storage';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

const UpcomingTasks: React.FC = () => {
  const tasks = storage.getTasks()
    .filter(task => !task.completed)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  const getTaskStatus = (task: Task) => {
    if (isPast(task.dueDate) && !isToday(task.dueDate)) {
      return { color: 'text-red-600', bg: 'bg-red-50', label: 'Overdue', emoji: '⚠️' };
    }
    if (isToday(task.dueDate)) {
      return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Today', emoji: '📅' };
    }
    if (isTomorrow(task.dueDate)) {
      return { color: 'text-green-600', bg: 'bg-green-50', label: 'Tomorrow', emoji: '🗓️' };
    }
    return { color: 'text-gray-600', bg: 'bg-gray-50', label: format(task.dueDate, 'MMM d'), emoji: '📆' };
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getPriorityEmoji = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-400">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📋</span>
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Tasks</h3>
          </div>
          <CheckCircle size={20} className="text-green-600" />
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-gray-600 font-medium">All caught up!</p>
          <p className="text-sm text-gray-500">No upcoming tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-cyan-400">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📋</span>
          <h3 className="text-lg font-semibold text-gray-800">Upcoming Tasks</h3>
        </div>
        <Clock size={20} className="text-cyan-600" />
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const status = getTaskStatus(task);
          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border-l-4 ${getPriorityColor(task.priority)} bg-gradient-to-r from-gray-50 to-cyan-50 hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span>{getPriorityEmoji(task.priority)}</span>
                    <h4 className="font-medium text-gray-800 text-sm">{task.title}</h4>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-600 mt-1 ml-6">{task.description}</p>
                  )}
                  <div className="flex items-center space-x-3 mt-2 ml-6">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">📅</span>
                      <span className="text-xs text-gray-500">
                        {format(task.dueDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
                      <span className="mr-1">{status.emoji}</span>
                      {status.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 5 && (
        <div className="text-center mt-4">
          <button className="text-cyan-600 text-sm font-medium hover:text-cyan-700 flex items-center justify-center space-x-1 mx-auto">
            <span>📋</span>
            <span>View all tasks</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks;