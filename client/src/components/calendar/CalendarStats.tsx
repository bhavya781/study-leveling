interface CalendarStatsProps {
  completedDays: number;
  missedDays: number;
  currentStreak: number;
  bestStreak: number;
  calendarXP: number;
}

export function CalendarStats({ 
  completedDays, 
  missedDays, 
  currentStreak, 
  bestStreak, 
  calendarXP 
}: CalendarStatsProps) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-green-400">{completedDays}</div>
        <div className="text-slate-400 text-sm">Completed</div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-red-400">{missedDays}</div>
        <div className="text-slate-400 text-sm">Missed</div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-yellow-400">{currentStreak}</div>
        <div className="text-slate-400 text-sm">Current Streak</div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-blue-400">{bestStreak}</div>
        <div className="text-slate-400 text-sm">Best Streak</div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-green-400">{calendarXP}</div>
        <div className="text-slate-400 text-sm">Calendar XP</div>
      </div>
    </section>
  );
}
