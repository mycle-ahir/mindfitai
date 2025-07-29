import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Task } from '../types';
import { storage } from '../utils/storage';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, isToday } from 'date-fns';
import { useHaptics } from '../hooks/useCapacitor';

interface TaskPlannerProps {
  onTaskUpdated?: () => void;
}

const TaskPlanner: React.FC<TaskPlannerProps> = ({ onTaskUpdated }) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    priority: 'medium' as Task['priority']
  });

  const { impact } = useHaptics();

  const tasks = storage.getTasks();

  const getFilteredTasks = () => {
    const now = new Date();
    
    switch (view) {
      case 'day':
        return tasks.filter(task => isToday(task.dueDate));
      case 'week':
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        return tasks.filter(task => isWithinInterval(task.dueDate, { start: weekStart, end: weekEnd }));
      case 'month':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        return tasks.filter(task => isWithinInterval(task.dueDate, { start: monthStart, end: monthEnd }));
      default:
        return tasks;
    }
  };

  const handleSaveTask = () => {
    const taskData: Task = {
      id: editingTask?.id || crypto.randomUUID(),
      title: newTask.title,
      description: newTask.description || undefined,
      dueDate: new Date(newTask.dueDate),
      completed: editingTask?.completed || false,
      priority: newTask.priority
    };

    storage.saveTask(taskData);
    
    setNewTask({
      title: '',
      description: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      priority: 'medium'
    });
    setShowAddTask(false);
    setEditingTask(null);
    onTaskUpdated?.();
  };

  const handleToggleComplete = (task: Task) => {
    const updatedTask = { ...task, completed: !task.completed };
    storage.saveTask(updatedTask);
    onTaskUpdated?.();
  };

  const handleEditTask = (task: Task) => {
    setNewTask({
      title: task.title,
      description: task.description || '',
      dueDate: format(task.dueDate, 'yyyy-MM-dd'),
      priority: task.priority
    });
    setEditingTask(task);
    setShowAddTask(true);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('mindfit_tasks', JSON.stringify(updatedTasks));
    onTaskUpdated?.();
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const filteredTasks = getFilteredTasks().sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Task Planner</h1>
            <button
              onClick={() => setShowAddTask(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* View Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType as any)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium capitalize transition-colors ${
                  view === viewType
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {viewType}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Add/Edit Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Task title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Task description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSaveTask}
                    disabled={!newTask.title.trim()}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                  >
                    {editingTask ? 'Update' : 'Add'} Task
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTask(false);
                      setEditingTask(null);
                      setNewTask({
                        title: '',
                        description: '',
                        dueDate: format(new Date(), 'yyyy-MM-dd'),
                        priority: 'medium'
                      });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-4">Create your first task to get started</p>
              <button
                onClick={() => setShowAddTask(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Task
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${
                  task.completed ? 'opacity-60' : ''
                } ${
                  task.priority === 'high' ? 'border-l-red-500' :
                  task.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1"
                  >
                    {task.completed ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <Circle size={20} className="text-gray-400 hover:text-green-600" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {format(task.dueDate, 'MMM d, yyyy')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPlanner;