import { useState, useEffect } from 'react';
import { Trophy, Star, Medal, CheckCircle, Flame, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useXP } from '@/hooks/useXP';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  name?: string;
  streak?: number;
  tasksToday?: number;
  lastVisit?: string;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData>({});
  const [isNewUser, setIsNewUser] = useState(false);
  const [userName, setUserName] = useState('');
  const { xpData, removeXP } = useXP();
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('productivity_quest_user');
    if (stored) {
      const data = JSON.parse(stored);
      setUserData(data);
      if (!data.name) {
        setIsNewUser(true);
      }
    } else {
      setIsNewUser(true);
    }
  }, []);

  const saveUserData = (data: UserData) => {
    localStorage.setItem('productivity_quest_user', JSON.stringify(data));
    setUserData(data);
  };

  const handleStartQuest = () => {
    if (userName.trim()) {
      const newUserData = {
        ...userData,
        name: userName.trim(),
        streak: 0,
        tasksToday: 0,
        lastVisit: new Date().toISOString()
      };
      saveUserData(newUserData);
      setIsNewUser(false);
      toast({
        title: "Welcome to Productivity Quest!",
        description: `Good luck on your journey, ${userName}!`,
        className: "bg-green-600 text-white",
      });
    }
  };

  const handleMissedDay = () => {
    const confirmMissed = window.confirm(
      'Mark yesterday as missed? This will deduct XP for incomplete main tasks.'
    );
    
    if (confirmMissed) {
      // Deduct XP for missed day (assuming 3 main tasks at 25 XP each)
      const missedXP = 75;
      removeXP(missedXP);
      
      toast({
        title: "Missed Day Recorded",
        description: `Deducted ${missedXP} XP for missed main tasks`,
        variant: "destructive",
      });
    }
  };

  if (isNewUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">Welcome to Productivity Quest</CardTitle>
            <p className="text-slate-400">Level up your life through gamified productivity</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enter Your Name to Begin
              </label>
              <Input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleStartQuest()}
              />
            </div>
            <Button 
              onClick={handleStartQuest}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!userName.trim()}
            >
              Start Quest
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {userData.name}!
          </h1>
          <p className="text-slate-400 text-lg">Ready to continue your productivity quest?</p>
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{xpData.level}</div>
              <div className="text-slate-400 text-sm">Current Level</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">{xpData.totalXP}</div>
              <div className="text-slate-400 text-sm">Total XP</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Medal className="h-8 w-8 mx-auto mb-2" style={{ color: xpData.rank.color }} />
              <div className="text-2xl font-bold text-white">{xpData.rank.name}</div>
              <div className="text-slate-400 text-sm">Current Rank</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{userData.tasksToday || 0}</div>
              <div className="text-slate-400 text-sm">Tasks Today</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-white">{userData.streak || 0}</div>
              <div className="text-slate-400 text-sm">Streak</div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="mr-2 h-5 w-5 text-green-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = '/calendar'}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/study'}
              >
                Study Mode
              </Button>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => window.location.href = '/gym'}
              >
                Gym Mode
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Daily Check-in</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400">
                Mark if you missed any main tasks yesterday to adjust your XP
              </p>
              <Button 
                onClick={handleMissedDay}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Mark Missed Day
              </Button>
              <p className="text-slate-500 text-sm">
                This will deduct XP for incomplete main tasks
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Level Progress */}
        <section>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Level Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
                <div className="text-center">
                  <span className="text-sm font-medium" style={{ color: xpData.rank.color }}>
                    {xpData.rank.title}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}