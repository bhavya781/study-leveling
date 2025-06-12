import { useState, useEffect } from 'react';
import { User, Trophy, Calendar, Target, Plus, X, Save, Trash2, Bot, Send, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useXP } from '@/hooks/useXP';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'passive' | 'bulky';
  completed: boolean;
  createdAt: string;
  dueDate?: string;
}

interface UserData {
  name?: string;
  streak?: number;
}

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTaskType, setCurrentTaskType] = useState<'main' | 'passive' | 'bulky'>('main');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  
  // AI Assistant state
  const [apiKey, setApiKey] = useState('');
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { xpData, addXP, removeXP } = useXP();
  const { toast } = useToast();

  useEffect(() => {
    loadProfileData();
    loadTasks();
    initializeAI();
  }, []);

  const initializeAI = () => {
    const savedApiKey = localStorage.getItem('groq_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsAiEnabled(true);
    }

    // Initialize with welcome message
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      type: 'system',
      content: "Hello! I'm your AI assistant. I can help you create workout plans, study schedules, and add tasks to your lists. Enter your Groq API key above to get started!",
      timestamp: new Date().toISOString()
    };
    setAiMessages([welcomeMessage]);
  };

  const loadProfileData = () => {
    const stored = localStorage.getItem('productivity_quest_user');
    if (stored) {
      setUserData(JSON.parse(stored));
    }
  };

  const loadTasks = () => {
    const stored = localStorage.getItem('productivity_quest_tasks');
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  };

  const saveTasks = (newTasks: Task[]) => {
    localStorage.setItem('productivity_quest_tasks', JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  const openTaskModal = (type: 'main' | 'passive' | 'bulky') => {
    setCurrentTaskType(type);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
  };

  const addTask = () => {
    if (!taskTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      type: currentTaskType,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: taskDueDate || undefined
    };

    const newTasks = [...tasks, newTask];
    saveTasks(newTasks);
    closeTaskModal();

    toast({
      title: "Task Added",
      description: `${newTask.title} added to ${currentTaskType} tasks`,
      className: "bg-green-600 text-white",
    });
  };

  const toggleTaskComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const wasCompleted = task.completed;
    const newTasks = tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    saveTasks(newTasks);

    // Handle XP changes
    const xpValues = { main: 25, passive: 10, bulky: 50 };
    const xpAmount = xpValues[task.type];

    if (!wasCompleted && !task.completed) {
      // Task was just completed
      addXP(xpAmount, `Completed ${task.type} task: ${task.title}`);
      toast({
        title: "Task Completed!",
        description: `+${xpAmount} XP for completing ${task.title}`,
        className: "bg-green-600 text-white",
      });
    } else if (wasCompleted && task.completed) {
      // Task was uncompleted
      removeXP(xpAmount);
      toast({
        title: "Task Uncompleted",
        description: `-${xpAmount} XP for uncompleting ${task.title}`,
        variant: "destructive",
      });
    }
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.completed) {
      const xpValues = { main: 25, passive: 10, bulky: 50 };
      removeXP(xpValues[task.type]);
    }

    const newTasks = tasks.filter(t => t.id !== taskId);
    saveTasks(newTasks);

    toast({
      title: "Task Deleted",
      description: `${task.title} has been deleted`,
      variant: "destructive",
    });
  };

  const handleMissedDay = () => {
    const confirmMissed = window.confirm(
      'Mark yesterday as missed? This will deduct XP for incomplete main tasks.'
    );
    
    if (confirmMissed) {
      const incompleteMains = tasks.filter(t => t.type === 'main' && !t.completed).length;
      const missedXP = incompleteMains * 25;
      
      if (missedXP > 0) {
        removeXP(missedXP);
        toast({
          title: "Missed Day Recorded",
          description: `Deducted ${missedXP} XP for ${incompleteMains} incomplete main tasks`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "No Incomplete Tasks",
          description: "All main tasks are completed!",
        });
      }
    }
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('groq_api_key', apiKey.trim());
      setIsAiEnabled(true);
      toast({
        title: "API Key Saved",
        description: "AI Assistant is now enabled",
        className: "bg-green-600 text-white",
      });
    }
  };

  const sendAIPrompt = async () => {
    if (!aiPrompt.trim() || !isAiEnabled) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: aiPrompt.trim(),
      timestamp: new Date().toISOString()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiPrompt('');
    setIsAiLoading(true);

    try {
      const response = await simulateAIResponse(userMessage.content);
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setAiMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to get AI response. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const parseTaskRequest = (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for task creation keywords
    const taskKeywords = ['add', 'create', 'make', 'need', 'schedule', 'plan', 'set up', 'organize', 'give me', 'suggest'];
    const isTaskRequest = taskKeywords.some(keyword => lowerPrompt.includes(keyword));
    
    if (!isTaskRequest) return null;
    
    // Extract number from prompt
    const numberMatch = lowerPrompt.match(/(\d+)/);
    const requestedCount = numberMatch ? parseInt(numberMatch[1]) : null;
    
    // Determine task type explicitly
    let taskType: 'main' | 'passive' | 'bulky' = 'main';
    
    if (lowerPrompt.includes('bulky') || lowerPrompt.includes('big') || lowerPrompt.includes('major')) {
      taskType = 'bulky';
    } else if (lowerPrompt.includes('passive') || lowerPrompt.includes('daily') || lowerPrompt.includes('habit') || lowerPrompt.includes('routine')) {
      taskType = 'passive';
    } else if (lowerPrompt.includes('main') || lowerPrompt.includes('primary') || lowerPrompt.includes('important')) {
      taskType = 'main';
    }
    
    // Task templates by type
    const taskTemplates = {
      main: [
        { title: 'Complete morning workout', description: '30-45 minutes of structured exercise' },
        { title: 'Focused study session', description: '2 hours of deep learning and practice' },
        { title: 'Complete work assignment', description: 'Finish priority work deliverable' },
        { title: 'Skill development practice', description: '1 hour of learning new skills' },
        { title: 'Review and plan tomorrow', description: 'Organize tasks and priorities' },
        { title: 'Read personal development', description: '30 minutes of educational reading' },
        { title: 'Practice creative writing', description: 'Write for 45 minutes daily' },
        { title: 'Complete online course module', description: 'Advance through learning material' }
      ],
      passive: [
        { title: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day' },
        { title: 'Take daily vitamins', description: 'Complete vitamin and supplement routine' },
        { title: '10-minute meditation', description: 'Mindfulness and breathing practice' },
        { title: 'Listen to educational podcast', description: 'Learn while commuting or walking' },
        { title: 'Take stairs instead of elevator', description: 'Add movement to daily routine' },
        { title: 'Write in gratitude journal', description: 'Reflect on positive aspects of day' },
        { title: 'Stretch for 10 minutes', description: 'Improve flexibility and posture' },
        { title: 'Organize workspace', description: 'Keep environment clean and productive' }
      ],
      bulky: [
        { title: 'Complete major project milestone', description: 'Significant deliverable requiring 4+ hours' },
        { title: 'Deep research and analysis', description: 'Comprehensive investigation of complex topic' },
        { title: 'Organize and declutter entire room', description: 'Complete reorganization project' },
        { title: 'Create detailed project plan', description: 'Strategic planning for major initiative' },
        { title: 'Complete skill certification', description: 'Finish major learning certification' },
        { title: 'Conduct comprehensive review', description: 'Thorough analysis of system or process' },
        { title: 'Build prototype or demo', description: 'Create working model or demonstration' },
        { title: 'Write detailed report', description: 'Comprehensive documentation project' }
      ]
    };
    
    // Override task type based on content context
    if (lowerPrompt.includes('workout') || lowerPrompt.includes('gym') || lowerPrompt.includes('exercise')) {
      taskType = taskType === 'bulky' ? 'bulky' : 'main';
      if (taskType === 'main') {
        return {
          type: 'main' as const,
          tasks: [
            { title: 'Warm-up exercises', description: '5 minutes of light stretching and mobility' },
            { title: 'Strength training session', description: 'Push-ups, squats, planks - 20 minutes' },
            { title: 'Cardio workout', description: '15 minutes of jumping jacks or running' },
            { title: 'Cool-down stretching', description: '5 minutes of deep stretching' }
          ].slice(0, requestedCount || 4)
        };
      }
    }
    
    if (lowerPrompt.includes('study') || lowerPrompt.includes('learn') || lowerPrompt.includes('exam')) {
      taskType = taskType === 'bulky' ? 'bulky' : 'main';
      if (taskType === 'main') {
        return {
          type: 'main' as const,
          tasks: [
            { title: 'Morning study review', description: 'Review previous day material - 30 minutes' },
            { title: 'Focused study session', description: 'Deep work on main subject - 2 hours' },
            { title: 'Practice problems', description: 'Apply learned concepts - 1 hour' },
            { title: 'Evening summary', description: 'Summarize key points - 20 minutes' }
          ].slice(0, requestedCount || 4)
        };
      }
    }
    
    // Get appropriate number of tasks
    const templates = taskTemplates[taskType];
    const count = requestedCount || (taskType === 'bulky' ? 3 : taskType === 'passive' ? 4 : 3);
    const selectedTasks = templates.slice(0, Math.min(count, templates.length));
    
    return {
      type: taskType,
      tasks: selectedTasks
    };
  };

  const simulateAIResponse = async (prompt: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if this is a task creation request
    const taskRequest = parseTaskRequest(prompt);
    if (taskRequest) {
      // Auto-add tasks
      taskRequest.tasks.forEach(taskData => {
        const newTask: Task = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: taskData.title,
          description: taskData.description,
          type: taskRequest.type,
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        const newTasks = [...tasks, newTask];
        saveTasks(newTasks);
      });
      
      const taskTypeNames = { main: 'Main', passive: 'Passive', bulky: 'Bulky' };
      return `Perfect! I've added ${taskRequest.tasks.length} tasks to your ${taskTypeNames[taskRequest.type]} Tasks section:\n\n${taskRequest.tasks.map(t => `• ${t.title}`).join('\n')}\n\nThese tasks are now ready for you to complete and earn XP! Each ${taskRequest.type} task gives you ${taskRequest.type === 'main' ? 25 : taskRequest.type === 'passive' ? 10 : 50} XP when completed.`;
    }
    
    // Casual conversation responses
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
      return "Hello! I'm here to help you stay productive and organized. I can create tasks, suggest routines, and help you plan your day. What would you like to work on?";
    }
    
    if (lowerPrompt.includes('how are you') || lowerPrompt.includes('how\'s it going')) {
      return "I'm doing great, thanks for asking! I'm ready to help you boost your productivity. Are you looking to add some tasks or need help planning something?";
    }
    
    if (lowerPrompt.includes('thank') || lowerPrompt.includes('thanks')) {
      return "You're very welcome! I'm always here to help you stay on track with your goals. Feel free to ask me to create more tasks or help with planning anytime.";
    }
    
    // Informational responses about features
    if (lowerPrompt.includes('what can you do') || lowerPrompt.includes('help') || lowerPrompt.includes('capabilities')) {
      return "I can help you with:\n\n• **Creating Tasks**: Ask me to add workout routines, study schedules, daily habits, or project tasks\n• **Planning**: I can suggest structured approaches for different activities\n• **Organization**: Help categorize tasks by type (Main: 25 XP, Passive: 10 XP, Bulky: 50 XP)\n\nJust tell me what you'd like to work on, and I'll create the appropriate tasks for you!";
    }
    
    // XP and progress questions
    if (lowerPrompt.includes('xp') || lowerPrompt.includes('points') || lowerPrompt.includes('level')) {
      return `You're currently at Level ${xpData.level} with ${xpData.totalXP} total XP! You need ${xpData.xpForNextLevel - xpData.currentXP} more XP to reach the next level.\n\nTask XP rewards:\n• Main Tasks: 25 XP each\n• Passive Tasks: 10 XP each  \n• Bulky Tasks: 50 XP each\n\nWould you like me to add some tasks to help you level up?`;
    }
    
    // Suggestions when unsure
    if (lowerPrompt.includes('workout') || lowerPrompt.includes('exercise') || lowerPrompt.includes('gym')) {
      return "I can help you plan a workout routine! Would you like me to add some exercise tasks to your profile? Just say something like 'create a workout plan' and I'll add structured tasks for you.";
    }
    
    if (lowerPrompt.includes('study') || lowerPrompt.includes('learn') || lowerPrompt.includes('exam')) {
      return "Study time! I can create a structured study schedule for you. Try asking me to 'add study tasks' or 'create a study plan' and I'll set up organized learning tasks.";
    }
    
    // Default response
    return "I'm here to help you stay productive! I can create tasks for workouts, studying, daily routines, or projects. Just tell me what you'd like to add - for example:\n\n• 'Add a workout routine'\n• 'Create study tasks for today'\n• 'Set up a morning routine'\n• 'Add project tasks'\n\nWhat would you like to work on?";
  };

  const usePrompt = (prompt: string) => {
    setAiPrompt(prompt);
  };

  const getTasksByType = (type: 'main' | 'passive' | 'bulky') => {
    return tasks.filter(task => task.type === type);
  };

  const getTotalTasks = () => tasks.length;
  const getCompletedTasks = () => tasks.filter(task => task.completed).length;

  const getTaskTypeInfo = (type: 'main' | 'passive' | 'bulky') => {
    switch (type) {
      case 'main': return { name: 'Main Tasks', xp: 25, color: 'yellow', icon: Trophy };
      case 'passive': return { name: 'Passive Tasks', xp: 10, color: 'blue', icon: Calendar };
      case 'bulky': return { name: 'Bulky Tasks', xp: 50, color: 'purple', icon: Target };
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <section className="mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {userData.name || 'Player'}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center space-x-4 mb-4">
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{ 
                        backgroundColor: `${xpData.rank.color}20`,
                        color: xpData.rank.color,
                        border: `1px solid ${xpData.rank.color}`
                      }}
                    >
                      {xpData.rank.name}
                    </span>
                    <span className="text-slate-400">{xpData.rank.title}</span>
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span className="text-slate-300">Level {xpData.level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <span className="text-slate-300">Streak: {userData.streak || 0} days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-slate-300">
                        Tasks: {getCompletedTasks()}/{getTotalTasks()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={handleMissedDay}
                    variant="destructive" 
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Missed Day
                  </Button>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Level {xpData.level}</span>
                  <span className="text-slate-400">{xpData.currentXP} / {xpData.xpForNextLevel} XP</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(xpData.currentXP / xpData.xpForNextLevel) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* AI Assistant Section */}
        <section className="mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Bot className="mr-2 h-5 w-5 text-green-400" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Key Setup */}
              <div className="flex space-x-2">
                <Input
                  type="password"
                  placeholder="Enter Groq API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white flex-1"
                />
                <Button onClick={saveApiKey} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Key className="mr-1 h-4 w-4" />
                  Save
                </Button>
              </div>

              {/* Suggested Prompts */}
              {isAiEnabled && (
                <div className="space-y-2">
                  <p className="text-slate-300 font-medium">Try these prompts:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => usePrompt('Create 3 productivity tasks for today')}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Daily Tasks
                    </Button>
                    <Button
                      onClick={() => usePrompt('Suggest a morning routine with tasks')}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Morning Routine
                    </Button>
                    <Button
                      onClick={() => usePrompt('Give me workout tasks for this week')}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Workout Plan
                    </Button>
                    <Button
                      onClick={() => usePrompt('Help me organize my study schedule')}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Study Schedule
                    </Button>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="bg-slate-700 rounded-lg p-4 h-64 overflow-y-auto space-y-3">
                {aiMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'system'
                          ? 'bg-slate-600 text-slate-200'
                          : 'bg-green-600 text-white'
                      }`}
                    >
                      {message.type !== 'user' && (
                        <div className="flex items-center mb-1">
                          <Bot className="h-4 w-4 mr-1" />
                          <span className="text-xs opacity-75">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-green-600 text-white p-3 rounded-lg">
                      <div className="flex items-center">
                        <Bot className="h-4 w-4 mr-2" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex space-x-2">
                <Input
                  placeholder={isAiEnabled ? "Ask for a workout plan, study schedule, or task suggestions..." : "Enter API key above to enable AI"}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAIPrompt()}
                  disabled={!isAiEnabled}
                  className="bg-slate-700 border-slate-600 text-white flex-1"
                />
                <Button
                  onClick={sendAIPrompt}
                  disabled={!isAiEnabled || !aiPrompt.trim() || isAiLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tasks Section */}
        <section className="space-y-6">
          {(['main', 'passive', 'bulky'] as const).map((taskType) => {
            const typeInfo = getTaskTypeInfo(taskType);
            const typeTasks = getTasksByType(taskType);
            const Icon = typeInfo.icon;

            return (
              <Card key={taskType} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center text-white">
                      <Icon className="mr-2 h-5 w-5" style={{ color: `var(--${typeInfo.color}-400)` }} />
                      {typeInfo.name}
                      <span className="ml-2 text-sm font-normal text-slate-400">
                        {typeInfo.xp} XP each
                      </span>
                    </CardTitle>
                    <Button 
                      onClick={() => openTaskModal(taskType)}
                      size="sm"
                      className={`bg-${typeInfo.color}-600 hover:bg-${typeInfo.color}-700`}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {typeTasks.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">
                      No {taskType} tasks yet. Add some to get started!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {typeTasks.map((task) => (
                        <div 
                          key={task.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            task.completed 
                              ? 'bg-green-900/20 border-green-600' 
                              : 'bg-slate-700 border-slate-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTaskComplete(task.id)}
                              className="w-5 h-5 rounded border-slate-600 text-green-600 focus:ring-green-500"
                            />
                            <div className="flex-1">
                              <h4 className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-slate-400 text-sm mt-1">{task.description}</p>
                              )}
                              {task.dueDate && (
                                <p className="text-slate-500 text-xs mt-1">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => deleteTask(task.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Task Modal */}
        <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                Add {getTaskTypeInfo(currentTaskType).name.slice(0, -1)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task-title" className="text-slate-300">Task Title</Label>
                <Input
                  id="task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <Label htmlFor="task-description" className="text-slate-300">Description (optional)</Label>
                <Textarea
                  id="task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="task-due-date" className="text-slate-300">Due Date (optional)</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={addTask} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
                <Button onClick={closeTaskModal} variant="outline" className="flex-1 border-slate-600 text-slate-300">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}