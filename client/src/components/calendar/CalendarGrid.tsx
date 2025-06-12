import { CalendarManager } from '@/lib/calendar-manager';

interface CalendarGridProps {
  onDayClick: (dayNumber: number) => void;
}

export function CalendarGrid({ onDayClick }: CalendarGridProps) {
  const todayDayNumber = CalendarManager.getTodayDayNumber();
  const calendarData = CalendarManager.getCalendarData();

  const getDayBlockClass = (dayNumber: number) => {
    const dayData = calendarData.days[dayNumber];
    let baseClass = 'day-block';

    if (dayNumber === todayDayNumber) {
      baseClass += ' day-block-today';
    } else if (dayData?.status === 'completed') {
      baseClass += ' day-block-completed';
    } else if (dayData?.status === 'missed') {
      baseClass += ' day-block-missed';
    } else if (dayNumber < todayDayNumber) {
      baseClass += ' day-block-past';
    } else {
      baseClass += ' day-block-future';
    }

    return baseClass;
  };

  const getDayTitle = (dayNumber: number) => {
    const dayData = calendarData.days[dayNumber];
    if (dayData?.summary) {
      return `Day ${dayNumber}: ${dayData.summary}`;
    }
    return `Day ${dayNumber}`;
  };

  return (
    <section className="mb-8">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">2025 Quest Progress</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-slate-400">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-slate-400">Missed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded ring-2 ring-yellow-400"></div>
              <span className="text-slate-400">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-slate-800 border border-slate-600 rounded"></div>
              <span className="text-slate-400">Future</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-25 gap-1 max-h-96 overflow-y-auto p-2">
          {Array.from({ length: 365 }, (_, i) => i + 1).map((dayNumber) => (
            <div
              key={dayNumber}
              className={getDayBlockClass(dayNumber)}
              title={getDayTitle(dayNumber)}
              data-day={dayNumber}
              onClick={() => onDayClick(dayNumber)}
            >
              {dayNumber}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
