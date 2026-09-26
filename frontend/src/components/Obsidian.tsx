import { useState } from 'react';
import { Search, Plus, FileText } from 'lucide-react';

const notes = [
  { id: '1', title: 'Планы на месяц', preview: '1. Закончить проект\n2. Прочитать книгу\n3. Разобрать React' },
  { id: '2', title: 'Идеи для проекта', preview: 'Список идей и заметок по текущим проектам' },
  { id: '3', title: 'Планировщик', preview: 'Черновик структуры недели' },
  { id: '4', title: 'Учёба', preview: 'Конспекты по математике' },
  { id: '5', title: 'Полезные ссылки', preview: 'Материалы для самообучения' },
];

export default function Obsidian() {
  const [active, setActive] = useState(notes[0].id);
  const [query, setQuery] = useState('');

  const filtered = notes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));
  const activeNote = notes.find((n) => n.id === active) ?? notes[0];

  return (
    <div className="flex flex-1">
      <div className="w-72 shrink-0 border-r border-border px-5 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-text">Obsidian</h1>
          <button
            type="button"
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
          {filtered.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => setActive(note.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active === note.id ? 'bg-primary/10 font-medium text-primary' : 'text-text-muted hover:bg-surface-2'
                }`}
              >
                <FileText size={15} className="shrink-0" />
                {note.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 px-8 py-6">
        <h2 className="text-lg font-semibold text-text">{activeNote.title}</h2>
        <div className="mt-4 whitespace-pre-line rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-text-muted">
          {activeNote.preview}
        </div>
      </div>
    </div>
  );
}
