import { useState } from 'react';
import { Search, CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  date: string;
  done: boolean;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Изучить React', tag: 'Развитие', tagColor: 'bg-violet-500/15 text-violet-300', date: '02.06', done: true },
  { id: '2', title: 'Сделать UI макет', tag: 'Работа', tagColor: 'bg-blue-500/15 text-blue-300', date: '02.06', done: true },
  { id: '3', title: 'Прочитать книгу', tag: 'Личное', tagColor: 'bg-amber-500/15 text-amber-300', done: true, date: '03.06' },
  { id: '4', title: 'Починить баг', tag: 'Работа', tagColor: 'bg-blue-500/15 text-blue-300', date: '04.06', done: false },
  { id: '5', title: 'Пойти в спортзал', tag: 'Здоровье', tagColor: 'bg-rose-500/15 text-rose-300', date: '05.06', done: false },
  { id: '6', title: 'Написать отчёт', tag: 'Работа', tagColor: 'bg-blue-500/15 text-blue-300', date: '06.06', done: false },
];

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [query, setQuery] = useState('');

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex-1 px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Задачи</h1>

        <div className="relative w-64">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск..."
            className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-muted/60 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-surface">
        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b border-border/60 px-5 py-3 text-xs font-medium uppercase tracking-wide text-text-muted">
          <span></span>
          <span>Задача</span>
          <span>Тег</span>
          <span>Дата</span>
        </div>

        <ul>
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b border-border/40 px-5 py-3.5 last:border-b-0 hover:bg-surface-2/60"
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                aria-label={task.done ? 'Отметить невыполненной' : 'Отметить выполненной'}
                className={task.done ? 'text-primary' : 'text-text-muted hover:text-text'}
              >
                {task.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>

              <span className={`text-sm ${task.done ? 'text-text-muted line-through' : 'text-text'}`}>
                {task.title}
              </span>

              <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${task.tagColor}`}>
                {task.tag}
              </span>

              <span className="text-xs text-text-muted">{task.date}</span>
            </li>
          ))}

          {filteredTasks.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-text-muted">Ничего не найдено</li>
          )}
        </ul>
      </div>
    </div>
  );
}
