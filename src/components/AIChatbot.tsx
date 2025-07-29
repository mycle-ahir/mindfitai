import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Heart, Brain, Lightbulb, MessageCircle, Trash2 } from 'lucide-react';
import { useHaptics } from '../hooks/useCapacitor';
import { storage } from '../utils/storage';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  emotion?: string;
}

interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  title: string;
}

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [conversationContext, setConversationContext] = useState<{
    userName?: string;
    recentTopics: string[];
    emotionalState?: string;
    sessionStartTime: Date;
    followUpQuestions: string[];
  }>({
    recentTopics: [],
    sessionStartTime: new Date(),
    followUpQuestions: []
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { impact } = useHaptics();

  useEffect(() => {
    loadChatSessions();
    if (!currentSession) {
      startNewChat();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatSessions = () => {
    const sessions = JSON.parse(localStorage.getItem('mindfit_chat_sessions') || '[]')
      .map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    setChatSessions(sessions);
  };

  const saveChatSession = (session: ChatSession) => {
    const sessions = [...chatSessions];
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    setChatSessions(sessions);
    localStorage.setItem('mindfit_chat_sessions', JSON.stringify(sessions));
  };

  const startNewChat = () => {
    const sessionId = crypto.randomUUID();
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      text: "Hello! 👋 I'm your AI mental health companion. I'm here to listen, support, and help you through whatever you're feeling. How are you doing today?",
      isBot: true,
      timestamp: new Date(),
      emotion: 'supportive'
    };
    
    setCurrentSession(sessionId);
    setMessages([welcomeMessage]);
    
    const newSession: ChatSession = {
      id: sessionId,
      messages: [welcomeMessage],
      createdAt: new Date(),
      title: 'New Chat'
    };
    
    saveChatSession(newSession);
  };

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(sessionId);
      setMessages(session.messages);
      setShowSessions(false);
    }
  };

  const deleteChatSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    localStorage.setItem('mindfit_chat_sessions', JSON.stringify(updatedSessions));
    
    if (currentSession === sessionId) {
      if (updatedSessions.length > 0) {
        loadChatSession(updatedSessions[0].id);
      } else {
        startNewChat();
      }
    }
  };

  const generateAIResponse = (userMessage: string): { text: string; emotion: string } => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Depression-related keywords and responses
    const depressionKeywords = ['sad', 'depressed', 'hopeless', 'worthless', 'empty', 'lonely', 'tired', 'exhausted'];
    const anxietyKeywords = ['anxious', 'worried', 'panic', 'scared', 'nervous', 'overwhelmed'];
    const positiveKeywords = ['good', 'better', 'happy', 'great', 'fine', 'okay'];
    const suicidalKeywords = ['suicide', 'kill myself', 'end it all', 'don\'t want to live', 'hurt myself'];

    // Crisis response
    if (suicidalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        text: "🚨 I'm very concerned about what you're sharing. Your life has value and meaning. Please reach out for immediate help:\n\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• Emergency Services: 911\n\nYou don't have to go through this alone. There are people who want to help you. 💙",
        emotion: 'crisis'
      };
    }

    // Depression responses
    if (depressionKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const responses = [
        "I hear you, and I want you to know that what you're feeling is valid. Depression can make everything feel overwhelming, but you're not alone in this. 🤗 Can you tell me more about what's been weighing on your mind?",
        "Thank you for sharing something so personal with me. Depression is incredibly difficult, but reaching out shows real strength. 💪 What's one small thing that used to bring you joy?",
        "I'm here with you through this difficult time. Depression can make us feel isolated, but you've taken a brave step by talking about it. 🌟 Have you been able to talk to anyone else about how you're feeling?",
        "Your feelings matter, and so do you. Depression can cloud our perspective, but remember that feelings, even the most painful ones, are temporary. 🌈 What's been your biggest challenge today?"
      ];
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        emotion: 'empathetic'
      };
    }

    // Anxiety responses
    if (anxietyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const responses = [
        "Anxiety can feel so overwhelming. Let's try to slow things down together. 🌸 Can you take three deep breaths with me? In for 4, hold for 4, out for 4. What's making you feel most anxious right now?",
        "I understand how scary anxiety can feel. Your body is trying to protect you, but sometimes it goes into overdrive. 🛡️ What physical sensations are you noticing? Let's work through this together.",
        "Anxiety is your mind's way of trying to prepare for challenges, but it can become exhausting. 🧠 You're safe right now. Can you name 5 things you can see around you?",
        "Thank you for trusting me with your anxiety. It takes courage to acknowledge these feelings. 💙 What usually helps you feel more grounded?"
      ];
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        emotion: 'calming'
      };
    }

    // Positive responses
    if (positiveKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const responses = [
        "I'm so glad to hear you're feeling good! 😊 It's wonderful when we can appreciate these positive moments. What's contributing to your good mood today?",
        "That's fantastic! 🌟 It's important to celebrate these better days. What's been different or helpful for you recently?",
        "I love hearing that you're doing well! 🎉 These positive feelings are just as important to acknowledge as the difficult ones. What's bringing you joy?",
        "Your positive energy is wonderful! ✨ It's great that you're taking time to check in, even when things are going well. What's been the highlight of your day?"
      ];
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        emotion: 'encouraging'
      };
    }

    // Sleep-related
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia')) {
      return {
        text: "Sleep struggles can really impact our mental health. 😴 Poor sleep and depression often go hand in hand. Have you noticed any patterns with your sleep? Creating a bedtime routine and limiting screen time before bed can help. What's your current sleep schedule like?",
        emotion: 'helpful'
      };
    }

    // Relationship issues
    if (lowerMessage.includes('relationship') || lowerMessage.includes('friend') || lowerMessage.includes('family')) {
      return {
        text: "Relationships can be both a source of support and stress. 👥 It sounds like you're dealing with some interpersonal challenges. Remember that healthy relationships involve mutual respect and understanding. How are you taking care of yourself in this situation?",
        emotion: 'supportive'
      };
    }

    // Work/school stress
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('school') || lowerMessage.includes('stress')) {
      return {
        text: "Work and school pressures can really take a toll on our mental health. 📚 It's important to find balance and remember that your worth isn't defined by productivity. What's been the most challenging aspect? Are you able to take breaks throughout your day?",
        emotion: 'understanding'
      };
    }

    // General supportive responses
    const generalResponses = [
      "Thank you for sharing that with me. I'm here to listen and support you. 💙 Can you tell me more about what's on your mind?",
      "I appreciate you opening up. Your feelings and experiences are important. 🤗 What would be most helpful for you right now?",
      "It sounds like you have a lot going on. I'm here to help you work through whatever you're facing. 🌟 What's been the most challenging part of your day?",
      "I'm glad you're here and willing to talk. Sometimes just expressing our thoughts can be really helpful. 💭 How long have you been feeling this way?",
      "Your willingness to reach out shows real strength. 💪 Mental health is just as important as physical health. What kind of support do you feel you need most right now?"
    ];

    return {
      text: generalResponses[Math.floor(Math.random() * generalResponses.length)],
      emotion: 'supportive'
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    impact();
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.text);
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: aiResponse.text,
        isBot: true,
        timestamp: new Date(),
        emotion: aiResponse.emotion
      };

      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      setIsTyping(false);

      // Update session
      if (currentSession) {
        const session = chatSessions.find(s => s.id === currentSession);
        if (session) {
          const updatedSession = {
            ...session,
            messages: updatedMessages,
            title: updatedMessages.length === 3 ? userMessage.text.slice(0, 30) + '...' : session.title
          };
          saveChatSession(updatedSession);
        }
      }
    }, 1000 + Math.random() * 2000);
  };

  const getMessageEmoji = (emotion?: string) => {
    switch (emotion) {
      case 'crisis': return '🚨';
      case 'empathetic': return '🤗';
      case 'calming': return '🌸';
      case 'encouraging': return '🌟';
      case 'helpful': return '💡';
      case 'supportive': return '💙';
      case 'understanding': return '🤝';
      default: return '🤖';
    }
  };

  if (showSessions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-xl">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Chat Sessions</h1>
                  <p className="text-orange-100 text-sm">Your conversation history</p>
                </div>
              </div>
              <button
                onClick={() => setShowSessions(false)}
                className="p-2 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4 space-y-4">
          <button
            onClick={startNewChat}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">💬</span>
              <span className="font-semibold">Start New Chat</span>
            </div>
          </button>

          <div className="space-y-3">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-orange-400"
              >
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => loadChatSession(session.id)}
                    className="flex-1 cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {session.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {session.messages.length} messages
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.createdAt.toLocaleDateString()} at {session.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteChatSession(session.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {chatSessions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No chat sessions yet</h3>
              <p className="text-gray-500">Start your first conversation with the AI companion</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl">
                <Bot size={24} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold">AI Companion</h1>
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="text-orange-100 text-sm">Your mental health support buddy</p>
              </div>
            </div>
            <button
              onClick={() => setShowSessions(true)}
              className="p-2 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-colors"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                  message.isBot
                    ? 'bg-white border-l-4 border-orange-400'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.isBot && (
                    <span className="text-lg flex-shrink-0 mt-1">
                      {getMessageEmoji(message.emotion)}
                    </span>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm leading-relaxed ${
                      message.isBot ? 'text-gray-800' : 'text-white'
                    }`}>
                      {message.text}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.isBot ? 'text-gray-500' : 'text-green-100'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {!message.isBot && (
                    <User size={16} className="flex-shrink-0 mt-1 text-green-100" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border-l-4 border-orange-400 px-4 py-3 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🤖</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 max-w-md mx-auto w-full">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Share what's on your mind... 💭"
            className="flex-1 p-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Quick Response Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { text: "I'm feeling really sad today", emoji: "😢" },
            { text: "I'm anxious and overwhelmed", emoji: "😰" },
            { text: "I need some encouragement", emoji: "💪" },
            { text: "I'm having trouble sleeping", emoji: "😴" },
            { text: "I'm stressed about work", emoji: "😓" },
            { text: "I'm feeling lonely", emoji: "💔" }
          ].map((quick, index) => (
            <button
              key={index}
              onClick={() => setInputText(quick.text)}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-xs hover:bg-orange-200 transition-colors flex items-center space-x-1"
            >
              <span className="mr-1">{quick.emoji}</span>
              <span>{quick.text.split(' ').slice(0, 3).join(' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Support Resources */}
      <div className="bg-gradient-to-r from-red-100 to-orange-100 p-4 max-w-md mx-auto w-full">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2">
            <span className="mr-1">🚨</span>
            If you're in crisis, please contact:
          </p>
          <div className="flex justify-center space-x-4 text-xs">
            <span className="text-red-600 font-medium">988 - Suicide Prevention</span>
            <span className="text-red-600 font-medium">911 - Emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;