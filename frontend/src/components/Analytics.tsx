import { useEffect, useState } from 'react';
import { ListChecks, CheckCircle2, Percent } from 'lucide-react';
import { api, requireAuth } from '../lib/api';
import type { AnalyticsSummary, Profile } from '../lib/api';

const categoryColors = ['#2f9e6b', '#3b82f6', '#f59e0b', '#a855f7', '#f43f5e', '#0ea5e9', '#14b8a6'];

function LineChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => `${(i / Math.max(values.length - 1, 1)) * 280},${80 - (v / max) * 70}`)
    .join(' ');

  return (
    <svg viewBox="0 0 280 90" className="h-32 w-full">
      <polyline points={points} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={(i / Math.max(values.length - 1, 1)) * 280}
          cy={80 - (v / max) * 70}
          r="3.5"
          fill="var(--color-primary)"
        />
      ))}
    </svg>
  );
}

function DonutChart({ categories }: { categories: { label: string; value: number }[] }) {
  const total = categories.reduce((sum, c) => sum + c.value, 0) || 1;
  let offset = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
      {categories.map((c, i) => {
        const dash = (c.value / total) * circumference;
        const circle = (
          <circle
            key={c.label}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={categoryColors[i % categoryColors.length]}
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
  const [authed, setAuthed] = useState(false);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setAuthed(requireAuth());
  }, []);

  useEffect(() => {
    if (!authed) {
      return;
    }
    Promise.all([api.analytics.summary(), api.profile.get()])
      .then(([summaryData, profileData]) => {
        setSummary(summaryData);
        setProfile(profileData);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить статистику.');
      });
  }, [authed]);

  if (!authed) {
    return null;
  }

  if (error) {
    return (
      <div className="flex-1 px-8 py-6">
        <h1 className="text-xl font-semibold text-text">Аналитика</h1>
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      </div>
    );
  }

  if (!summary || !profile) {
    return (
      <div className="flex-1 px-8 py-6">
        <h1 className="text-xl font-semibold text-text">Аналитика</h1>
        <p className="mt-4 text-sm text-text-muted">Загрузка…</p>
      </div>
    );
  }

  const dailyValues = summary.daily_progress.map((d) => d.completed);
  const dayLabels = summary.daily_progress.map((d) =>
    new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(`${d.day}T00:00:00`)),
  );
  const donutCategories = summary.categories.map((c) => ({ label: c.category, value: c.percent }));

  const achievements = [
    { emoji: '\u{1F525}', title: 'Серия продуктивности', subtitle: `${profile.stats.streak_days} дн. подряд` },
    {
      emoji: '\u{1F3C6}',
      title: 'Мастер выполнения',
      subtitle: `${profile.stats.completed_tasks} выполненных задач`,
    },
    { emoji: '\u2B50', title: 'Уровень', subtitle: `Уровень ${profile.user.level} — ${profile.user.xp} XP` },
  ];

  return (
    <div className="flex-1 px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Аналитика</h1>
        <span className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-muted">
          Последние 7 дней
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={ListChecks} label="Всего задач" value={String(summary.total_tasks)} />
        <StatCard icon={CheckCircle2} label="Выполнено" value={String(summary.completed_tasks)} />
        <StatCard icon={Percent} label="Процент выполнения" value={`${summary.completion_rate}%`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text">Выполнено по дням</h2>
          <div className="mt-4">
            <LineChart values={dailyValues} />
            <div className="mt-1 flex justify-between text-[10px] text-text-muted">
              {dayLabels.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text">Категории</h2>
          <div className="mt-4 flex items-center gap-6">
            <DonutChart categories={donutCategories} />
            <ul className="flex flex-1 flex-col gap-2 text-xs">
              {summary.categories.length === 0 && (
                <li className="text-text-muted">Пока нет задач</li>
              )}
              {summary.categories.map((c, i) => (
                <li key={c.category} className="flex items-center justify-between gap-3 text-text-muted">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: categoryColors[i % categoryColors.length] }}
                    />
                    {c.category}
                  </span>
                  <span className="font-medium text-text">{c.percent}%</span>
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
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon size={19} />
      </span>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-text">{value}</span>
        </div>
      </div>
    </div>
  );
}
