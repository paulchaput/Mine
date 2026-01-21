import { useState, useEffect } from 'react';
import { loadCycles, loadDoses } from '../utils/storage';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cycles, setCycles] = useState(loadCycles());
  const [doses, setDoses] = useState(loadDoses());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    setCycles(loadCycles());
    setDoses(loadDoses());
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDosesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return doses.filter(d => {
      const doseDate = new Date(d.timestamp).toISOString().split('T')[0];
      return doseDate === dateStr;
    });
  };

  const getCyclesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return cycles.filter(c => {
      return dateStr >= c.startDate && dateStr <= c.endDate;
    });
  };

  const renderDay = (day) => {
    if (day === 0) return <div key={`empty-${Math.random()}`} className="calendar-day empty" />;

    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const isToday = date.getTime() === today.getTime();
    const dosesOnDay = getDosesForDate(date);
    const cyclesOnDay = getCyclesForDate(date);

    const hasDose = dosesOnDay.length > 0;
    const takenDoses = dosesOnDay.filter(d => d.status === 'taken').length;
    const skippedDoses = dosesOnDay.filter(d => d.status === 'skipped').length;

    return (
      <div
        key={day}
        className={`calendar-day ${isToday ? 'today' : ''} ${hasDose ? 'has-event' : ''}`}
        onClick={() => setSelectedDate({ date: dateStr, doses: dosesOnDay, cycles: cyclesOnDay })}
      >
        <div className="day-number">{day}</div>
        <div className="day-indicators">
          {takenDoses > 0 && <div className="dot dot-success" title={`${takenDoses} taken`} />}
          {skippedDoses > 0 && <div className="dot dot-warning" title={`${skippedDoses} skipped`} />}
          {cyclesOnDay.length > 0 && !hasDose && <div className="dot dot-info" title="Active cycle" />}
        </div>
      </div>
    );
  };

  const calendarDays = [];
  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(renderDay(0));
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(renderDay(day));
  }

  const DayDetailModal = ({ dayData, onClose }) => {
    if (!dayData) return null;

    const { date, doses: dayDoses, cycles: dayCycles } = dayData;
    const dateObj = new Date(date);

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
          <div className="modal-header">
            <h3>
              {dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
          </div>
          <div className="modal-body">
            {dayCycles.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.5rem' }}>Active Cycles</h4>
                {dayCycles.map(cycle => (
                  <div key={cycle.id} className="chip chip-sm chip-primary" style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                    {cycle.peptideName}
                  </div>
                ))}
              </div>
            )}

            {dayDoses.length > 0 ? (
              <div>
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.5rem' }}>Doses ({dayDoses.length})</h4>
                {dayDoses.map((dose) => (
                  <div key={dose.id} className="card" style={{ padding: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          {dose.peptideName}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {dose.doseMg} {dose.unit}
                        </div>
                      </div>
                      <div>
                        {dose.status === 'taken' && (
                          <span className="badge badge-success">✓ Taken</span>
                        )}
                        {dose.status === 'skipped' && (
                          <span className="badge badge-warning">Skipped</span>
                        )}
                      </div>
                    </div>
                    {dose.notes && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {dose.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-small">No doses logged on this day</p>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <style>{`
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: var(--bg-primary);
          border-radius: var(--radius-md);
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          background: var(--bg-primary);
          padding: 1rem;
          border-radius: var(--radius-md);
        }
        .weekday-header {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 0.5rem 0;
        }
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
          min-height: 50px;
        }
        .calendar-day:hover {
          background: var(--bg-tertiary);
          transform: scale(1.05);
        }
        .calendar-day.today {
          background: var(--accent);
          color: white;
          font-weight: 700;
        }
        .calendar-day.today:hover {
          background: var(--accent-hover);
        }
        .calendar-day.empty {
          background: transparent;
          cursor: default;
        }
        .calendar-day.empty:hover {
          transform: none;
        }
        .day-number {
          font-size: 0.875rem;
        }
        .day-indicators {
          display: flex;
          gap: 2px;
          margin-top: 2px;
        }
        .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }
        .dot-success {
          background: var(--success);
        }
        .dot-warning {
          background: var(--warning);
        }
        .dot-info {
          background: var(--info);
        }
        .calendar-day.today .dot {
          background: white;
        }
      `}</style>

      <h1>Calendar</h1>

      <div className="alert alert-info" style={{ fontSize: '0.875rem' }}>
        <strong>Track your schedule.</strong> Green dots = doses taken, Yellow = skipped, Blue = active cycle days
      </div>

      <div className="calendar-header">
        <button className="btn btn-secondary btn-sm" onClick={goToPrevMonth}>
          ←
        </button>
        <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>
          {monthNames[month]} {year}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={goToNextMonth}>
          →
        </button>
      </div>

      <button className="btn btn-secondary btn-sm btn-block mb-sm" onClick={goToToday}>
        Today
      </button>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="weekday-header">{day}</div>
        ))}
        {calendarDays}
      </div>

      <div className="card mt-md">
        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Legend</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="dot dot-success" style={{ width: '8px', height: '8px' }} />
            <span>Dose taken</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="dot dot-warning" style={{ width: '8px', height: '8px' }} />
            <span>Dose skipped</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="dot dot-info" style={{ width: '8px', height: '8px' }} />
            <span>Active cycle (no dose logged)</span>
          </div>
        </div>
      </div>

      {selectedDate && <DayDetailModal dayData={selectedDate} onClose={() => setSelectedDate(null)} />}
    </div>
  );
}
