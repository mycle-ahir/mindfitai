import React, { useState, useEffect } from 'react';
import { Search, Users, TrendingUp, AlertTriangle, Calendar, Brain, Heart, Moon, CheckCircle, User, LogOut } from 'lucide-react';
import { storage } from '../utils/storage';
import { UserProfile, MoodEntry, SleepEntry, FaceDiaryEntry, InitialAssessment } from '../types';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, isWithinInterval } from 'date-fns';

interface DoctorDashboardProps {
  onLogout: () => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onLogout }) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'analytics'>('overview');

  const currentUser = storage.getUserProfile();
  const allUsers = storage.getAllUsers();
  const patients = allUsers.filter(user => 
    user.userType === 'patient' && 
    (user.doctorId === currentUser?.id || searchTerm === '' || 
     user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPatientData = (patientId: string) => {
    // Set current user context to get patient's data
    const originalUser = storage.getCurrentUser();
    storage.setCurrentUser(patientId);
    
    const moodEntries = storage.getMoodEntries();
    const sleepEntries = storage.getSleepEntries();
    const faceDiaryEntries = storage.getFaceDiaryEntries();
    const assessment = storage.getAssessment();
    const tasks = storage.getTasks();
    
    // Restore original user
    if (originalUser) storage.setCurrentUser(originalUser);
    
    return { moodEntries, sleepEntries, faceDiaryEntries, assessment, tasks };
  };

  const getPatientStats = () => {
    const totalPatients = patients.length;
    const highRiskPatients = patients.filter(patient => {
      const { assessment } = getPatientData(patient.id);
      return assessment?.riskLevel === 'high';
    }).length;
    
    const recentActivity = patients.filter(patient => {
      const { moodEntries, faceDiaryEntries } = getPatientData(patient.id);
      const recentEntries = [...moodEntries, ...faceDiaryEntries].filter(entry => 
        isWithinInterval(entry.timestamp, { start: subDays(new Date(), 7), end: new Date() })
      );
      return recentEntries.length > 0;
    }).length;

    return { totalPatients, highRiskPatients, recentActivity };
  };

  const renderPatientCard = (patient: UserProfile) => {
    const { moodEntries, sleepEntries, faceDiaryEntries, assessment } = getPatientData(patient.id);
    const recentMood = moodEntries.slice(-1)[0];
    const recentSleep = sleepEntries.slice(-1)[0];
    const recentFaceDiary = faceDiaryEntries.slice(-1)[0];

    const getRiskColor = (riskLevel?: string) => {
      switch (riskLevel) {
        case 'high': return 'text-red-600 bg-red-50 border-red-200';
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'low': return 'text-green-600 bg-green-50 border-green-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    return (
      <div
        key={patient.id}
        onClick={() => setSelectedPatient(patient.id)}
        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{patient.name}</h3>
              <p className="text-sm text-gray-600">ID: {patient.id.slice(0, 8)}</p>
              <p className="text-xs text-gray-500">
                Joined {format(patient.registeredAt, 'MMM yyyy')}
              </p>
            </div>
          </div>
          {assessment && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(assessment.riskLevel)}`}>
              {assessment.riskLevel?.toUpperCase()} RISK
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <Heart size={20} className="text-blue-600 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-800">{moodEntries.length}</div>
            <div className="text-xs text-gray-600">Mood Entries</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <Moon size={20} className="text-purple-600 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-800">
              {recentSleep ? `${recentSleep.score}/100` : 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Sleep Score</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <Brain size={20} className="text-green-600 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-800">
              {recentFaceDiary ? recentFaceDiary.analysis.overallScore : 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Wellbeing</div>
          </div>
        </div>

        {recentMood && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Latest Mood:</span>
              <span className="text-sm font-medium capitalize text-gray-800">{recentMood.mood}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPatientDetails = () => {
    if (!selectedPatient) return null;

    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) return null;

    const { moodEntries, sleepEntries, faceDiaryEntries, assessment, tasks } = getPatientData(selectedPatient);

    // Analytics data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'MMM dd'),
        mood: moodEntries.filter(entry => 
          format(entry.timestamp, 'MMM dd') === format(date, 'MMM dd')
        ).length,
        sleep: sleepEntries.find(entry => 
          format(entry.bedtime, 'MMM dd') === format(date, 'MMM dd')
        )?.score || 0,
        wellbeing: faceDiaryEntries.find(entry => 
          format(entry.timestamp, 'MMM dd') === format(date, 'MMM dd')
        )?.analysis.overallScore || 0
      };
    }).reverse();

    const moodDistribution = [
      { name: 'Sad', value: moodEntries.filter(e => e.mood === 'sad').length, color: '#EF4444' },
      { name: 'Normal', value: moodEntries.filter(e => e.mood === 'normal').length, color: '#F59E0B' },
      { name: 'Happy', value: moodEntries.filter(e => e.mood === 'happy').length, color: '#10B981' },
      { name: 'Excited', value: moodEntries.filter(e => e.mood === 'excited').length, color: '#8B5CF6' }
    ].filter(item => item.value > 0);

    return (
      <div className="space-y-6">
        {/* Patient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{patient.name}</h2>
                <p className="text-blue-100">Patient ID: {patient.id.slice(0, 8)}</p>
                <p className="text-blue-100 text-sm">
                  {patient.age && `Age: ${patient.age} • `}
                  Member since {format(patient.registeredAt, 'MMM yyyy')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Assessment Results */}
        {assessment && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Initial Assessment</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${
                  assessment.riskLevel === 'high' ? 'text-red-600' :
                  assessment.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {assessment.score}/100
                </div>
                <div className={`text-sm font-medium ${
                  assessment.riskLevel === 'high' ? 'text-red-600' :
                  assessment.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {assessment.riskLevel?.toUpperCase()} RISK
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Completed:</strong> {format(assessment.completedAt, 'MMM d, yyyy')}</p>
                <p><strong>Questions:</strong> 25 answered</p>
                <p className="mt-2">
                  {assessment.riskLevel === 'high' && 
                    <span className="text-red-600">⚠️ Requires immediate attention</span>
                  }
                  {assessment.riskLevel === 'medium' && 
                    <span className="text-yellow-600">⚠️ Monitor closely</span>
                  }
                  {assessment.riskLevel === 'low' && 
                    <span className="text-green-600">✅ Low risk profile</span>
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7-Day Trends */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">7-Day Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Line type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={2} name="Mood Entries" />
                <Line type="monotone" dataKey="sleep" stroke="#10B981" strokeWidth={2} name="Sleep Score" />
                <Line type="monotone" dataKey="wellbeing" stroke="#8B5CF6" strokeWidth={2} name="Wellbeing" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-xs text-gray-600">Mood Entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-xs text-gray-600">Sleep Score</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span className="text-xs text-gray-600">Wellbeing</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Mood Entries */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Mood Entries</h3>
            <div className="space-y-3">
              {moodEntries.slice(-5).reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-medium capitalize">{entry.mood}</span>
                    <p className="text-sm text-gray-600">{format(entry.timestamp, 'MMM d, h:mm a')}</p>
                    {entry.note && <p className="text-xs text-gray-500 mt-1">{entry.note}</p>}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    entry.mood === 'excited' ? 'bg-purple-500' :
                    entry.mood === 'happy' ? 'bg-green-500' :
                    entry.mood === 'normal' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Face Diary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Face Diary Reports</h3>
            <div className="space-y-3">
              {faceDiaryEntries.slice(-5).reverse().map((entry) => (
                <div key={entry.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{entry.analysis.dominantEmotion}</span>
                      <p className="text-sm text-gray-600">{format(entry.timestamp, 'MMM d, h:mm a')}</p>
                      {entry.analysis.depressionIndicators.length > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          {entry.analysis.depressionIndicators.length} depression indicators
                        </p>
                      )}
                    </div>
                    <div className={`text-lg font-bold ${
                      entry.analysis.overallScore >= 70 ? 'text-green-600' :
                      entry.analysis.overallScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {entry.analysis.overallScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mood Distribution */}
        {moodDistribution.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Mood Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {moodDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value} entries</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const stats = getPatientStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                <Brain size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
                <p className="text-gray-600">Welcome, Dr. {currentUser?.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {selectedPatient ? (
          renderPatientDetails()
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Patients</p>
                    <p className="text-3xl font-bold">{stats.totalPatients}</p>
                  </div>
                  <Users size={32} className="text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">High Risk Patients</p>
                    <p className="text-3xl font-bold">{stats.highRiskPatients}</p>
                  </div>
                  <AlertTriangle size={32} className="text-red-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Active This Week</p>
                    <p className="text-3xl font-bold">{stats.recentActivity}</p>
                  </div>
                  <TrendingUp size={32} className="text-green-200" />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search size={20} className="absolute left-4 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map(renderPatientCard)}
            </div>

            {patients.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No patients found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Patients will appear here when they add your doctor ID'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;