'use client';

import React, { useState } from 'react';
import { Flame, ChevronLeft, ChevronRight, CheckCircle2, Award } from 'lucide-react';

export default function StreakCalendar({ streak, activityMap, todayStr }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month header text, e.g. "October 2026"
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Number of days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const streakHistory = Array.isArray(streak?.history) ? streak.history : [];

  // Helper to format date YYYY-MM-DD
  const formatKey = (d) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  // Day of week labels
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="pq-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Calendar Header with Month Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '6px', borderRadius: '10px' }}>
            <Flame size={20} className="pq-flame-animated" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary, #f8fafc)' }}>
              {monthName}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>
              {streak?.current || 0} Day Active Streak
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={prevMonth}
            className="pq-icon-btn"
            aria-label="Previous month"
            style={{ width: '32px', height: '32px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="pq-icon-btn"
            aria-label="Next month"
            style={{ width: '32px', height: '32px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of Week Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
        {daysOfWeek.map(day => (
          <span key={day} style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase' }}>
            {day}
          </span>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {/* Blank padding cells before day 1 */}
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} style={{ aspectRatio: '1', borderRadius: '10px' }} />
        ))}

        {/* Days of the current month */}
        {Array.from({ length: totalDays }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateStr = formatKey(dayNum);
          const isToday = dateStr === todayStr;
          const isCompleted = streakHistory.includes(dateStr) || (streak?.lastDate === dateStr);
          const questionsCount = activityMap?.[dateStr] || 0;

          return (
            <div
              key={dateStr}
              title={`${dateStr}${isCompleted ? ' — Drill Completed' : ''}${questionsCount > 0 ? ` (${questionsCount} Qs solved)` : ''}`}
              style={{
                aspectRatio: '1',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                fontSize: '0.8rem',
                fontWeight: isToday || isCompleted ? 800 : 500,
                color: isCompleted
                  ? '#ffffff'
                  : isToday
                  ? '#3b82f6'
                  : 'var(--text-secondary, #94a3b8)',
                background: isCompleted
                  ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                  : isToday
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'var(--bg-secondary, rgba(255,255,255,0.02))',
                border: isToday
                  ? '2px solid #3b82f6'
                  : isCompleted
                  ? '1px solid rgba(245, 158, 11, 0.4)'
                  : '1px solid var(--border-color, rgba(255,255,255,0.05))',
                boxShadow: isCompleted ? '0 2px 10px rgba(245, 158, 11, 0.35)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{dayNum}</span>
              {isCompleted && (
                <span style={{ fontSize: '9px', lineHeight: 1, marginTop: '1px' }}>🔥</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend & Summary Tally */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.06))', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }} />
            <span>Streak Done</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', border: '2px solid #3b82f6', background: 'rgba(59,130,246,0.15)' }} />
            <span>Today</span>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Award size={14} /> Best: {streak?.best || streak?.current || 0}d
        </div>
      </div>

    </div>
  );
}
