export interface MoodEntry {
  id: string;
  mood: 'sad' | 'normal' | 'happy' | 'excited';
  timestamp: Date;
  note?: string;
}

export interface SleepEntry {
  id: string;
  bedtime: Date;
  wakeTime: Date;
  duration: number;
  quality: number;
  score: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface InitialAssessment {
  id: string;
  answers: Record<string, number>;
  completedAt: Date;
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface FaceDiaryEntry {
  id: string;
  timestamp: Date;
  videoBlob?: Blob;
  analysis: {
    dominantEmotion: string;
    emotions: Record<string, number>;
    depressionIndicators: string[];
    overallScore: number;
    behavioralNotes: string[];
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  registeredAt: Date;
  doctorId?: string;
  userType: 'patient' | 'doctor';
  patientIds?: string[];
}