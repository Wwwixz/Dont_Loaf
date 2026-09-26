import { useState } from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';

const todayDate = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date());

interface Task {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  date: string;
  done: boolean;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Сделать ДЗ по математике', tag: 'Учёба', tagColor: 'bg-blue-100 text-blue-600', date: 'Сегодня', done: true },
  { id: '2', title: 'Прочитать книгу', tag: 'Саморазвитие', tagColor: 'bg-violet-100 text-violet-600', date: 'Сегодня', done: true },
  { id: '3', title: 'Пробежка 5 км', tag: 'Здоровье', tagColor: 'bg-rose-100 text-rose-600', date: 'Завтра', done: false },
  { id: '4', title: 'Разобрать почту', tag: 'Работа', tagColor: 'bg-amber-100 text-amber-700', date: 'Завтра', done: false },
  { id: '5', title: 'Изучить React', tag: 'Проекты', tagColor: 'bg-teal-100 text-teal-700', date: todayDate, done: false },
  { id: '6', title: 'Поговорить с игрой', tag: 'Хобби', tagColor: 'bg-fuchsia-100 text-fuchsia-700', date: todayDate, done: false },
];

const filters = ['Все', 'Сегодня', 'Неделя', 'Месяц'];

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Все');

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const filteredTasks = tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex-1 px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Все задачи</h1>

        <div className="flex items-center gap-3">
          <div className="relative w-56">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск задач..."
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-muted/60 outline-none focus:border-primary"
            />
          </div>
          <a
            href="/editor"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus size={16} />
            Добавить
          </a>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f ? 'bg-sidebar text-invert' : 'bg-surface text-text-muted hover:text-text'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <ul>
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0 hover:bg-surface-2/60"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                className="h-4 w-4 shrink-0 rounded border-border accent-primary"
              />

              <span className={`flex-1 text-sm ${task.done ? 'text-text-muted line-through' : 'text-text'}`}>
                {task.title}
              </span>

              <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${task.tagColor}`}>
                {task.tag}
              </span>

              <span className="w-24 shrink-0 text-right text-xs text-text-muted">{task.date}</span>

              <button type="button" className="text-text-muted hover:text-text" aria-label="Действия">
                <MoreVertical size={16} />
              </button>
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
