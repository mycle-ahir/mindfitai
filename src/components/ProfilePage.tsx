import React from 'react';
import { User, TrendingUp, Brain, Calendar, BarChart3, Stethoscope, Edit, Save, X, LogOut, Moon, Heart } from 'lucide-react';
import { storage } from '../utils/storage';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { format, subDays, isWithinInterval } from 'date-fns';
import { useShare, useDevice } from '../hooks/useCapacitor';

interface ProfilePageProps {
  onLogout?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const [isEditingDoctorId, setIsEditingDoctorId] = React.useState(false);
  const [doctorId, setDoctorId] = React.useState('');
  
  const { share } = useShare();
  const { deviceInfo, isNative } = useDevice();
  
  const userProfile = storage.getUserProfile();
  const moodEntries = storage.getMoodEntries();
  const sleepEntries = storage.getSleepEntries();
  const faceDiaryEntries = storage.getFaceDiaryEntries();
  const assessment = storage.getAssessment();
  const tasks = storage.getTasks();

  React.useEffect(() => {
    if (userProfile?.doctorId) {
      setDoctorId(userProfile.doctorId);
    }
  }, [userProfile]);

  const handleSaveDoctorId = () => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, doctorId: doctorId.trim() || undefined };
      storage.saveUserProfile(updatedProfile);
      storage.updateUser(updatedProfile);
      setIsEditingDoctorId(false);
    }
  };

  // Calculate analytics
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dayMoods = moodEntries.filter(entry => 
      format(entry.timestamp, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    const daySleep = sleepEntries.find(entry => 
      format(entry.bedtime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    const dayFaceDiary = faceDiaryEntries.find(entry => 
      format(entry.timestamp, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    // Calculate mood score (sad=1, normal=2, happy=3, excited=4)
    const moodScore = dayMoods.length > 0 
      ? dayMoods.reduce((sum, entry) => {
          const scores = { sad: 1, normal: 2, happy: 3, excited: 4 };
          return sum + scores[entry.mood];
        }, 0) / dayMoods.length * 25 // Scale to 100
      : 0;

    return {
      date: format(date, 'MMM dd'),
      fullDate: format(date, 'yyyy-MM-dd'),
      moodEntries: dayMoods.length,
      moodScore: Math.round(moodScore),
      sleepScore: daySleep?.score || 0,
      sleepDuration: daySleep?.duration || 0,
      wellbeingScore: dayFaceDiary?.analysis.overallScore || 0
    };
  }).reverse();

  const moodDistribution = [
    { name: 'Sad', value: moodEntries.filter(e => e.mood === 'sad').length, color: '#EF4444', emoji: '😢' },
    { name: 'Normal', value: moodEntries.filter(e => e.mood === 'normal').length, color: '#F59E0B', emoji: '😐' },
    { name: 'Happy', value: moodEntries.filter(e => e.mood === 'happy').length, color: '#10B981', emoji: '😊' },
    { name: 'Excited', value: moodEntries.filter(e => e.mood === 'excited').length, color: '#F97316', emoji: '🤩' }
  ].filter(item => item.value > 0);

  const sleepQualityData = sleepEntries.slice(-7).map((entry, index) => ({
    day: format(entry.bedtime, 'EEE'),
    quality: entry.quality,
    duration: entry.duration,
    score: entry.score
  }));

  const faceDiaryTrends = faceDiaryEntries.slice(-10).map((entry, index) => ({
    session: `Session ${index + 1}`,
    wellbeing: entry.analysis.overallScore,
    dominantEmotion: entry.analysis.dominantEmotion,
    indicators: entry.analysis.depressionIndicators.length
  }));

  const averageSleepScore = sleepEntries.length > 0 
    ? Math.round(sleepEntries.reduce((sum, entry) => sum + entry.score, 0) / sleepEntries.length)
    : 0;

  const averageFaceDiaryScore = faceDiaryEntries.length > 0
    ? Math.round(faceDiaryEntries.reduce((sum, entry) => sum + entry.analysis.overallScore, 0) / faceDiaryEntries.length)
    : 0;

  const completedTasks = tasks.filter(task => task.completed).length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const handleLogout = () => {
    storage.clearAuthState();
    onLogout?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-md mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                {userProfile?.userType === 'doctor' ? <Stethoscope size={32} /> : <User size={32} />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">
                    {userProfile?.name || 'User Profile'}
                  </h1>
                  <span className="text-2xl">👤</span>
                </div>
                <p className="text-orange-100">
                  {userProfile?.userType === 'doctor' ? '👨‍⚕️ Doctor' : '🧑‍💼 Patient'} • Member since {userProfile ? format(userProfile.registeredAt, 'MMM yyyy') : 'Recently'}
                </p>
                {userProfile?.userType === 'patient' && (
                  <p className="text-orange-100 text-sm flex items-center">
                    <span className="mr-1">🆔</span>
                    ID: {userProfile.id.slice(0, 8)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-3 bg-white bg-opacity-20 rounded-2xl hover:bg-opacity-30 transition-colors"
              title="Logout"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Logout Button Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Account</h3>
                <p className="text-sm text-gray-600">Manage your account settings</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Doctor ID Section for Patients */}
        {userProfile?.userType === 'patient' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-400">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">👨‍⚕️</span>
              <h3 className="text-lg font-semibold text-gray-800">Doctor Connection</h3>
            </div>
            
            {!isEditingDoctorId ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <span className="mr-2">🆔</span>
                    Doctor ID
                  </p>
                  <p className="font-medium text-gray-800">
                    {userProfile.doctorId || 'Not connected'}
                  </p>
                  {userProfile.doctorId && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <span className="mr-1">✅</span>
                      Your doctor can monitor your progress
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsEditingDoctorId(true)}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                >
                  <Edit size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">🆔</span>
                    Doctor ID
                  </label>
                  <input
                    type="text"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    placeholder="Enter your doctor's ID"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <span className="mr-1">📊</span>
                    Your doctor will be able to view your mental health reports
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveDoctorId}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                  >
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingDoctorId(false);
                      setDoctorId(userProfile.doctorId || '');
                    }}
                    className="flex items-center space-x-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl shadow-lg p-4 text-white">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">😊</span>
              <div>
                <div className="text-2xl font-bold">{moodEntries.length}</div>
                <div className="text-sm opacity-90">Mood Entries</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl shadow-lg p-4 text-white">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌙</span>
              <div>
                <div className="text-2xl font-bold">{averageSleepScore}</div>
                <div className="text-sm opacity-90">Avg Sleep</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl shadow-lg p-4 text-white">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🧠</span>
              <div>
                <div className="text-2xl font-bold">{averageFaceDiaryScore}</div>
                <div className="text-sm opacity-90">Wellbeing</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-lg p-4 text-white">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="text-2xl font-bold">{taskCompletionRate}%</div>
                <div className="text-sm opacity-90">Tasks Done</div>
              </div>
            </div>
          </div>
        </div>

        {/* Initial Assessment Results */}
        {assessment && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-400">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">📋</span>
              <h3 className="text-lg font-semibold text-gray-800">Assessment Results</h3>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                assessment.riskLevel === 'high' ? 'text-red-500' :
                assessment.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {assessment.score}/100
              </div>
              <div className={`text-sm font-medium flex items-center justify-center space-x-2 ${
                assessment.riskLevel === 'high' ? 'text-red-600' :
                assessment.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                <span>
                  {assessment.riskLevel === 'high' ? '⚠️' : 
                   assessment.riskLevel === 'medium' ? '⚡' : '✅'}
                </span>
                <span>{assessment.riskLevel.toUpperCase()} RISK</span>
              </div>
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-center space-x-1">
                <span>📅</span>
                <span>Completed {format(assessment.completedAt, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        )}

        {/* 14-Day Mood & Sleep Trends */}
        {userProfile?.userType === 'patient' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-cyan-400">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">📈</span>
              <h3 className="text-lg font-semibold text-gray-800">14-Day Wellness Trends</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last14Days}>
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Area 
                    type="monotone" 
                    dataKey="moodScore" 
                    stackId="1"
                    stroke="#F97316" 
                    fill="#FED7AA"
                    name="Mood Score"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sleepScore" 
                    stackId="2"
                    stroke="#10B981" 
                    fill="#A7F3D0"
                    name="Sleep Score"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wellbeingScore" 
                    stackId="3"
                    stroke="#EC4899" 
                    fill="#FBCFE8"
                    name="Wellbeing"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span className="text-xs text-gray-600">😊 Mood</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-600">🌙 Sleep</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                <span className="text-xs text-gray-600">🧠 Wellbeing</span>
              </div>
            </div>
          </div>
        )}

        {/* Sleep Quality Analysis */}
        {userProfile?.userType === 'patient' && sleepQualityData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-400">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">🌙</span>
              <h3 className="text-lg font-semibold text-gray-800">Sleep Quality Analysis</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepQualityData}>
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Bar dataKey="quality" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-indigo-50 rounded-xl">
                <div className="text-lg font-bold text-indigo-600">
                  {sleepEntries.length > 0 ? (sleepEntries.reduce((sum, e) => sum + e.duration, 0) / sleepEntries.length).toFixed(1) : '0'}h
                </div>
                <div className="text-xs text-gray-600">⏰ Avg Duration</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-lg font-bold text-green-600">
                  {sleepEntries.length > 0 ? (sleepEntries.reduce((sum, e) => sum + e.quality, 0) / sleepEntries.length).toFixed(1) : '0'}/10
                </div>
                <div className="text-xs text-gray-600">⭐ Avg Quality</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <div className="text-lg font-bold text-orange-600">{averageSleepScore}</div>
                <div className="text-xs text-gray-600">📊 Sleep Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Mood Distribution */}
        {userProfile?.userType === 'patient' && moodDistribution.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-400">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">😊</span>
              <h3 className="text-lg font-semibold text-gray-800">Mood Distribution</h3>
            </div>
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
            <div className="grid grid-cols-2 gap-2 mt-4">
              {moodDistribution.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                  <span className="text-lg">{item.emoji}</span>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Face Diary Analysis Trends */}
        {userProfile?.userType === 'patient' && faceDiaryTrends.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-pink-400">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">🧠</span>
              <h3 className="text-lg font-semibold text-gray-800">Face Diary Analysis</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={faceDiaryTrends}>
                  <XAxis dataKey="session" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Line 
                    type="monotone" 
                    dataKey="wellbeing" 
                    stroke="#EC4899" 
                    strokeWidth={3}
                    dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <div className="text-center p-3 bg-pink-50 rounded-xl">
                <div className="text-2xl font-bold text-pink-600">{averageFaceDiaryScore}/100</div>
                <div className="text-sm text-gray-600">🎯 Average Wellbeing Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Face Diary Reports */}
        {userProfile?.userType === 'patient' && faceDiaryEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-400">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">📸</span>
              <h3 className="text-lg font-semibold text-gray-800">Recent Face Diary</h3>
            </div>
            <div className="space-y-3">
              {faceDiaryEntries.slice(-3).reverse().map((entry) => (
                <div key={entry.id} className="p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {entry.analysis.dominantEmotion === 'Happy' ? '😊' :
                           entry.analysis.dominantEmotion === 'Sad' ? '😢' :
                           entry.analysis.dominantEmotion === 'Angry' ? '😠' :
                           entry.analysis.dominantEmotion === 'Surprised' ? '😲' :
                           entry.analysis.dominantEmotion === 'Fearful' ? '😨' : '😐'}
                        </span>
                        <div className="font-medium text-gray-800">
                          {entry.analysis.dominantEmotion}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center space-x-1">
                        <span>📅</span>
                        <span>{format(entry.timestamp, 'MMM d, h:mm a')}</span>
                      </div>
                      {entry.analysis.depressionIndicators.length > 0 && (
                        <div className="text-xs text-orange-600 mt-1 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{entry.analysis.depressionIndicators.length} indicators detected</span>
                        </div>
                      )}
                    </div>
                    <div className={`text-xl font-bold ${
                      entry.analysis.overallScore >= 70 ? 'text-green-500' :
                      entry.analysis.overallScore >= 40 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {entry.analysis.overallScore}
                      <div className="text-xs text-gray-500 font-normal">Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {userProfile?.userType === 'patient' && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">💡</span>
              <h3 className="text-lg font-semibold text-green-800">Personalized Recommendations</h3>
            </div>
            <div className="space-y-3">
              {averageSleepScore < 70 && (
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-green-200">
                  <span className="text-xl">🌙</span>
                  <div>
                    <div className="font-medium text-green-800">Improve Sleep Quality</div>
                    <div className="text-sm text-green-700">
                      Consider establishing a regular sleep schedule and creating a relaxing bedtime routine.
                    </div>
                  </div>
                </div>
              )}
              
              {moodEntries.filter(e => e.mood === 'sad').length > moodEntries.length * 0.3 && (
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-green-200">
                  <span className="text-xl">👨‍⚕️</span>
                  <div>
                    <div className="font-medium text-green-800">Consider Professional Support</div>
                    <div className="text-sm text-green-700">
                      Your mood patterns suggest it might be helpful to speak with a mental health professional.
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-green-200">
                <span className="text-xl">📊</span>
                <div>
                  <div className="font-medium text-green-800">Keep Tracking</div>
                  <div className="text-sm text-green-700">
                    Consistent tracking helps identify patterns and monitor progress over time.
                  </div>
                </div>
              </div>

              {taskCompletionRate < 50 && (
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-green-200">
                  <span className="text-xl">✅</span>
                  <div>
                    <div className="font-medium text-green-800">Focus on Task Completion</div>
                    <div className="text-sm text-green-700">
                      Try breaking larger tasks into smaller, manageable steps to improve completion rates.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;