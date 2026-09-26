import { Pencil, Flame, CheckCircle2, Target } from 'lucide-react';

const weekBars = [40, 60, 30, 80, 55, 90, 70];

export default function Profile() {
  return (
    <div className="flex-1 px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Профиль</h1>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted hover:text-text"
        >
          <Pencil size={14} />
          Редактировать
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-2 text-2xl font-semibold text-text-muted">
          А
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text">Артём</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-600">
              Уровень 5
            </span>
          </div>
          <p className="text-xs text-text-muted">5260 XP</p>
          <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-surface-2">
            <div className="h-full w-3/4 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ProfileStat icon={Flame} label="Стрик" value="7 дней" tone="text-orange-500 bg-orange-100" />
        <ProfileStat icon={CheckCircle2} label="Всего задач" value="124" tone="text-blue-500 bg-blue-100" />
        <ProfileStat icon={Target} label="Выполнено" value="93" tone="text-primary bg-primary/10" />
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
                strokeDasharray={`${2 * Math.PI * 42 * 0.75} ${2 * Math.PI * 42}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-text">
              75%
            </div>
          </div>
          <p className="text-center text-xs text-text-muted">
            Прогресс
            <br />
            <span className="font-medium text-text">93 / 124 выполнено</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text">Статистика</h2>
          <div className="mt-4 flex h-32 items-end gap-3">
            {weekBars.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-text-muted">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i]}
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
