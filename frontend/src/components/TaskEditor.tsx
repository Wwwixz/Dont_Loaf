import { ConfirmDialog, MotionScope } from './MotionUI';
import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { ArrowLeft, CalendarDays, Check, Plus, Trash2, X } from 'lucide-react';
import { api, requireAuth } from '../lib/api';
import type { Priority, Task } from '../lib/api';

const categories = ['Учёба', 'Работа', 'Здоровье', 'Личное'];
const priorities: { value: Priority; label: string }[] = [{ value:'low',label:'Низкий' },{ value:'medium',label:'Средний' },{ value:'high',label:'Высокий' }];
function todayLocal() {
  const day = new Date();
  return `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
}
function TaskEditorContent() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [requestedId, setRequestedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState(todayLocal);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setAuthed(requireAuth()); }, []);
  useEffect(() => {
    if (!authed) return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { setLoading(false); return; }
    setRequestedId(id);
    setLoading(true);
    api.tasks.get(id).then((task: Task) => {
      setTaskId(task.id); setTitle(task.title); setDescription(task.description ?? ''); setCategory(task.category);
      setPriority(task.priority); setDate(task.due_date ?? ''); setTags(task.tags.map(tag => tag.name));
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Не удалось загрузить задачу.')).finally(() => setLoading(false));
  }, [authed]);
  function addTag() {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) setTags(prev => [...prev, value]);
    setTagInput('');
  }
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setTitleError('');
    const trimmed = title.trim();
    if (!trimmed) { setTitleError('Введите название задачи.'); titleRef.current?.focus(); return; }
    setSaving(true);
    const payload = { title: trimmed, description: description.trim() || null, category, priority, due_date: date || null, tags };
    try { if (taskId) await api.tasks.update(taskId, payload); else await api.tasks.create(payload); window.location.assign('/tasks'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Не удалось сохранить задачу.'); setSaving(false); }
  }
  async function remove() {
    if (!taskId || deleting) return;
    setDeleting(true); setError('');
    try { await api.tasks.remove(taskId); window.location.assign('/tasks'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Не удалось удалить задачу.'); setDeleting(false); }
  }
  return <div id="main-content" tabIndex={-1} className="app-main editor-page">
    <a href="/tasks" className="editor-back"><ArrowLeft size={17} aria-hidden="true"/> Все задачи</a>
    <div className="page-head"><div><span className="app-kicker">ЗАДАЧИ / РЕДАКТОР</span><h1 className="app-heading">{taskId ? 'Редактировать задачу' : 'Новая задача'}<span className="heading-period">.</span></h1><p className="app-subtitle">Сформулируйте следующий шаг, а детали добавьте по мере необходимости.</p></div></div>
    {error && <div role="alert" className="notice editor-notice">{error}</div>}
    {loading ? <div className="editor-loading panel" aria-label="Загрузка задачи"><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div> : requestedId && !taskId ? <div className="empty-state"><h2>Задача не открылась</h2><p>Проверьте соединение или вернитесь к списку задач.</p><a className="btn btn-secondary" href="/tasks">К списку задач</a></div> :
    <form onSubmit={submit} noValidate>
      <div className="editor-grid">
        <div className="editor-document panel">
          <div className="editor-document-top"><span>01 / СОДЕРЖАНИЕ</span><span>СОХРАНЯЕТСЯ ПО КНОПКЕ</span></div>
          <div className="field"><label htmlFor="task-title">Название задачи <span aria-hidden="true">*</span></label><input ref={titleRef} id="task-title" className="editor-title-input" value={title} onChange={e => { setTitle(e.target.value); setTitleError(''); }} maxLength={200} placeholder="Что нужно сделать?" required aria-invalid={!!titleError} aria-describedby={titleError ? 'task-title-error' : undefined}/>{titleError && <span id="task-title-error" className="field-error" role="alert">{titleError}</span>}</div>
          <div className="editor-divider"/>
          <div className="field"><label htmlFor="task-description">Описание</label><textarea id="task-description" value={description} onChange={e => setDescription(e.target.value)} rows={12} placeholder="Контекст, ссылки, шаги и идеи…" /></div>
        </div>
        <aside className="editor-aside">
          <div className="panel editor-properties"><span className="eyebrow">02 / ПАРАМЕТРЫ</span>
            <div className="field"><label htmlFor="task-category">Категория</label><select id="task-category" className="control" value={category} onChange={e => setCategory(e.target.value)}>{[...new Set([...categories, category])].map(c => <option key={c}>{c}</option>)}</select></div>
            <fieldset className="field editor-priority"><legend>Приоритет</legend><div>{priorities.map(p => <label key={p.value} className={`priority-choice priority-${p.value}`}><input type="radio" name="priority" value={p.value} checked={priority === p.value} onChange={() => setPriority(p.value)}/><span aria-hidden="true"/>{p.label}</label>)}</div></fieldset>
            <div className="field"><label htmlFor="task-date">Срок</label><div className="date-control"><CalendarDays size={17} aria-hidden="true"/><input id="task-date" type="date" value={date} onChange={e => setDate(e.target.value)}/></div></div>
          </div>
          <div className="panel editor-tags"><span className="eyebrow">03 / ТЕГИ</span><p>Добавьте слова, по которым задачу будет проще найти.</p><div className="editor-tag-list">{tags.map(tag => <span className="pill pill-violet" key={tag}>{tag}<button type="button" onClick={() => setTags(prev => prev.filter(t => t !== tag))} aria-label={`Удалить тег ${tag}`}><X size={13}/></button></span>)}</div><div className="editor-tag-entry"><label className="sr-only" htmlFor="tag-input">Новый тег</label><input id="tag-input" className="control" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Новый тег"/><button type="button" className="icon-btn" onClick={addTag} aria-label="Добавить тег"><Plus size={18}/></button></div></div>
        </aside>
      </div>
      <div className="editor-footer"><div>{taskId && <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)} disabled={deleting}><Trash2 size={16} aria-hidden="true"/>{deleting ? 'Удаление…' : 'Удалить'}</button>}</div><div><a href="/tasks" className="btn btn-quiet">Отмена</a><button type="submit" className="btn btn-primary" disabled={saving || deleting}><Check size={17} aria-hidden="true"/>{saving ? 'Сохранение…' : 'Сохранить задачу'}</button></div></div>
    </form>}
    <ConfirmDialog open={confirmDelete} title="Удалить задачу?" description={`«${title}» будет удалена без возможности восстановления.`} busy={deleting} error={error} onCancel={() => setConfirmDelete(false)} onConfirm={() => void remove()}/>
  </div>;
}

export default function TaskEditor() { return <MotionScope><TaskEditorContent/></MotionScope>; }
