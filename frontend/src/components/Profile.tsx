import { useEffect, useState } from 'react';
import { Flame, CheckCircle2, Target } from 'lucide-react';
import { api, requireAuth } from '../lib/api';
import type { Profile } from '../lib/api';

export default function Profile() {
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setAuthed(requireAuth());
  }, []);

  useEffect(() => {
    if (!authed) {
      return;
    }
    api.profile
      .get()
      .then(setProfile)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить профиль.');
      });
  }, [authed]);

  if (!authed) {
    return null;
  }

  if (error) {
    return (
      <div className="flex-1 px-8 py-6">
        <h1 className="text-xl font-semibold text-text">Профиль</h1>
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 px-8 py-6">
        <h1 className="text-xl font-semibold text-text">Профиль</h1>
        <p className="mt-4 text-sm text-text-muted">Загрузка…</p>
      </div>
    );
  }

  const { user, stats } = profile;
  const xpInLevel = user.xp % 1000;
  const levelProgress = xpInLevel / 1000;

  const weekBars = stats.weekly_completed;
  const maxBar = Math.max(...weekBars, 1);
  const weekLabels = weekBars.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (weekBars.length - 1 - i));
    return new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(d);
  });

  return (
    <div className="flex-1 px-8 py-6">
      <h1 className="text-xl font-semibold text-text">Профиль</h1>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/15 text-2xl font-semibold text-primary">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text">{user.username}</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-600">
              Уровень {user.level}
            </span>
          </div>
          <p className="text-xs text-text-muted">{user.xp} XP</p>
          <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-primary" style={{ width: `${levelProgress * 100}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-text-muted">
            До следующего уровня: {1000 - xpInLevel} XP
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ProfileStat icon={Flame} label="Стрик" value={`${stats.streak_days} дн.`} tone="text-orange-500 bg-orange-100" />
        <ProfileStat icon={CheckCircle2} label="Всего задач" value={String(stats.total_tasks)} tone="text-blue-500 bg-blue-100" />
        <ProfileStat icon={Target} label="Выполнено" value={String(stats.completed_tasks)} tone="text-primary bg-primary/10" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6">
          <div className="relative h-24 w-24">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-surface-2)" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 42 * (stats.completion_rate / 100)} ${2 * Math.PI * 42}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-text">
              {stats.completion_rate}%
            </div>
          </div>
          <p className="text-center text-xs text-text-muted">
            Прогресс
            <br />
            <span className="font-medium text-text">
              {stats.completed_tasks} / {stats.total_tasks} выполнено
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text">Выполнено за 7 дней</h2>
          <div className="mt-4 flex h-32 items-end gap-3">
            {weekBars.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{ height: `${(h / maxBar) * 100}%` }}
                />
                <span className="text-[10px] text-text-muted">
                  {weekLabels[i]}
                  <br />
                  {h}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileStatProps {
  icon: typeof Flame;
  label: string;
  value: string;
  tone: string;
}

function ProfileStat({ icon: Icon, label, value, tone }: ProfileStatProps) {
  const [textTone, bgTone] = tone.split(' ');
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgTone} ${textTone}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-base font-semibold text-text">{value}</p>
      </div>
    </div>
  );
}
