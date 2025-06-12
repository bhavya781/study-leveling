export interface DayData {
  status?: 'completed' | 'missed' | '';
  summary?: string;
  date?: string;
}

export interface CalendarData {
  days: Record<number, DayData>;
  completedDays: number;
  missedDays: number;
  currentStreak: number;
  bestStreak: number;
  totalXP: number;
}

export interface CalendarStats {
  completedDays: number;
  missedDays: number;
  currentStreak: number;
  bestStreak: number;
  totalXP: number;
}

export class CalendarManager {
  private static STORAGE_KEY = 'productivity_quest_calendar';

  static getCalendarData(): CalendarData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      days: {},
      completedDays: 0,
      missedDays: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalXP: 0
    };
  }

  static saveCalendarData(data: CalendarData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  static getDayData(dayNumber: number): DayData {
    const calendarData = this.getCalendarData();
    return calendarData.days[dayNumber] || {};
  }

  static setDayData(dayNumber: number, dayData: DayData): void {
    const calendarData = this.getCalendarData();
    calendarData.days[dayNumber] = { ...calendarData.days[dayNumber], ...dayData };
    
    this.updateStats(calendarData);
    this.saveCalendarData(calendarData);
  }

  static markDay(dayNumber: number, status: 'completed' | 'missed' | ''): void {
    const calendarData = this.getCalendarData();
    const oldStatus = calendarData.days[dayNumber]?.status;

    if (!calendarData.days[dayNumber]) {
      calendarData.days[dayNumber] = {};
    }
    
    calendarData.days[dayNumber].status = status;
    
    this.updateStats(calendarData);
    this.saveCalendarData(calendarData);

    return;
  }

  static updateDaySummary(dayNumber: number, summary: string): void {
    const calendarData = this.getCalendarData();
    
    if (!calendarData.days[dayNumber]) {
      calendarData.days[dayNumber] = {};
    }
    
    calendarData.days[dayNumber].summary = summary;
    this.saveCalendarData(calendarData);
  }

  static getTodayDayNumber(): number {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    return Math.floor((today.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  }

  static calculateCurrentStreak(): number {
    const calendarData = this.getCalendarData();
    const todayDayNumber = this.getTodayDayNumber();
    
    let streak = 0;
    for (let day = todayDayNumber; day >= 1; day--) {
      if (calendarData.days[day]?.status === 'completed') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  static calculateBestStreak(): number {
    const calendarData = this.getCalendarData();
    let bestStreak = 0;
    let currentStreak = 0;
    
    for (let day = 1; day <= 365; day++) {
      if (calendarData.days[day]?.status === 'completed') {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    return bestStreak;
  }

  static checkStreakMilestone(streak: number): { isMillestone: boolean; bonusXP: number } {
    const milestones = [7, 14, 30, 60, 100, 365];
    const bonusXPValues = [35, 75, 150, 300, 500, 1000];
    
    const milestoneIndex = milestones.indexOf(streak);
    if (milestoneIndex !== -1) {
      return {
        isMillestone: true,
        bonusXP: bonusXPValues[milestoneIndex]
      };
    }
    
    return { isMillestone: false, bonusXP: 0 };
  }

  static resetCalendar(): void {
    const emptyData: CalendarData = {
      days: {},
      completedDays: 0,
      missedDays: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalXP: 0
    };
    
    this.saveCalendarData(emptyData);
  }

  private static updateStats(calendarData: CalendarData): void {
    const days = Object.values(calendarData.days);
    calendarData.completedDays = days.filter(day => day.status === 'completed').length;
    calendarData.missedDays = days.filter(day => day.status === 'missed').length;
    calendarData.totalXP = calendarData.completedDays * 25;
    calendarData.currentStreak = this.calculateCurrentStreak();
    calendarData.bestStreak = this.calculateBestStreak();
  }

  static getStats(): CalendarStats {
    const data = this.getCalendarData();
    return {
      completedDays: data.completedDays,
      missedDays: data.missedDays,
      currentStreak: data.currentStreak,
      bestStreak: data.bestStreak,
      totalXP: data.totalXP
    };
  }
}
