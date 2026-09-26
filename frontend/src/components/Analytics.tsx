import { ListChecks, CheckCircle2, Percent } from 'lucide-react';

const weekData = [40, 55, 45, 70, 65, 85, 75];
const categories = [
  { label: 'Учёба', value: 38, color: '#2f9e6b' },
  { label: 'Работа', value: 26, color: '#3b82f6' },
  { label: 'Здоровье', value: 18, color: '#f59e0b' },
  { label: 'Личное', value: 12, color: '#a855f7' },
  { label: 'Хобби', value: 6, color: '#f43f5e' },
];

const achievements = [
  { emoji: '\u{1F525}', title: 'Серия продуктивности', subtitle: '7 дней подряд' },
  { emoji: '\u{1F3C6}', title: 'Мастер выполнения', subtitle: '50 выполненных задач' },
  { emoji: '\u2B50', title: 'Постоянство', subtitle: '30 дней в приложении' },
];

const now = new Date();
const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const lastDateParts = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).formatToParts(new Date(now.getFullYear(), now.getMonth(), lastDayOfMonth));
const datePart = (type: Intl.DateTimeFormatPartTypes) => {
  const part = lastDateParts.find((datePart) => datePart.type === type);
  if (!part) {
    throw new Error(`Missing ${type} part when formatting the current date`);
  }
  return part.value;
};
const dateRangeLabel = `1 — ${datePart('day')} ${datePart('month')} ${datePart('year')}`;
const chartDates = [1, 10, 15, 20, 25, lastDayOfMonth].map((day) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(
    new Date(now.getFullYear(), now.getMonth(), day),
  ),
);

function LineChart() {
  const max = Math.max(...weekData);
  const points = weekData
    .map((v, i) => `${(i / (weekData.length - 1)) * 280},${80 - (v / max) * 70}`)
    .join(' ');

  return (
    <svg viewBox="0 0 280 90" className="h-32 w-full">
      <polyline points={points} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {weekData.map((v, i) => (
        <circle
          key={i}
          cx={(i / (weekData.length - 1)) * 280}
          cy={80 - (v / max) * 70}
          r="3.5"
          fill="var(--color-primary)"
        />
      ))}
    </svg>
  );
}

function DonutChart() {
  const total = categories.reduce((sum, c) => sum + c.value, 0);
  let offset = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
      {categories.map((c) => {
        const dash = (c.value / total) * circumference;
        const circle = (
          <circle
            key={c.label}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={c.color}
            strokeWidth="14"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
          />
        );
        offset += dash;
        return circle;
      })}
    </svg>
  );
}

export default function Analytics() {
  return (
    <div className="flex-1 px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Аналитика</h1>
        <span className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-muted">
          {dateRangeLabel}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={ListChecks} label="Всего задач" value="48" change="+12%" />
        <StatCard icon={CheckCircle2} label="Выполнено" value="36" change="+18%" />
        <StatCard icon={Percent} label="Процент выполнения" value="75%" change="+10%" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text">Прогресс по дням</h2>
          <div className="mt-4">
            <LineChart />
            <div className="mt-1 flex justify-between text-[10px] text-text-muted">
              {chartDates.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text">Категории</h2>
          <div className="mt-4 flex items-center gap-6">
            <DonutChart />
            <ul className="flex flex-1 flex-col gap-2 text-xs">
              {categories.map((c) => (
                <li key={c.label} className="flex items-center justify-between gap-3 text-text-muted">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </span>
                  <span className="font-medium text-text">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-text">Топ достижений</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {achievements.map((a) => (
            <div key={a.title} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
              <span className="text-2xl">{a.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-text">{a.title}</p>
                <p className="text-[11px] text-text-muted">{a.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: typeof ListChecks;
  label: string;
  value: string;
  change: string;
}

function StatCard({ icon: Icon, label, value, change }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon size={19} />
      </span>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-text">{value}</span>
          <span className="text-[11px] font-medium text-primary">{change}</span>
        </div>
      </div>
    </div>
  );
}
