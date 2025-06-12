import { useState, useEffect } from 'react';
import { Dumbbell, Play, Pause, RotateCcw, Clock, Flame, Trophy, TrendingUp, Medal, Plus, Thermometer, Heart, Activity, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useXP } from '@/hooks/useXP';
import { useToast } from '@/hooks/use-toast';

interface GymStats {
  workoutsToday: number;
  workoutStreak: number;
  totalWorkoutTime: number;
  gymXPEarned: number;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  timestamp: string;
}

export default function Gym() {
  const [currentTime, setCurrentTime] = useState(30 * 60); // 30 minutes in seconds
  const [totalDuration, setTotalDuration] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [gymStats, setGymStats] = useState<GymStats>({
    workoutsToday: 0,
    workoutStreak: 0,
    totalWorkoutTime: 0,
    gymXPEarned: 0
  });
  
  // Exercise tracking
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');
  const [todayExercises, setTodayExercises] = useState<Exercise[]>([]);

  const { xpData, addXP } = useXP();
  const { toast } = useToast();

  useEffect(() => {
    loadGymStats();
    loadTodayExercises();
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  const loadGymStats = () => {
    const stored = localStorage.getItem('productivity_quest_gym');
    if (stored) {
      setGymStats(JSON.parse(stored));
    }
  };

  const saveGymStats = (stats: GymStats) => {
    localStorage.setItem('productivity_quest_gym', JSON.stringify(stats));
    setGymStats(stats);
  };

  const loadTodayExercises = () => {
    const stored = localStorage.getItem('productivity_quest_exercises');
    if (stored) {
      const exercises = JSON.parse(stored);
      const today = new Date().toDateString();
      const todayExercises = exercises.filter((ex: Exercise) => 
        new Date(ex.timestamp).toDateString() === today
      );
      setTodayExercises(todayExercises);
    }
  };

  const saveExercise = (exercise: Exercise) => {
    const stored = localStorage.getItem('productivity_quest_exercises');
    const exercises = stored ? JSON.parse(stored) : [];
    exercises.push(exercise);
    localStorage.setItem('productivity_quest_exercises', JSON.stringify(exercises));
    loadTodayExercises();
  };

  const startTimer = () => {
    setIsRunning(true);
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          completeWorkout();
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
    const duration = parseInt(selectedDuration);
    const timeInSeconds = duration * 60;
    setCurrentTime(timeInSeconds);
    setTotalDuration(timeInSeconds);
  };

  const completeWorkout = () => {
    pauseTimer();
    const duration = parseInt(selectedDuration);
    const xpGained = Math.max(15, Math.floor(duration * 1.5)); // 1.5 XP per minute, minimum 15

    addXP(xpGained, `Completed ${duration}-minute workout session`);

    const newStats = {
      ...gymStats,
      workoutsToday: gymStats.workoutsToday + 1,
      totalWorkoutTime: gymStats.totalWorkoutTime + duration,
      gymXPEarned: gymStats.gymXPEarned + xpGained,
      workoutStreak: gymStats.workoutStreak + 1
    };

    saveGymStats(newStats);

    toast({
      title: "Workout Complete!",
      description: `Awesome! You earned ${xpGained} XP for your ${duration}-minute workout.`,
      className: "bg-green-600 text-white",
    });

    resetTimer();
  };

  const updateDuration = (value: string) => {
    setSelectedDuration(value);
    
    if (!isRunning) {
      const minutes = parseInt(value);
      const timeInSeconds = minutes * 60;
      setCurrentTime(timeInSeconds);
      setTotalDuration(timeInSeconds);
    }
  };

  const gainQuickXP = (amount: number, description: string) => {
    addXP(amount, description);
    const newStats = {
      ...gymStats,
      gymXPEarned: gymStats.gymXPEarned + amount
    };
    saveGymStats(newStats);

    toast({
      title: "XP Gained!",
      description: `+${amount} XP for ${description}`,
      className: "bg-green-600 text-white",
    });
  };

  const addExercise = () => {
    if (!exerciseName.trim()) {
      toast({
        title: "Exercise Name Required",
        description: "Please enter an exercise name",
        variant: "destructive",
      });
      return;
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName.trim(),
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: weight ? parseFloat(weight) : undefined,
      timestamp: new Date().toISOString()
    };

    saveExercise(exercise);

    // Give XP for logging exercise
    const exerciseXP = 5;
    gainQuickXP(exerciseXP, `Logged exercise: ${exercise.name}`);

    // Reset form
    setExerciseName('');
    setSets('3');
    setReps('10');
    setWeight('');

    toast({
      title: "Exercise Added!",
      description: `${exercise.name} logged successfully`,
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

  const formatWorkoutTime = (minutes: number) => {
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
            <Dumbbell className="inline mr-3 h-10 w-10 text-purple-400" />
            Gym Mode
          </h1>
          <p className="text-slate-400 text-lg">Power up your body and earn XP for every workout!</p>
        </section>

        {/* Timer Section */}
        <section className="mb-8">
          <Card className="bg-slate-800 border-slate-700 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-white">Workout Timer</CardTitle>
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
                      stroke="url(#workoutGradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - getProgress() / 100)}`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="workoutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#11998e" />
                        <stop offset="100%" stopColor="#38ef7d" />
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
                  <Button onClick={startTimer} className="bg-green-600 hover:bg-green-700">
                    <Play className="mr-2 h-4 w-4" />
                    Start Workout
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
                  Workout Duration (minutes):
                </label>
                <Select value={selectedDuration} onValueChange={updateDuration}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">{gymStats.workoutsToday}</div>
              <div className="text-slate-400 text-sm">Workouts Today</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-white">{gymStats.workoutStreak}</div>
              <div className="text-slate-400 text-sm">Workout Streak</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{gymStats.gymXPEarned}</div>
              <div className="text-slate-400 text-sm">Gym XP Earned</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{formatWorkoutTime(gymStats.totalWorkoutTime)}</div>
              <div className="text-slate-400 text-sm">Total Workout Time</div>
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
        <section className="mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick XP Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => gainQuickXP(5, 'Did warm-up exercises')}
                  className="h-auto p-4 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600 flex flex-col items-center space-y-2"
                >
                  <Thermometer className="h-6 w-6" />
                  <span>Warm-up</span>
                  <small className="text-yellow-400">+5 XP</small>
                </Button>

                <Button
                  onClick={() => gainQuickXP(10, 'Completed cardio session')}
                  className="h-auto p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600 flex flex-col items-center space-y-2"
                >
                  <Heart className="h-6 w-6" />
                  <span>Cardio</span>
                  <small className="text-red-400">+10 XP</small>
                </Button>

                <Button
                  onClick={() => gainQuickXP(15, 'Strength training session')}
                  className="h-auto p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600 flex flex-col items-center space-y-2"
                >
                  <Dumbbell className="h-6 w-6" />
                  <span>Strength Training</span>
                  <small className="text-purple-400">+15 XP</small>
                </Button>

                <Button
                  onClick={() => gainQuickXP(8, 'Stretching and flexibility')}
                  className="h-auto p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-600 flex flex-col items-center space-y-2"
                >
                  <Activity className="h-6 w-6" />
                  <span>Stretching</span>
                  <small className="text-green-400">+8 XP</small>
                </Button>

                <Button
                  onClick={() => gainQuickXP(20, 'Completed full workout')}
                  className="h-auto p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600 flex flex-col items-center space-y-2"
                >
                  <CheckCircle className="h-6 w-6" />
                  <span>Full Workout</span>
                  <small className="text-blue-400">+20 XP</small>
                </Button>

                <Button
                  onClick={() => gainQuickXP(25, 'Personal record achieved')}
                  className="h-auto p-4 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600 flex flex-col items-center space-y-2"
                >
                  <Medal className="h-6 w-6" />
                  <span>Personal Record</span>
                  <small className="text-orange-400">+25 XP</small>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Exercise Tracker */}
        <section>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Exercise Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Exercise Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Exercise</Label>
                  <Input
                    placeholder="e.g., Push-ups, Squats"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Sets</Label>
                  <Input
                    type="number"
                    min="1"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Reps</Label>
                  <Input
                    type="number"
                    min="1"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Weight (lbs) - Optional</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Optional"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              
              <Button onClick={addExercise} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>

              {/* Today's Exercises */}
              {todayExercises.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Today's Exercises</h3>
                  <div className="space-y-2">
                    {todayExercises.map((exercise) => (
                      <div key={exercise.id} className="bg-slate-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white">{exercise.name}</span>
                          <span className="text-slate-400 text-sm">
                            {new Date(exercise.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-slate-300 text-sm">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight && ` @ ${exercise.weight} lbs`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}