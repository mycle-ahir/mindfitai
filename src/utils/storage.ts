import { MoodEntry, SleepEntry, Task, InitialAssessment, FaceDiaryEntry, UserProfile } from '../types';

const STORAGE_KEYS = {
  MOOD_ENTRIES: 'mindfit_mood_entries',
  SLEEP_ENTRIES: 'mindfit_sleep_entries',
  TASKS: 'mindfit_tasks',
  ASSESSMENT: 'mindfit_assessment',
  FACE_DIARY: 'mindfit_face_diary',
  USER_PROFILE: 'mindfit_user_profile',
  CURRENT_USER: 'mindfit_current_user',
  ALL_USERS: 'mindfit_all_users',
  AUTH_STATE: 'mindfit_auth_state'
};

export const storage = {
  getMoodEntries: (): MoodEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MOOD_ENTRIES);
    return data ? JSON.parse(data).map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    })) : [];
  },

  saveMoodEntry: (entry: MoodEntry) => {
    const entries = storage.getMoodEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEYS.MOOD_ENTRIES, JSON.stringify(entries));
  },

  getSleepEntries: (): SleepEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SLEEP_ENTRIES);
    return data ? JSON.parse(data).map((entry: any) => ({
      ...entry,
      bedtime: new Date(entry.bedtime),
      wakeTime: new Date(entry.wakeTime)
    })) : [];
  },

  saveSleepEntry: (entry: SleepEntry) => {
    const entries = storage.getSleepEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEYS.SLEEP_ENTRIES, JSON.stringify(entries));
  },

  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data).map((task: any) => ({
      ...task,
      dueDate: new Date(task.dueDate)
    })) : [];
  },

  saveTask: (task: Task) => {
    const tasks = storage.getTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getAssessment: (): InitialAssessment | null => {
    const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENT);
    return data ? {
      ...JSON.parse(data),
      completedAt: new Date(JSON.parse(data).completedAt)
    } : null;
  },

  saveAssessment: (assessment: InitialAssessment) => {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENT, JSON.stringify(assessment));
  },

  getFaceDiaryEntries: (): FaceDiaryEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FACE_DIARY);
    return data ? JSON.parse(data).map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    })) : [];
  },

  saveFaceDiaryEntry: (entry: FaceDiaryEntry) => {
    const entries = storage.getFaceDiaryEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEYS.FACE_DIARY, JSON.stringify(entries));
  },

  getUserProfile: (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? {
      ...JSON.parse(data),
      registeredAt: new Date(JSON.parse(data).registeredAt)
    } : null;
  },

  saveUserProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getCurrentUser: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  },

  setCurrentUser: (userId: string) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  },

  getAllUsers: (): UserProfile[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    return data ? JSON.parse(data).map((user: any) => ({
      ...user,
      registeredAt: new Date(user.registeredAt)
    })) : [];
  },

  saveAllUsers: (users: UserProfile[]) => {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  },

  addUser: (user: UserProfile) => {
    const users = storage.getAllUsers();
    users.push(user);
    storage.saveAllUsers(users);
  },

  getUserById: (userId: string): UserProfile | null => {
    const users = storage.getAllUsers();
    return users.find(user => user.id === userId) || null;
  },

  updateUser: (updatedUser: UserProfile) => {
    const users = storage.getAllUsers();
    const index = users.findIndex(user => user.id === updatedUser.id);
    if (index >= 0) {
      users[index] = updatedUser;
      storage.saveAllUsers(users);
    }
  },

  getAuthState: (): { isAuthenticated: boolean; userType: 'patient' | 'doctor' | null } => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
    return data ? JSON.parse(data) : { isAuthenticated: false, userType: null };
  },

  setAuthState: (isAuthenticated: boolean, userType: 'patient' | 'doctor' | null) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify({ isAuthenticated, userType }));
  },

  clearAuthState: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};