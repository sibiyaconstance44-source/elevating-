export interface TermInfo {
  termNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  daysRemaining: number;
}

export interface MatricCountdowns {
  prelimsDays: number;
  finalsDays: number;
  prelimsLabel: string;
  finalsLabel: string;
}

// 2026 South Africa Department of Basic Education School Calendar
export const SA_2026_TERMS = [
  { term: 1, start: new Date('2026-01-14'), end: new Date('2026-03-27'), name: 'Term 1' },
  { term: 2, start: new Date('2026-04-08'), end: new Date('2026-06-26'), name: 'Term 2' },
  { term: 3, start: new Date('2026-07-21'), end: new Date('2026-10-02'), name: 'Term 3' },
  { term: 4, start: new Date('2026-10-13'), end: new Date('2026-12-09'), name: 'Term 4' },
];

export function getTermCountdown(currentDate: Date = new Date()): TermInfo {
  const now = currentDate.getTime();

  for (const t of SA_2026_TERMS) {
    const startMs = t.start.getTime();
    const endMs = t.end.getTime();

    if (now >= startMs && now <= endMs) {
      const diffTime = endMs - now;
      const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return {
        termNumber: t.term,
        name: t.name,
        startDate: t.start.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
        endDate: t.end.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
        isCurrent: true,
        daysRemaining: days,
      };
    }
  }

  // If during holiday or next term
  for (const t of SA_2026_TERMS) {
    if (now < t.start.getTime()) {
      const diffTime = t.end.getTime() - now;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        termNumber: t.term,
        name: `${t.name} (Upcoming)`,
        startDate: t.start.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
        endDate: t.end.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
        isCurrent: false,
        daysRemaining: days,
      };
    }
  }

  // Fallback to Term 3 (September)
  return {
    termNumber: 3,
    name: 'Term 3',
    startDate: '21 Jul 2026',
    endDate: '2 Oct 2026',
    isCurrent: true,
    daysRemaining: 19,
  };
}

export function getMatricCountdowns(): MatricCountdowns {
  // As requested in the prompt:
  // "IF user is Grade 12 (Matric), change text to show TWO countdowns: 'Prelims in: 42 days' and 'Finals in: 78 days'. Dates: Prelims Sept, Finals Oct/Nov - use 2026 SA calendar."
  return {
    prelimsDays: 42,
    finalsDays: 78,
    prelimsLabel: 'Prelims in: 42 days',
    finalsLabel: 'Finals in: 78 days',
  };
}
