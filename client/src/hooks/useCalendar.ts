import { useState, useEffect } from 'react';
import { CalendarManager, CalendarData, DayData } from '@/lib/calendar-manager';
import { useXP } from './useXP';

export function useCalendar() {
  const [calendarData, setCalendarData] = useState<CalendarData>(CalendarManager.getCalendarData());
  const { addXP, removeXP } = useXP();

  const refreshCalendar = () => {
    setCalendarData(CalendarManager.getCalendarData());
  };

  const markDay = (dayNumber: number, status: 'completed' | 'missed' | '') => {
    const currentDayData = CalendarManager.getDayData(dayNumber);
    const oldStatus = currentDayData.status;

    CalendarManager.markDay(dayNumber, status);

    // Handle XP changes
    if (oldStatus === 'completed' && status !== 'completed') {
      removeXP(25);
    } else if (oldStatus !== 'completed' && status === 'completed') {
      const result = addXP(25, `Completed Day ${dayNumber}`);
      
      // Check for streak bonus
      const currentStreak = CalendarManager.calculateCurrentStreak();
      const streakMilestone = CalendarManager.checkStreakMilestone(currentStreak);
      
      if (streakMilestone.isMillestone) {
        addXP(streakMilestone.bonusXP, `${currentStreak} Day Streak Bonus`);
        return { 
          leveledUp: result.leveledUp, 
          streakBonus: { 
            streak: currentStreak, 
            bonusXP: streakMilestone.bonusXP 
          } 
        };
      }
      
      return { leveledUp: result.leveledUp, streakBonus: null };
    }

    refreshCalendar();
    return { leveledUp: false, streakBonus: null };
  };

  const updateDaySummary = (dayNumber: number, summary: string) => {
    CalendarManager.updateDaySummary(dayNumber, summary);
    refreshCalendar();
  };

  const getDayData = (dayNumber: number): DayData => {
    return CalendarManager.getDayData(dayNumber);
  };

  const getTodayDayNumber = (): number => {
    return CalendarManager.getTodayDayNumber();
  };

  const resetCalendar = () => {
    // Calculate XP to remove from completed days
    const completedDays = calendarData.completedDays;
    if (completedDays > 0) {
      removeXP(completedDays * 25);
    }
    
    CalendarManager.resetCalendar();
    refreshCalendar();
  };

  const goToToday = () => {
    const todayDayNumber = getTodayDayNumber();
    const todayElement = document.querySelector(`[data-day="${todayDayNumber}"]`);
    if (todayElement) {
      todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    refreshCalendar();
  }, []);

  return {
    calendarData,
    markDay,
    updateDaySummary,
    getDayData,
    getTodayDayNumber,
    resetCalendar,
    goToToday,
    refreshCalendar
  };
}
