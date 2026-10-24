import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, GitBranch, List, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { api, formatDueDate, requireAuth, type Task } from '../lib/api';
import { MotionScope, ProgressRing } from './MotionUI';
import { useMotionSettings } from '../lib/motion';

type GraphNode = { id: string; x: number; y: number; label: string; sub: string; kind: 'root' | 'category' | 'task'; task?: Task; expanded?: boolean };
const PAGE_SIZE = 12;
const priorityLabels = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
function TaskTreeContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'today'>('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [size, setSize] = useState({ width: 800, height: 560 });
  const [camera, setCamera] = useState({ x: 20, y: 20, zoom: .8 });
  const viewport = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const gesture = useRef<{ x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
  const busy = useRef(false);
  const { reduced, transition } = useMotionSettings();
  const load = useCallback(async () => {
    const request = ++requestId.current;
    setLoading(true); setError('');
    try { const list = await api.tasks.list({ filter }); if (request !== requestId.current) return; setTasks(list); setSelectedId(previous => list.some(t => t.id === previous) ? previous : list[0]?.id ?? null); setPage(0); }
    catch (err) { if (request === requestId.current) setError(err instanceof Error ? err.message : 'Не удалось загрузить задачи.'); }
    finally { if (request === requestId.current) setLoading(false); }
  }, [filter]);
  useEffect(() => { if (requireAuth()) void load(); return () => { requestId.current++; }; }, [load]);
  useEffect(() => { if (window.matchMedia('(max-width:767px)').matches) setView('list'); }, []);
  const pageCount = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const pageTasks = tasks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const graph = useMemo(() => {
    const categories = [...new Set(pageTasks.map(task => task.category))];
    const nodes: GraphNode[] = [];
    const links: { id: string; from: GraphNode; to: GraphNode }[] = [];
    let cursor = 24;
    const root: GraphNode = { id: 'root', x: 24, y: 0, label: filter === 'today' ? 'Сегодня' : 'Все задачи', sub: `${tasks.filter(t => t.done).length} из ${tasks.length} выполнено`, kind: 'root' };
    for (const category of categories) {
      const children = pageTasks.filter(task => task.category === category);
      const expanded = !collapsed.has(category);
      const height = expanded ? Math.max(100, children.length * 100) : 100;
      const parent: GraphNode = { id: `category:${category}`, x: 290, y: cursor + (height - 76) / 2, label: category, sub: `${children.length} на странице · ${expanded ? 'Свернуть −' : 'Раскрыть +'}`, kind: 'category', expanded };
      nodes.push(parent); links.push({ id: parent.id, from: root, to: parent });
      if (expanded) children.forEach((task, index) => {
        const child: GraphNode = { id: task.id, x: 564, y: cursor + index * 100, label: task.title, sub: task.done ? 'Выполнено' : formatDueDate(task.due_date) === '—' ? 'Без срока' : formatDueDate(task.due_date), kind: 'task', task };
        nodes.push(child); links.push({ id: task.id, from: parent, to: child });
      });
      cursor += height + 32;
    }
    root.y = Math.max(24, (cursor - 108) / 2);
    return { nodes: [root, ...nodes], links, width: 810, height: Math.max(240, cursor) };
  }, [tasks, page, collapsed, filter]);
  const fit = useCallback(() => {
    const zoom = Math.min(1, (size.width - 32) / graph.width, (size.height - 32) / graph.height);
    setCamera({ x: (size.width - graph.width * zoom) / 2, y: (size.height - graph.height * zoom) / 2, zoom });
  }, [size, graph.width, graph.height]);
  useEffect(() => { fit(); }, [fit, view]);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element); return () => observer.disconnect();
  }, [loading, view, tasks.length]);
  function zoom(factor: number, point = { x: size.width / 2, y: size.height / 2 }) {
    setCamera(previous => {
      const next = Math.max(.15, Math.min(2.5, previous.zoom * factor));
      return { zoom: next, x: point.x - (point.x - previous.x) * next / previous.zoom, y: point.y - (point.y - previous.y) * next / previous.zoom };
    });
  }
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      // Keep ordinary page scrolling available; Ctrl/⌘ + wheel intentionally zooms the map.
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault(); const rect = element.getBoundingClientRect();
      zoom(Math.exp(-event.deltaY * .004), { x: event.clientX - rect.left, y: event.clientY - rect.top });
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [loading, view, tasks.length]);
  async function toggle(task: Task) {
    if (busy.current) return;
    busy.current = true; setBusyId(task.id); setError('');
    setTasks(previous => previous.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
    try { const updated = await api.tasks.toggle(task.id); setTasks(previous => previous.map(t => t.id === updated.id ? updated : t)); }
    catch (err) { setTasks(previous => previous.map(t => t.id === task.id ? task : t)); setError(err instanceof Error ? err.message : 'Не удалось обновить задачу.'); }
    finally { busy.current = false; setBusyId(null); }
  }
  function select(node: GraphNode) {
    if (gesture.current?.moved) return;
    if (node.kind === 'category') setCollapsed(previous => { const next = new Set(previous); if (next.has(node.label)) next.delete(node.label); else next.add(node.label); return next; });
    else if (node.task) setSelectedId(node.task.id);
  }
  function nodeKey(event: KeyboardEvent<SVGGElement>, node: GraphNode) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(node); }
    if (node.kind === 'category' && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault(); setCollapsed(previous => { const next = new Set(previous); if (event.key === 'ArrowLeft') next.add(node.label); else next.delete(node.label); return next; });
    }
  }
  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as Element).closest('[data-node]') || event.button !== 0) return;
    gesture.current = { x: event.clientX, y: event.clientY, cx: camera.x, cy: camera.y, moved: false }; event.currentTarget.setPointerCapture(event.pointerId);
  }
  const selected = tasks.find(task => task.id === selectedId);
  const done = tasks.filter(task => task.done).length;
  return <div id="main-content" tabIndex={-1} className="app-main tree-page">
    <div className="page-head"><div><span className="app-kicker">ВИЗУАЛЬНЫЙ ПРОГРЕСС / 02</span><h1 className="app-heading">Дерево задач<span className="heading-period">.</span></h1><p className="app-subtitle">От общей картины — к следующему шагу. Раскройте направление и выберите задачу.</p></div><a className="btn btn-primary" href="/editor"><Plus className="od-icon"/> Новая задача</a></div>
    <div className="tree-workbar od-cluster"><div className="filter-rail od-cluster" aria-label="Период"><button type="button" aria-pressed={filter === 'today'} onClick={() => setFilter('today')}>Сегодня</button><button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Все задачи</button></div><div className="tree-view-switch od-cluster" aria-label="Представление"><button className="btn btn-secondary" aria-pressed={view === 'map'} onClick={() => setView('map')}><GitBranch className="od-icon"/>Карта</button><button className="btn btn-secondary" aria-pressed={view === 'list'} onClick={() => setView('list')}><List className="od-icon"/>Список</button></div></div>
    {error && <div className="notice tree-error" role="alert">{error}<button type="button" onClick={() => void load()}>Повторить</button></div>}
    {loading ? <div className="tree-loading panel" role="status" aria-label="Загрузка дерева задач"><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div> : tasks.length === 0 ? <div className="empty-state"><GitBranch className="od-icon"/><h2>{error ? 'Дерево пока недоступно' : 'Начните с первой ветви'}</h2><p>{error ? 'Повторите загрузку, когда соединение восстановится.' : 'В этом периоде задач нет. Создайте задачу или выберите другой период.'}</p><a className="btn btn-primary" href="/editor">Создать задачу</a></div> : <>
      <div className="tree-layout tree-layout-interactive">
        <section className="tree-canvas-panel panel" aria-label="Дерево по категориям">
          <div className="tree-canvas-head"><div className="od-field"><span className="eyebrow">ВАША СИСТЕМА</span><span className="muted">{done} из {tasks.length} выполнено</span></div><ProgressRing value={done / tasks.length * 100} label="Прогресс задач" size="small"/></div>
          {view === 'map' ? <>
            <div ref={viewport} className="tree-viewport" tabIndex={0} aria-label="Карта задач. Перемещение стрелками, масштаб клавишами плюс и минус, сброс клавишей 0" onPointerDown={pointerDown} onPointerMove={event => {
              if (!gesture.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
              const dx = event.clientX - gesture.current.x, dy = event.clientY - gesture.current.y;
              gesture.current.moved ||= Math.abs(dx) + Math.abs(dy) > 4;
              setCamera(previous => ({ ...previous, x: gesture.current!.cx + dx, y: gesture.current!.cy + dy }));
            }} onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); gesture.current = null; }} onPointerCancel={() => { gesture.current = null; }} onKeyDown={event => {
              if (event.target !== event.currentTarget) return;
              const movements: Record<string, [number,number]> = { ArrowLeft: [40,0], ArrowRight: [-40,0], ArrowUp: [0,40], ArrowDown: [0,-40] };
              if (movements[event.key]) { event.preventDefault(); const [x,y] = movements[event.key]; setCamera(previous => ({...previous,x:previous.x+x,y:previous.y+y})); }
              else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.2); }
              else if (event.key === '-') { event.preventDefault(); zoom(1/1.2); }
              else if (event.key === '0') { event.preventDefault(); fit(); }
            }}>
              <svg className="task-graph" viewBox={`0 0 ${size.width} ${size.height}`} width={size.width} height={size.height} aria-label="Категории и задачи">
                <g transform={`translate(${camera.x},${camera.y}) scale(${camera.zoom})`}>
                  <AnimatePresence initial={false}>{graph.links.map(link => { const sx = link.from.x + 216, sy = link.from.y + 38, tx = link.to.x, ty = link.to.y + 38; return <m.path key={link.id} d={`M${sx} ${sy} C${sx+40} ${sy},${tx-40} ${ty},${tx} ${ty}`} fill="none" stroke={link.to.task?.done ? '#689e92' : 'var(--blue)'} strokeWidth="1.5" initial={{ opacity:0 }} animate={{ opacity:.65 }} exit={{ opacity:0 }} transition={transition}/>; })}</AnimatePresence>
                  <AnimatePresence initial={false}>{graph.nodes.map(node => <m.g key={node.id} data-node={node.id} className={`graph-node graph-node-${node.kind} ${node.task?.done ? 'is-done' : ''}`} initial={{ opacity:0 }} animate={{ x:node.x, y:node.y, opacity:1 }} exit={{ opacity:0 }} transition={transition} role={node.kind === 'root' ? 'img' : 'button'} tabIndex={node.kind === 'root' ? undefined : 0} aria-label={`${node.label}. ${node.sub}`} aria-expanded={node.kind === 'category' ? node.expanded : undefined} aria-pressed={node.task ? node.task.id === selectedId : undefined} onClick={() => select(node)} onKeyDown={event => nodeKey(event,node)} onFocus={() => {
                    if (node.kind !== 'root') setCamera(previous => ({ ...previous, x: size.width / 2 - (node.x + 108) * previous.zoom, y: size.height / 2 - (node.y + 38) * previous.zoom }));
                  }}>
                    <title>{node.label}</title><rect className="graph-node-shadow" x="0" y="5" width="216" height="76" rx="10"/><rect className="graph-node-face" width="216" height="76" rx="10"/>
                    <text x="16" y="30" className="graph-label">{node.label.length > 23 ? `${node.label.slice(0,22)}…` : node.label}</text><text x="16" y="55" className="graph-sub">{node.sub}</text>
                    {node.task?.done && <circle cx="198" cy="14" r="3" fill="#a8e9d3"/>}
                  </m.g>)}</AnimatePresence>
                </g>
              </svg>
            </div>
            <div className="tree-map-controls"><span className="tree-map-hint">Перетащите карту · Ctrl + прокрутка</span><div className="od-cluster"><button type="button" className="icon-btn" aria-label="Уменьшить масштаб" onClick={() => zoom(1/1.2)}><Minus className="od-icon"/></button><output aria-label="Масштаб">{Math.round(camera.zoom * 100)}%</output><button type="button" className="icon-btn" aria-label="Увеличить масштаб" onClick={() => zoom(1.2)}><Plus className="od-icon"/></button><button type="button" className="icon-btn" aria-label="Вместить дерево" onClick={fit}><Maximize2 className="od-icon"/></button></div></div>
          </> : <div className="tree-list-view">{[...new Set(pageTasks.map(task => task.category))].map(category => <section key={category}><button className="tree-category-toggle" aria-expanded={!collapsed.has(category)} onClick={() => setCollapsed(previous => { const next = new Set(previous); if(next.has(category)) next.delete(category); else next.add(category); return next; })}><span>{category}</span><span>{collapsed.has(category) ? '+' : '−'}</span></button><AnimatePresence initial={false}>{!collapsed.has(category) && <m.ul initial={{opacity:0,y:reduced?0:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{pageTasks.filter(task => task.category === category).map(task => <li key={task.id}><button className="tree-list-select" aria-pressed={selectedId === task.id} onClick={() => setSelectedId(task.id)}><span className="od-field"><strong>{task.title}</strong><small>{task.done ? 'Выполнено' : 'В работе'} · {formatDueDate(task.due_date)}</small></span><ArrowUpRight className="od-icon"/></button></li>)}</m.ul>}</AnimatePresence></section>)}</div>}
          <div className="tree-canvas-foot"><span>Связи объединяют задачи по категориям.</span><button onClick={() => setCollapsed(new Set())}>Раскрыть всё</button></div>
        </section>
        <aside className="tree-details panel" aria-label="Выбранная задача"><span className="eyebrow">В ФОКУСЕ</span><AnimatePresence mode="wait" initial={false}>{selected && <m.div key={selected.id} className="tree-selected-detail" initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}><h2>{selected.title}</h2><p>{selected.description || 'Описание не добавлено.'}</p><dl className="tree-detail-fields"><div><dt>Категория</dt><dd>{selected.category}</dd></div><div><dt>Приоритет</dt><dd>{priorityLabels[selected.priority]}</dd></div><div><dt>Срок</dt><dd>{formatDueDate(selected.due_date)}</dd></div><div><dt>Статус</dt><dd>{selected.done ? 'Выполнено' : 'В работе'}</dd></div></dl><button className={`btn ${selected.done ? 'btn-secondary' : 'btn-primary'}`} disabled={!!busyId} onClick={() => void toggle(selected)}>{selected.done ? <RotateCcw className="od-icon"/> : <Check className="od-icon"/>}{busyId === selected.id ? 'Сохранение…' : selected.done ? 'Вернуть в работу' : 'Завершить'}</button><a className="text-link" href={`/editor?id=${selected.id}`}>Открыть задачу <ArrowUpRight className="od-icon"/></a></m.div>}</AnimatePresence></aside>
      </div>
      <nav className="list-pagination" aria-label="Страницы дерева"><span>{page*PAGE_SIZE+1}–{Math.min((page+1)*PAGE_SIZE,tasks.length)} из {tasks.length} задач</span><div className="od-cluster"><button className="icon-btn" disabled={page === 0} aria-label="Предыдущая страница" onClick={() => setPage(p => p-1)}><ChevronLeft className="od-icon"/></button><span>{page+1} / {pageCount}</span><button className="icon-btn" disabled={page+1 >= pageCount} aria-label="Следующая страница" onClick={() => setPage(p => p+1)}><ChevronRight className="od-icon"/></button></div></nav>
    </>}
  </div>;
}
export default function TaskTree() { return <MotionScope><TaskTreeContent/></MotionScope>; }
