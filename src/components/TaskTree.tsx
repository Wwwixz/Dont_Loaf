import { useState } from 'react';
import { Plus, CheckSquare, Square } from 'lucide-react';

interface TodayTask {
  id: string;
  title: string;
  done: boolean;
}

const initialToday: TodayTask[] = [
  { id: '1', title: 'Сделать ДЗ по математике', done: true },
  { id: '2', title: 'Прочитать книгу', done: true },
  { id: '3', title: 'Пробежка 5 км', done: false },
  { id: '4', title: 'Разобрать почту', done: false },
  { id: '5', title: 'Изучить React', done: false },
];

function TreeIllustration({ progress }: { progress: number }) {
  // progress: 0..1 — влияет на количество "цветущих" узлов дерева
  const nodes = [
    { cx: 150, cy: 60 },
    { cx: 110, cy: 95 },
    { cx: 190, cy: 95 },
    { cx: 80, cy: 140 },
    { cx: 150, cy: 130 },
    { cx: 220, cy: 140 },
  ];
  const bloomCount = Math.round(progress * nodes.length);

  return (
    <svg viewBox="0 0 300 260" className="h-full w-full">
      <line x1="150" y1="230" x2="150" y2="150" stroke="var(--color-border)" strokeWidth="6" strokeLinecap="round" />
      {nodes.map((n, i) => (
        <line
          key={`branch-${i}`}
          x1="150"
          y1="150"
          x2={n.cx}
          y2={n.cy}
          stroke="var(--color-border)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={`node-${i}`}
          cx={n.cx}
          cy={n.cy}
          r="14"
          fill={i < bloomCount ? 'var(--color-primary)' : 'var(--color-surface-2)'}
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
      ))}
      <ellipse cx="150" cy="245" rx="60" ry="8" fill="var(--color-surface-2)" />
    </svg>
  );
}

export default function TaskTree() {
  const [today, setToday] = useState<TodayTask[]>(initialToday);

  function toggle(id: string) {
    setToday((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const doneCount = today.filter((t) => t.done).length;
  const progress = today.length ? doneCount / today.length : 0;

  return (
    <div className="flex-1 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Дерево задач</h1>
          <p className="text-sm text-text-muted">Сегодня, 22 мая</p>
        </div>
        <a
          href="/editor"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          <Plus size={16} />
          Добавить задачу
        </a>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface p-6">
          <div className="h-72 w-full max-w-sm">
            <TreeIllustration progress={progress} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text">Сегодня</h2>

          <ul className="mt-4 flex flex-col gap-1">
            {today.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => toggle(task.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-surface-2"
                >
                  {task.done ? (
                    <CheckSquare size={18} className="shrink-0 text-primary" />
                  ) : (
                    <Square size={18} className="shrink-0 text-text-muted" />
                  )}
                  <span className={task.done ? 'text-text-muted line-through' : 'text-text'}>
                    {task.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
              <span>Выполнено сегодня</span>
              <span>
                {doneCount}/{today.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
