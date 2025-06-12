import { useState } from 'react';
import { CalendarCheck, CalendarDays, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarStats } from '@/components/calendar/CalendarStats';
import { DayModal } from '@/components/calendar/DayModal';
import { StreakModal } from '@/components/calendar/StreakModal';

export default function Calendar() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [streakBonus, setStreakBonus] = useState<{ streak: number; bonusXP: number } | null>(null);
  const { toast } = useToast();
  
  const { 
    calendarData, 
    markDay, 
    updateDaySummary, 
    getDayData, 
    resetCalendar, 
    goToToday 
  } = useCalendar();

  const handleDayClick = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setIsDayModalOpen(true);
  };

  const handleDaySave = (dayNumber: number, status: 'completed' | 'missed' | '', summary: string) => {
    const result = markDay(dayNumber, status);
    updateDaySummary(dayNumber, summary);

    if (status === 'completed') {
      toast({
        title: "Day Completed!",
        description: `+25 XP earned for Day ${dayNumber}`,
        className: "bg-green-600 text-white",
      });

      if (result.leveledUp) {
        toast({
          title: "Level Up!",
          description: "Congratulations on reaching a new level!",
          className: "bg-yellow-600 text-white",
        });
      }

      if (result.streakBonus) {
        setStreakBonus(result.streakBonus);
      }
    } else if (status === 'missed') {
      toast({
        title: "Day Marked as Missed",
        description: `Day ${dayNumber} marked as missed`,
        variant: "destructive",
      });
    } else if (status === '') {
      toast({
        title: "Status Cleared",
        description: `Status cleared for Day ${dayNumber}`,
      });
    }
  };

  const handleResetCalendar = () => {
    if (window.confirm('Are you sure you want to reset the entire calendar? This will remove all progress and cannot be undone.')) {
      resetCalendar();
      toast({
        title: "Calendar Reset",
        description: "Calendar has been reset successfully.",
        variant: "destructive",
      });
    }
  };

  const handleGoToToday = () => {
    goToToday();
    toast({
      title: "Navigated to Today",
      description: "Scrolled to today's day in the calendar.",
    });
  };

  const selectedDayData = selectedDay ? getDayData(selectedDay) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <CalendarCheck className="inline mr-3 h-10 w-10 text-green-400" />
            365-Day Quest Calendar
          </h1>
          <p className="text-slate-400 text-lg">Track your daily progress • Earn XP • Build epic streaks</p>
        </section>

        {/* Stats */}
        <CalendarStats
          completedDays={calendarData.completedDays}
          missedDays={calendarData.missedDays}
          currentStreak={calendarData.currentStreak}
          bestStreak={calendarData.bestStreak}
          calendarXP={calendarData.totalXP}
        />

        {/* Controls */}
        <section className="flex flex-wrap gap-4 justify-center mb-8">
          <Button 
            onClick={handleGoToToday}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Go to Today
          </Button>
          <Button 
            onClick={handleResetCalendar}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Calendar
          </Button>
        </section>

        {/* Calendar Grid */}
        <CalendarGrid onDayClick={handleDayClick} />

        {/* Day Modal */}
        <DayModal
          isOpen={isDayModalOpen}
          onClose={() => setIsDayModalOpen(false)}
          dayNumber={selectedDay}
          initialStatus={selectedDayData?.status || ''}
          initialSummary={selectedDayData?.summary || ''}
          onSave={handleDaySave}
        />

        {/* Streak Bonus Modal */}
        {streakBonus && (
          <StreakModal
            isOpen={!!streakBonus}
            onClose={() => setStreakBonus(null)}
            streakDays={streakBonus.streak}
            bonusXP={streakBonus.bonusXP}
          />
        )}
      </main>
    </div>
  );
}
