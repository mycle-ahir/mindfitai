import React, { useState } from 'react';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { InitialAssessment } from '../types';
import { storage } from '../utils/storage';

const ASSESSMENT_QUESTIONS = [
  "I have felt sad or down most of the day",
  "I have lost interest in activities I used to enjoy",
  "I have trouble sleeping or sleep too much",
  "I feel tired and have little energy",
  "I have poor appetite or overeating",
  "I feel bad about myself or like a failure",
  "I have trouble concentrating on things",
  "I move or speak slowly or am restless",
  "I have thoughts of death or self-harm",
  "I feel hopeless about the future",
  "I worry excessively about different things",
  "I feel nervous or on edge",
  "I have trouble relaxing",
  "I am easily annoyed or irritable",
  "I feel afraid something awful might happen",
  "I avoid social situations",
  "I have panic attacks or sudden fear",
  "I feel overwhelmed by daily tasks",
  "I have difficulty making decisions",
  "I feel isolated from others",
  "I experience mood swings",
  "I have physical symptoms (headaches, stomach issues)",
  "I have trouble at work or school",
  "I use substances to cope with feelings",
  "I feel like my problems are getting worse"
];

interface InitialAssessmentProps {
  onCompleted?: () => void;
}

const InitialAssessmentComponent: React.FC<InitialAssessmentProps> = ({ onCompleted }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const existingAssessment = storage.getAssessment();

  const handleAnswer = (score: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: score
    }));
  };

  const handleNext = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = (answers: Record<string, number>): number => {
    const total = Object.values(answers).reduce((sum, score) => sum + score, 0);
    return Math.round((total / (ASSESSMENT_QUESTIONS.length * 4)) * 100);
  };

  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score < 30) return 'low';
    if (score < 60) return 'medium';
    return 'high';
  };

  const completeAssessment = () => {
    const score = calculateScore(answers);
    const assessment: InitialAssessment = {
      id: crypto.randomUUID(),
      answers,
      completedAt: new Date(),
      score,
      riskLevel: getRiskLevel(score)
    };

    storage.saveAssessment(assessment);
    setIsCompleted(true);
    onCompleted?.();
  };

  if (existingAssessment) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center">
          <div className="p-3 bg-green-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Assessment Completed</h3>
          <p className="text-sm text-gray-600 mb-4">
            Completed on {existingAssessment.completedAt.toLocaleDateString()}
          </p>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {existingAssessment.score}/100
            </div>
            <div className={`text-sm font-medium ${
              existingAssessment.riskLevel === 'high' ? 'text-red-600' :
              existingAssessment.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {existingAssessment.riskLevel.toUpperCase()} RISK
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center">
          <div className="p-3 bg-green-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Assessment Complete!</h3>
          <p className="text-sm text-gray-600">Your responses have been saved</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;
  const currentAnswer = answers[currentQuestion];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Initial Assessment</h3>
          <span className="text-sm text-gray-600">
            {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-base font-medium text-gray-800 mb-6 leading-relaxed">
          {ASSESSMENT_QUESTIONS[currentQuestion]}
        </h4>

        <div className="space-y-3">
          {[
            { value: 0, label: 'Never' },
            { value: 1, label: 'Sometimes' },
            { value: 2, label: 'Often' },
            { value: 3, label: 'Almost Always' },
            { value: 4, label: 'Always' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                currentAnswer === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                {currentAnswer === option.value ? (
                  <CheckCircle size={20} className="text-blue-600" />
                ) : (
                  <Circle size={20} className="text-gray-400" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={20} />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentAnswer === undefined}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <span>{currentQuestion === ASSESSMENT_QUESTIONS.length - 1 ? 'Complete' : 'Next'}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default InitialAssessmentComponent;