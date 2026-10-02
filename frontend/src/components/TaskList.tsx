import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { api, badgeColor, formatDueDate, requireAuth } from '../lib/api';
import type { Task } from '../lib/api';

const filters: { label: string; value: 'all' | 'today' | 'week' | 'month' }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Сегодня', value: 'today' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
];

export default function TaskList() {
  const [authed, setAuthed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setTasks(await api.tasks.list({ filter }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить задачи.');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setAuthed(requireAuth());
  }, []);

  useEffect(() => {
    if (authed) {
      loadTasks();
    }
  }, [authed, loadTasks]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function toggleTask(task: Task) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    try {
      const updated = await api.tasks.toggle(task.id);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: task.done } : t)));
      setError(err instanceof Error ? err.message : 'Не удалось обновить задачу.');
    }
  }

  async function deleteTask(task: Task) {
    setOpenMenuId(null);
    if (!window.confirm(`Удалить задачу «${task.title}»?`)) {
      return;
    }
    try {
      await api.tasks.remove(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить задачу.');
    }
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
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value ? 'bg-sidebar text-invert' : 'bg-surface text-text-muted hover:text-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <p className="px-5 py-8 text-center text-sm text-text-muted">Загрузка…</p>
        ) : (
          <ul>
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0 hover:bg-surface-2/60"
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task)}
                  className="h-4 w-4 shrink-0 rounded border-border accent-primary"
                />

                <span className={`flex-1 text-sm ${task.done ? 'text-text-muted line-through' : 'text-text'}`}>
                  {task.title}
                </span>

                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${badgeColor(task.category)}`}>
                  {task.category}
                </span>

                <span className="w-24 shrink-0 text-right text-xs text-text-muted">
                  {formatDueDate(task.due_date)}
                </span>

                <div className="relative" ref={openMenuId === task.id ? menuRef : null}>
                  <button
                    type="button"
                    onClick={() => setOpenMenuId((prev) => (prev === task.id ? null : task.id))}
                    className="text-text-muted hover:text-text"
                    aria-label="Действия"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === task.id && (
                    <div className="absolute right-0 top-7 z-10 w-44 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
                      <a
                        href={`/editor?id=${task.id}`}
                        className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-text hover:bg-surface-2"
                      >
                        <Pencil size={14} />
                        Редактировать
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteTask(task)}
                        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}

            {filteredTasks.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-text-muted">
                {tasks.length === 0 ? 'Задач пока нет — добавьте первую!' : 'Ничего не найдено'}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
