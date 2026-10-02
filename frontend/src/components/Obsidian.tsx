import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Plus, FileText, Save, Trash2 } from 'lucide-react';
import { api, requireAuth } from '../lib/api';
import type { Note } from '../lib/api';

export default function Obsidian() {
  const [authed, setAuthed] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const titleRef = useRef<HTMLInputElement | null>(null);

  // Выбор первой заметки — только при первой загрузке: поздний ответ сервера
  // не должен сбрасывать то, что пользователь уже открыл или создал.
  const didInitialLoad = useRef(false);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const list = await api.notes.list();
      setNotes(list);
      if (!didInitialLoad.current) {
        didInitialLoad.current = true;
        setActiveId(list[0]?.id ?? null);
        loadNoteIntoEditor(list[0] ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить заметки.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setAuthed(requireAuth());
  }, []);

  useEffect(() => {
    if (authed) {
      loadNotes();
    }
  }, [authed, loadNotes]);

  const filtered = notes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));
  const activeNote = notes.find((n) => n.id === activeId) ?? null;
  const hasChanges =
    activeNote !== null && (activeNote.title !== title || activeNote.content !== content);

  // Поля редактора заполняются прямо в обработчиках (а не в useEffect по состоянию),
  // иначе пост-отрисовочный эффект затирает то, что пользователь успел ввести.
  function loadNoteIntoEditor(note: Note | null) {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setSavedFlash(false);
  }

  function selectNote(id: string) {
    setActiveId(id);
    loadNoteIntoEditor(notes.find((n) => n.id === id) ?? null);
  }

  async function createNote() {
    setError('');
    try {
      const note = await api.notes.create({ title: 'Новая заметка', content: '' });
      setNotes((prev) => [note, ...prev]);
      setActiveId(note.id);
      loadNoteIntoEditor(note);
      titleRef.current?.focus();
      titleRef.current?.select();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать заметку.');
    }
  }

  async function saveNote() {
    if (!activeId) {
      return;
    }
    const trimmed = title.trim();
    if (!trimmed) {
      setError('У заметки должно быть название.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const updated = await api.notes.update(activeId, { title: trimmed, content });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setTitle(updated.title);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить заметку.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteNote() {
    if (!activeId || !window.confirm(`Удалить заметку «${title || 'Без названия'}»?`)) {
      return;
    }
    try {
      await api.notes.remove(activeId);
      const rest = notes.filter((n) => n.id !== activeId);
      setNotes(rest);
      setActiveId(rest[0]?.id ?? null);
      loadNoteIntoEditor(rest[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить заметку.');
    }
  }

  return (
    <div className="flex flex-1">
      <div className="w-72 shrink-0 border-r border-border px-5 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-text">Obsidian</h1>
          <button
            type="button"
            onClick={createNote}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover"
            aria-label="Новая заметка"
          >
            <Plus size={16} />
          </button>
        </div>
        <p className="mt-1 text-xs text-text-muted">Все заметки, идеи и мысли в одном месте</p>

        <div className="relative mt-4">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск заметок..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text outline-none focus:border-primary"
          />
        </div>

        <ul className="mt-4 flex flex-col gap-1">
          {isLoading && <li className="px-3 py-2 text-sm text-text-muted">Загрузка…</li>}
          {!isLoading && filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-text-muted">
              {notes.length === 0 ? 'Заметок пока нет' : 'Ничего не найдено'}
            </li>
          )}
          {filtered.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => selectNote(note.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeId === note.id ? 'bg-primary/10 font-medium text-primary' : 'text-text-muted hover:bg-surface-2'
                }`}
              >
                <FileText size={15} className="shrink-0" />
                <span className="truncate">{note.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 px-8 py-6">
        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {!activeNote ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-text-muted">
            {notes.length === 0
              ? 'Создайте первую заметку — нажмите «+» слева.'
              : 'Выберите заметку слева.'}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название заметки"
              className="w-full rounded-lg border border-transparent bg-transparent px-0 text-lg font-semibold text-text outline-none focus:border-border focus:px-3 focus:py-2"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Текст заметки…"
              rows={16}
              className="w-full resize-y rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-text-muted outline-none focus:border-primary"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveNote}
                disabled={isSaving || !hasChanges}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:bg-primary-hover disabled:opacity-50"
              >
                <Save size={15} />
                {isSaving ? 'Сохранение…' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={deleteNote}
                className="flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={15} />
                Удалить
              </button>
              {savedFlash && <span className="text-xs text-text-muted">Сохранено ✓</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
