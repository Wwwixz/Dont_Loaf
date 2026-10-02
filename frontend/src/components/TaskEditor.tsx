import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, X, Plus } from 'lucide-react';
import { api, requireAuth } from '../lib/api';
import type { Priority, Task } from '../lib/api';

const categories = ['Учёба', 'Работа', 'Здоровье', 'Личное'];
const priorities = [
  { value: 'low' as Priority, label: 'Низкий', color: 'bg-emerald-500' },
  { value: 'medium' as Priority, label: 'Средний', color: 'bg-amber-500' },
  { value: 'high' as Priority, label: 'Высокий', color: 'bg-rose-500' },
];

function getLocalDateValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function TaskEditor() {
  const [authed, setAuthed] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState(getLocalDateValue);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAuthed(requireAuth());
  }, []);

  useEffect(() => {
    if (!authed) {
      return;
    }
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      return;
    }
    setIsLoading(true);
    api.tasks
      .get(id)
      .then((task: Task) => {
        setTaskId(task.id);
        setTitle(task.title);
        setDescription(task.description ?? '');
        setCategory(task.category);
        setPriority(task.priority);
        setDate(task.due_date ?? '');
        setTags(task.tags.map((t) => t.name));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить задачу.');
      })
      .finally(() => setIsLoading(false));
  }, [authed]);

  function addTag() {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Введите название задачи.');
      return;
    }

    setIsSaving(true);
    const payload = {
      title: trimmedTitle,
      description: description.trim() || null,
      category,
      priority,
      due_date: date || null,
      tags,
    };

    try {
      if (taskId) {
        await api.tasks.update(taskId, payload);
      } else {
        await api.tasks.create(payload);
      }
      window.location.assign('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить задачу.');
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!taskId || !window.confirm('Удалить эту задачу?')) {
      return;
    }
    try {
      await api.tasks.remove(taskId);
      window.location.assign('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить задачу.');
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 px-8 py-6">
        <p className="text-sm text-text-muted">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-8 py-6">
      <a href="/tree" className="mb-4 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Назад к дереву задач
      </a>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="title">
              Название задачи
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              required
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="description">
              Описание
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Детали, ссылки, шаги…"
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="category">
                Категория
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">Приоритет</label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${
                      priority === p.value
                        ? 'border-primary bg-primary/10 text-text'
                        : 'border-border text-text-muted hover:border-primary/40'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${p.color}`} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="date">
              Дата
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary"
            />
            <p className="mt-1 text-xs text-text-muted">Не повторять</p>
          </div>
        </div>

        <div className="flex h-fit flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
          <span className="text-xs font-medium text-text-muted">Теги</span>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} aria-label={`Удалить тег ${tag}`}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Новый тег"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={addTag}
              className="flex shrink-0 items-center justify-center rounded-lg border border-border px-2.5 text-text-muted hover:border-primary/40 hover:text-primary"
              aria-label="Добавить тег"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 lg:col-span-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 lg:col-span-2">
          {taskId && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-rose-200 px-5 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50"
            >
              Удалить
            </button>
          )}
          <a
            href="/tree"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-muted hover:text-text"
          >
            Отмена
          </a>
          <button
            type="submit"
            disabled={isSaving}
            className="ml-auto rounded-lg bg-sidebar px-6 py-2.5 text-sm font-semibold text-invert shadow-sm transition-colors hover:bg-sidebar-hover disabled:opacity-60"
          >
            {isSaving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}
