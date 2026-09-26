import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, X, Plus } from 'lucide-react';

const categories = ['Учёба', 'Работа', 'Здоровье', 'Личное'];
const priorities = [
  { value: 'low', label: 'Низкий', color: 'bg-emerald-500' },
  { value: 'medium', label: 'Средний', color: 'bg-amber-500' },
  { value: 'high', label: 'Высокий', color: 'bg-rose-500' },
];

export default function TaskEditor() {
  const [tags, setTags] = useState<string[]>(['математика']);
  const [tagInput, setTagInput] = useState('');
  const [priority, setPriority] = useState('high');

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Здесь будет сохранение задачи через API
  }

  return (
    <div className="flex-1 px-8 py-6">
      <a href="/tree" className="mb-4 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Редактор задачи
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
              defaultValue="Сделать домашнее задание по математике"
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
              defaultValue="Решить задачи с 1 по 10 из учебника. Повторить тему по формулам."
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
                className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary"
                defaultValue={categories[0]}
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
              defaultValue="2025-05-22"
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

        <div className="flex gap-3 lg:col-span-2">
          <button
            type="button"
            className="rounded-lg border border-rose-200 px-5 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50"
          >
            Удалить
          </button>
          <a
            href="/tree"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-muted hover:text-text"
          >
            Отмена
          </a>
          <button
            type="submit"
            className="ml-auto rounded-lg bg-sidebar px-6 py-2.5 text-sm font-semibold text-invert shadow-sm transition-colors hover:bg-sidebar-hover"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}
