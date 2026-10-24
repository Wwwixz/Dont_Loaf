import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, LayoutGrid, List, ListTodo, Plus, Search, Trash2 } from 'lucide-react';
import { api, formatDueDate, requireAuth, type Task } from '../lib/api';
import { ConfirmDialog, MotionScope, ProgressRing } from './MotionUI';
import { motionTokens, useMotionSettings } from '../lib/motion';

type Filter = 'all' | 'today' | 'week' | 'month';
type Sort = 'default' | 'priority' | 'title' | 'recent';
const filters: { label: string; value: Filter }[] = [{label:'Все',value:'all'},{label:'Сегодня',value:'today'},{label:'Неделя',value:'week'},{label:'Месяц',value:'month'}];
const priorityLabel = { low:'Низкий', medium:'Средний', high:'Высокий' };
const priorityOrder = {high:0,medium:1,low:2};
const PAGE_SIZE = 30;
function TaskWorkspace() {
  const [tasks,setTasks] = useState<Task[]>([]);
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState<Filter>('all');
  const [status,setStatus] = useState<'all'|'active'|'done'>('all');
  const [sort,setSort] = useState<Sort>('default');
  const [view,setView] = useState<'rows'|'cards'>('rows');
  const [page,setPage] = useState(0);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [busyId,setBusyId] = useState<string|null>(null);
  const [deleteTask,setDeleteTask] = useState<Task|null>(null);
  const [deleteError,setDeleteError] = useState('');
  const [announcement,setAnnouncement] = useState('');
  const requestId = useRef(0), busy = useRef(false);
  const { reduced, transition } = useMotionSettings();
  const load = useCallback(async () => {
    const request = ++requestId.current; setLoading(true);setError('');
    try { const result = await api.tasks.list({filter}); if(request === requestId.current) { setTasks(result);setPage(0); } }
    catch(err) { if(request === requestId.current) setError(err instanceof Error ? err.message : 'Не удалось загрузить задачи.'); }
    finally { if(request === requestId.current) setLoading(false); }
  },[filter]);
  useEffect(() => { if(requireAuth()) void load(); return () => {requestId.current++;}; },[load]);
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru');
    const result = tasks.filter(task => (status === 'all' || (status === 'done' ? task.done : !task.done)) && `${task.title} ${task.category} ${task.tags.map(tag=>tag.name).join(' ')}`.toLocaleLowerCase('ru').includes(needle));
    if(sort === 'priority') result.sort((a,b)=>priorityOrder[a.priority]-priorityOrder[b.priority]);
    if(sort === 'title') result.sort((a,b)=>a.title.localeCompare(b.title,'ru'));
    if(sort === 'recent') result.sort((a,b)=>b.created_at.localeCompare(a.created_at));
    return result;
  },[tasks,query,status,sort]);
  const complete = tasks.filter(task=>task.done).length;
  const pageCount = Math.max(1,Math.ceil(visible.length/PAGE_SIZE));
  const currentPage = Math.min(page,pageCount-1);
  const pageTasks = visible.slice(currentPage*PAGE_SIZE,(currentPage+1)*PAGE_SIZE);
  async function toggle(task: Task) {
    if(busy.current || loading) return;
    busy.current = true;setBusyId(task.id);setError('');
    setTasks(previous=>previous.map(t=>t.id===task.id?{...t,done:!t.done}:t));
    try { const updated = await api.tasks.toggle(task.id);setTasks(previous=>previous.map(t=>t.id===updated.id?updated:t));setAnnouncement(updated.done?'Задача завершена. Прогресс обновлён.':'Задача возвращена в работу.'); }
    catch(err){setTasks(previous=>previous.map(t=>t.id===task.id?task:t));setError(err instanceof Error?err.message:'Не удалось обновить задачу.');}
    finally{busy.current=false;setBusyId(null);}
  }
  async function remove() {
    if(!deleteTask || busy.current) return;
    busy.current=true;setBusyId(deleteTask.id);setDeleteError('');
    try{await api.tasks.remove(deleteTask.id);setTasks(previous=>previous.filter(task=>task.id!==deleteTask.id));setDeleteTask(null);setAnnouncement('Задача удалена.');}
    catch(err){setDeleteError(err instanceof Error?err.message:'Не удалось удалить задачу.');}
    finally{busy.current=false;setBusyId(null);}
  }
  return <div id="main-content" tabIndex={-1} className="app-main tasks-page">
    <div className="page-head"><div><span className="app-kicker">РАБОЧЕЕ ПРОСТРАНСТВО / 01</span><h1 className="app-heading">Ваши задачи<span className="heading-period">.</span></h1><p className="app-subtitle">Главное — в фокусе. Остальное — на своём месте.</p></div><a className="btn btn-primary" href="/editor"><Plus className="od-icon"/>Новая задача</a></div>
    <div className="tasks-overview workspace-overview" aria-busy={loading}>
      <div className="od-stat"><span className="tasks-overview-label">В ПРОЦЕССЕ</span><strong className="metric">{loading?'—':tasks.length-complete}</strong><span>задач ждут следующего шага</span></div>
      <div className="od-stat"><span className="tasks-overview-label">ГОТОВО</span><strong className="metric">{loading?'—':complete}</strong><span>задач выполнено</span></div>
      <div className="workspace-progress"><div className="od-field"><span className="tasks-overview-label">ВАШ ПРОГРЕСС</span><strong>{loading?'Обновляем данные…':tasks.length===0?'Начните с малого':complete===tasks.length?'Всё запланированное сделано':`${tasks.length-complete} задач впереди`}</strong><span className="muted">по выбранному периоду</span></div>{loading?<div className="skeleton progress-placeholder"/>:<ProgressRing value={tasks.length?complete/tasks.length*100:0} label="Выполнено задач"/>}</div>
    </div>
    <div className="tasks-toolbar"><div className="filter-rail od-rail" aria-label="Период задач">{filters.map(item=><button type="button" key={item.value} aria-pressed={filter===item.value} disabled={!!busyId} onClick={()=>setFilter(item.value)}>{item.label}</button>)}</div><label className="search-field"><Search className="od-icon"/><span className="sr-only">Поиск задач</span><input type="search" value={query} onChange={event=>{setQuery(event.target.value);setPage(0);}} placeholder="Название, категория или тег"/></label></div>
    <div className="workspace-tools"><div className="workspace-selects"><label className="workspace-select"><span>Статус</span><select value={status} onChange={event=>{setStatus(event.target.value as typeof status);setPage(0);}}><option value="all">Все задачи</option><option value="active">В работе</option><option value="done">Выполненные</option></select></label><label className="workspace-select"><span>Порядок</span><select value={sort} onChange={event=>{setSort(event.target.value as Sort);setPage(0);}}><option value="default">По сроку</option><option value="priority">По приоритету</option><option value="title">По названию</option><option value="recent">Сначала новые</option></select></label></div><div className="workspace-view od-cluster"><button className="icon-btn" type="button" aria-label="Список задач" aria-pressed={view==='rows'} onClick={()=>setView('rows')}><List className="od-icon"/></button><button className="icon-btn" type="button" aria-label="Карточки задач" aria-pressed={view==='cards'} onClick={()=>setView('cards')}><LayoutGrid className="od-icon"/></button></div></div>
    {error&&<div className="notice tasks-notice" role="alert">{error}<button type="button" onClick={()=>void load()}>Повторить</button></div>}
    <div className={`tasks-list panel workspace-${view}`} aria-busy={loading}>
      <div className="tasks-list-head"><span>ЗАДАЧА</span><span>КАТЕГОРИЯ</span><span>СРОК</span><span>ПРИОРИТЕТ</span><span className="sr-only">Действия</span></div>
      {loading?<div className="task-skeletons" role="status" aria-label="Загрузка задач">{[1,2,3,4].map(i=><div key={i}><span className="skeleton"/><span className="skeleton"/><span className="skeleton"/></div>)}</div>:
      visible.length?<ul><AnimatePresence initial={false} mode="popLayout">{pageTasks.map((task,index)=><m.li layout={reduced?false:'position'} initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:reduced?1:.98}} transition={{...transition,opacity:{duration:reduced?0:.18,delay:Math.min(index,5)*motionTokens.stagger}}} className={`task-row ${task.done?'is-done':''}`} key={task.id}>
        <div className="task-primary"><label className="task-checkbox"><input type="checkbox" checked={task.done} disabled={!!busyId} onChange={()=>void toggle(task)} aria-label={`${task.done?'Вернуть в работу':'Завершить'}: ${task.title}`}/><m.span animate={{scale:task.done&&!reduced?[1,1.15,1]:1}} aria-hidden="true"><Check className="od-icon"/></m.span></label><div className="task-title-block"><a href={`/editor?id=${task.id}`} className="task-title od-truncate">{task.title}</a>{task.description&&<span className="task-description od-truncate">{task.description}</span>}</div></div>
        <span className="task-category pill">{task.category}</span><span className="task-date"><CalendarDays className="od-icon"/>{formatDueDate(task.due_date)}</span><span className={`task-priority priority-${task.priority}`}><i aria-hidden="true"/>{priorityLabel[task.priority]}</span>
        <div className="task-actions"><a className="icon-btn" href={`/editor?id=${task.id}`} aria-label={`Открыть задачу: ${task.title}`}><ArrowUpRight className="od-icon"/></a><button className="icon-btn" type="button" disabled={!!busyId} onClick={()=>{setDeleteError('');setDeleteTask(task);}} aria-label={`Удалить задачу: ${task.title}`}><Trash2 className="od-icon"/></button></div>
      </m.li>)}</AnimatePresence></ul>:
      <div className="empty-state"><ListTodo className="od-icon"/><h2>{error?'Задачи не загрузились':query||status!=='all'?'Ничего не найдено':'Список пока пуст'}</h2><p>{error?'Проверьте соединение и повторите загрузку.':query||status!=='all'?'Измените запрос или сбросьте фильтры.':'Добавьте первую задачу и выберите следующий шаг.'}</p>{query||status!=='all'?<button className="btn btn-secondary" onClick={()=>{setQuery('');setStatus('all');}}>Сбросить фильтры</button>:error?<button className="btn btn-secondary" onClick={()=>void load()}>Повторить</button>:<a className="btn btn-primary" href="/editor">Создать задачу</a>}</div>}
    </div>
    <div className="workspace-list-footer"><p className="status-announcement" role="status" aria-live="polite">{announcement||(!loading?`Найдено задач: ${visible.length}`:'Загружаем ваше пространство…')}</p>{pageCount>1&&<nav className="list-pagination" aria-label="Страницы задач"><button className="icon-btn" disabled={currentPage===0} aria-label="Предыдущая страница" onClick={()=>setPage(currentPage-1)}><ChevronLeft className="od-icon"/></button><span>{currentPage+1} / {pageCount}</span><button className="icon-btn" disabled={currentPage+1===pageCount} aria-label="Следующая страница" onClick={()=>setPage(currentPage+1)}><ChevronRight className="od-icon"/></button></nav>}</div>
    <ConfirmDialog open={!!deleteTask} title="Удалить задачу?" description={`«${deleteTask?.title??''}» будет удалена. Восстановить её не получится.`} busy={!!busyId} error={deleteError} onCancel={()=>setDeleteTask(null)} onConfirm={()=>void remove()}/>
  </div>;
}
export default function TaskList(){return <MotionScope><TaskWorkspace/></MotionScope>;}
