import { ConfirmDialog, MotionScope } from './MotionUI';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Check, FileText, Plus, Save, Search, Trash2 } from 'lucide-react';
import { api, requireAuth } from '../lib/api';
import type { Note } from '../lib/api';

function ObsidianContent() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [mobileEditor, setMobileEditor] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);
  function populate(note: Note | null) { setTitle(note?.title ?? ''); setContent(note?.content ?? ''); setSaved(false); }
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const list = await api.notes.list(); setNotes(list);
      if (!loaded.current) { loaded.current = true; setActiveId(list[0]?.id ?? null); populate(list[0] ?? null); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Не удалось загрузить заметки.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { setAuthed(requireAuth()); }, []);
  useEffect(() => { if (authed) void load(); }, [authed, load]);
  const active = notes.find(note => note.id === activeId) ?? null;
  const dirty = !!active && (active.title !== title || active.content !== content);
  const filtered = notes.filter(note => note.title.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru')));
  function select(note: Note) {
    if (dirty && !window.confirm('Есть несохранённые изменения. Перейти к другой заметке?')) return;
    setActiveId(note.id); populate(note); setMobileEditor(true);
  }
  async function create() {
    if (dirty && !window.confirm('Есть несохранённые изменения. Создать новую заметку?')) return;
    setError('');
    try {
      const note = await api.notes.create({ title:'Новая заметка', content:'' });
      setNotes(prev => [note, ...prev]); setActiveId(note.id); populate(note); setMobileEditor(true);
      requestAnimationFrame(() => { titleRef.current?.focus(); titleRef.current?.select(); });
    } catch (err) { setError(err instanceof Error ? err.message : 'Не удалось создать заметку.'); }
  }
  async function save() {
    if (!activeId) return;
    if (!title.trim()) { setError('Введите название заметки, затем сохраните её.'); titleRef.current?.focus(); return; }
    setSaving(true); setError('');
    try {
      const updated = await api.notes.update(activeId, { title:title.trim(), content });
      setNotes(prev => prev.map(note => note.id === updated.id ? updated : note)); setTitle(updated.title); setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) { setError(err instanceof Error ? err.message : 'Не удалось сохранить заметку.'); }
    finally { setSaving(false); }
  }
  async function remove() {
    if (!activeId || deleting) return;
    setDeleting(true);
    setError('');
    try {
      await api.notes.remove(activeId);
      const rest = notes.filter(note => note.id !== activeId); setNotes(rest); setActiveId(rest[0]?.id ?? null); populate(rest[0] ?? null); setMobileEditor(false); setConfirmDelete(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Не удалось удалить заметку.'); } finally { setDeleting(false); }
  }
  return <div id="main-content" tabIndex={-1} className="app-main notes-page">
    <div className="page-head"><div><span className="app-kicker">ИДЕИ И КОНТЕКСТ / 04</span><h1 className="app-heading">Заметки<span className="heading-period">.</span></h1><p className="app-subtitle">Место для мыслей, которые помогают двигаться дальше.</p></div><button type="button" className="btn btn-primary" onClick={() => void create()}><Plus size={18} aria-hidden="true"/> Новая заметка</button></div>
    {error && <div className="notice notes-error" role="alert">{error}</div>}
    <div className={`notes-layout panel ${mobileEditor ? 'mobile-editor-open' : ''}`}>
      <aside className="notes-list" aria-label="Список заметок">
        <div className="notes-list-head"><span>ВАША БИБЛИОТЕКА</span><span>{notes.length}</span></div>
        <label className="search-field"><Search size={16} aria-hidden="true"/><span className="sr-only">Поиск заметок</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по названию"/></label>
        {loading ? <div className="notes-skeleton"><span className="skeleton"/><span className="skeleton"/><span className="skeleton"/></div> : filtered.length ? <ul>{filtered.map(note => <li key={note.id}><button type="button" aria-current={activeId === note.id ? 'true' : undefined} onClick={() => select(note)}><FileText size={17} aria-hidden="true"/><span><strong className="od-truncate">{note.title}</strong><small>{new Intl.DateTimeFormat('ru-RU', { day:'numeric',month:'short' }).format(new Date(note.updated_at))}</small></span></button></li>)}</ul> : !error && <div className="notes-list-empty">{query ? 'Ничего не найдено' : 'Заметок пока нет'}{query && <button type="button" onClick={() => setQuery('')}>Сбросить поиск</button>}</div>}
      </aside>
      <section className="notes-editor" aria-label="Редактор заметки">
        <button type="button" className="notes-mobile-back" onClick={() => setMobileEditor(false)}><ArrowLeft size={16} aria-hidden="true"/> К списку</button>
        {!active ? <div className="notes-empty"><BookOpen size={34} color="var(--violet)" aria-hidden="true"/><h2>{notes.length ? 'Выберите заметку' : 'Здесь начинаются идеи'}</h2><p>{notes.length ? 'Откройте заметку из списка слева.' : 'Создайте первую заметку, чтобы сохранить мысль или план.'}</p><button type="button" className="btn btn-primary" onClick={() => void create()}>Создать заметку</button></div> :
        <>
          <div className="notes-editor-top"><span className="eyebrow">РАБОЧИЙ ЛИСТ</span><span>{dirty ? 'ЕСТЬ ИЗМЕНЕНИЯ' : saved ? 'СОХРАНЕНО' : 'БЕЗ ИЗМЕНЕНИЙ'}</span></div>
          <label className="sr-only" htmlFor="note-title">Название заметки</label><input ref={titleRef} id="note-title" className="notes-title" value={title} onChange={e => { setTitle(e.target.value); setSaved(false); }} maxLength={200} placeholder="Название заметки"/>
          <div className="notes-meta">Обновлено {new Intl.DateTimeFormat('ru-RU', { day:'numeric',month:'long',year:'numeric' }).format(new Date(active.updated_at))}</div>
          <label className="sr-only" htmlFor="note-content">Текст заметки</label><textarea id="note-content" className="notes-content" value={content} onChange={e => { setContent(e.target.value); setSaved(false); }} placeholder="Начните писать здесь…" rows={16}/>
          <div className="notes-editor-actions"><button className="btn btn-primary" type="button" onClick={() => void save()} disabled={saving || !dirty}><Save size={16} aria-hidden="true"/>{saving ? 'Сохранение…' : 'Сохранить'}</button>{saved && <span className="notes-saved"><Check size={15} aria-hidden="true"/> Сохранено</span>}<button className="icon-btn notes-delete" type="button" onClick={() => setConfirmDelete(true)} disabled={deleting} aria-label="Удалить заметку"><Trash2 size={17}/></button></div>
        </>}
      </section>
    </div>
    <ConfirmDialog open={confirmDelete} title="Удалить заметку?" description={`«${title}» будет удалена без возможности восстановления.`} busy={deleting} error={error} onCancel={() => setConfirmDelete(false)} onConfirm={() => void remove()}/>
  </div>;
}

export default function Obsidian() { return <MotionScope><ObsidianContent/></MotionScope>; }

