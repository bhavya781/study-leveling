import { useState, useEffect } from 'react';
import { BookOpen, Play, Pause, RotateCcw, Clock, Flame, Trophy, TrendingUp, Medal, Calculator, PenTool, ClipboardCheck, GraduationCap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useXP } from '@/hooks/useXP';
import { useToast } from '@/hooks/use-toast';

interface StudyStats {
  sessionsToday: number;
  studyStreak: number;
  totalStudyTime: number;
  studyXPEarned: number;
}

export default function Study() {
  const [currentTime, setCurrentTime] = useState(25 * 60); // 25 minutes in seconds
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedDuration, setSelectedDuration] = useState('25');
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [studyStats, setStudyStats] = useState<StudyStats>({
    sessionsToday: 0,
    studyStreak: 0,
    totalStudyTime: 0,
    studyXPEarned: 0
  });

  const { xpData, addXP } = useXP();
  const { toast } = useToast();

  useEffect(() => {
    loadStudyStats();
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  const loadStudyStats = () => {
    const stored = localStorage.getItem('productivity_quest_study');
    if (stored) {
      setStudyStats(JSON.parse(stored));
    }
  };

  const saveStudyStats = (stats: StudyStats) => {
    localStorage.setItem('productivity_quest_study', JSON.stringify(stats));
    setStudyStats(stats);
  };

  const startTimer = () => {
    if (selectedDuration === 'custom' && (!customMinutes || parseInt(customMinutes) < 1)) {
      toast({
        title: "Invalid Duration",
        description: "Please enter a valid duration in minutes",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const resetTimer = () => {
    pauseTimer();
    const duration = getDurationInMinutes();
    const timeInSeconds = duration * 60;
    setCurrentTime(timeInSeconds);
    setTotalDuration(timeInSeconds);
  };

  const completeSession = () => {
    pauseTimer();
    const duration = getDurationInMinutes();
    const xpGained = Math.max(10, Math.floor(duration * 2)); // 2 XP per minute, minimum 10

    addXP(xpGained, `Completed ${duration}-minute study session`);

    const newStats = {
      ...studyStats,
      sessionsToday: studyStats.sessionsToday + 1,
      totalStudyTime: studyStats.totalStudyTime + duration,
      studyXPEarned: studyStats.studyXPEarned + xpGained,
      studyStreak: studyStats.studyStreak + 1
    };

    saveStudyStats(newStats);

    toast({
      title: "Study Session Complete!",
      description: `Great work! You earned ${xpGained} XP for studying ${duration} minutes.`,
      className: "bg-green-600 text-white",
    });

    resetTimer();
  };

  const getDurationInMinutes = (): number => {
    if (selectedDuration === 'custom') {
      return parseInt(customMinutes) || 25;
    }
    return parseInt(selectedDuration);
  };

  const updateDuration = (value: string) => {
    setSelectedDuration(value);
    setShowCustomInput(value === 'custom');
    
    if (value !== 'custom' && !isRunning) {
      const minutes = parseInt(value);
      const timeInSeconds = minutes * 60;
      setCurrentTime(timeInSeconds);
      setTotalDuration(timeInSeconds);
    }
  };

  const updateCustomDuration = () => {
    if (!isRunning && customMinutes) {
      const minutes = parseInt(customMinutes);
      if (minutes > 0) {
        const timeInSeconds = minutes * 60;
        setCurrentTime(timeInSeconds);
        setTotalDuration(timeInSeconds);
      }
    }
  };

  const gainQuickXP = (amount: number, description: string) => {
    addXP(amount, description);
    const newStats = {
      ...studyStats,
      studyXPEarned: studyStats.studyXPEarned + amount
    };
    saveStudyStats(newStats);

    toast({
      title: "XP Gained!",
      description: `+${amount} XP for ${description}`,
      className: "bg-green-600 text-white",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((totalDuration - currentTime) / totalDuration) * 100;
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <BookOpen className="inline mr-3 h-10 w-10 text-blue-400" />
            Study Mode
          </h1>
          <p className="text-slate-400 text-lg">Focus on your learning and earn XP for your dedication!</p>
        </section>

        {/* Timer Section */}
        <section className="mb-8">
          <Card className="bg-slate-800 border-slate-700 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-white">Study Timer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#334155"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#studyGradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - getProgress() / 100)}`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="studyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{formatTime(currentTime)}</span>
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center space-x-3">
                {!isRunning ? (
                  <Button onClick={startTimer} className="bg-blue-600 hover:bg-blue-700">
                    <Play className="mr-2 h-4 w-4" />
                    Start Session
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} className="bg-yellow-600 hover:bg-yellow-700">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button onClick={resetTimer} className="bg-slate-600 hover:bg-slate-700">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Duration Settings */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  Session Duration:
                </label>
                <Select value={selectedDuration} onValueChange={updateDuration}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="custom">Custom Duration</SelectItem>
                  </SelectContent>
                </Select>

                {showCustomInput && (
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      min="1"
                      max="300"
                      placeholder="Enter minutes"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      onBlur={updateCustomDuration}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{studyStats.sessionsToday}</div>
              <div className="text-slate-400 text-sm">Sessions Today</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-white">{studyStats.studyStreak}</div>
              <div className="text-slate-400 text-sm">Study Streak</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{studyStats.studyXPEarned}</div>
              <div className="text-slate-400 text-sm">Study XP Earned</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">{formatStudyTime(studyStats.totalStudyTime)}</div>
              <div className="text-slate-400 text-sm">Total Study Time</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Medal className="h-8 w-8 mx-auto mb-2" style={{ color: xpData.rank.color }} />
              <div className="text-2xl font-bold text-white">{xpData.rank.name}</div>
              <div className="text-slate-400 text-sm">Current Rank</div>
            </CardContent>
          </Card>
        </section>

        {/* Quick XP Actions */}
        <section>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick XP Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => gainQuickXP(5, 'Read a chapter')}
                  className="h-auto p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-600 flex flex-col items-center space-y-2"
                >
                  <BookOpen className="h-6 w-6" />
                  <span>Read Chapter</span>
                  <small className="text-green-400">+5 XP</small>
                </Button>

                <Button
                  onClick={() => gainQuickXP(10, 'Completed practice problems')}
                  className="h-auto p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600 flex flex-col items-center space-y-2"
                >
                  <Calculator className="h-6 w-6" />
                  <span>Practice Problems</span>
                  <small className="text-blue-400">+10 XP</small>
                </Button>

                <Button
                  onClick={() => gainQuickXP(15, 'Took detailed notes')}
                  className="h-auto p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600 flex flex-col items-center space-y-2"
                >
                  <PenTool className="h-6 w-6" />
                  <span>Take Notes</span>
                  <small className="text-purple-400">+15 XP</small>
                </Button>

                <Button
                  onClick={() => gainQuickXP(20, 'Completed assignment')}
                  className="h-auto p-4 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600 flex flex-col items-center space-y-2"
                >
                  <ClipboardCheck className="h-6 w-6" />
                  <span>Complete Assignment</span>
                  <small className="text-yellow-400">+20 XP</small>
                </Button>

                <Button
                  onClick={() => gainQuickXP(25, 'Finished studying for exam')}
                  className="h-auto p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600 flex flex-col items-center space-y-2"
                >
                  <GraduationCap className="h-6 w-6" />
                  <span>Exam Prep</span>
                  <small className="text-red-400">+25 XP</small>
                </Button>

                <Button
                  onClick={() => gainQuickXP(30, 'Completed project milestone')}
                  className="h-auto p-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-600 flex flex-col items-center space-y-2"
                >
                  <FileText className="h-6 w-6" />
                  <span>Project Work</span>
                  <small className="text-indigo-400">+30 XP</small>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}