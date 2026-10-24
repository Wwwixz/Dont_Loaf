import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ArrowUpRight, BarChart3, RefreshCw, TrendingUp } from 'lucide-react';
import { api, requireAuth, type AnalyticsSummary, type Profile } from '../lib/api';
import { MotionScope, ProgressRing } from './MotionUI';
import { useMotionSettings } from '../lib/motion';

function WeeklyChart({ days }: { days: AnalyticsSummary['daily_progress'] }) {
  const [selected,setSelected] = useState<number|null>(null);
  const { reduced } = useMotionSettings();
  const max = Math.max(...days.map(day=>day.completed),1);
  const coords = days.map((day,index)=>({x:48+index*504/Math.max(days.length-1,1),y:216-day.completed/max*164}));
  const path = coords.map((point,index)=>`${index?'L':'M'}${point.x} ${point.y}`).join(' ');
  const active = selected===null?null:days[selected];
  if(!days.length) return <div className="analytics-empty">Данных по дням пока нет.</div>;
  return <div className="weekly-chart animated-week-chart">
    <svg viewBox="0 0 600 252" width="600" height="252" role="img" aria-label={`Динамика выполнения: ${days.map(day=>`${day.day}: ${day.completed}`).join(', ')}`}>
      {[0,.5,1].map(level=><g key={level}><path d={`M48 ${216-level*164}H560`} stroke="var(--line)" strokeDasharray="3 5"/><text x="8" y={220-level*164} fill="var(--muted)" fontSize="11">{Number((max*level).toFixed(1))}</text></g>)}
      <m.path key={days.map(day=>day.completed).join('-')} d={path} fill="none" stroke="var(--violet)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{pathLength:reduced?1:0}} animate={{pathLength:1}} transition={{duration:reduced?0:.38}}/>
      {coords.map((point,index)=><g key={days[index].day}>{selected===index&&<path d={`M${point.x} 36V216`} stroke="var(--muted)" strokeDasharray="3 4"/>}<m.circle initial={false} animate={{cx:point.x,cy:point.y,r:selected===index?7:4}} fill={selected===index?'var(--text)':'var(--violet)'} stroke="var(--surface)" strokeWidth="2"/></g>)}
    </svg>
    <div className="chart-days" style={{gridTemplateColumns:`repeat(${days.length},minmax(0,1fr))`}}>{days.map((day,index)=><button key={day.day} type="button" className="od-cell" aria-pressed={selected===index} aria-label={`${new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(new Date(`${day.day}T00:00:00`))}: выполнено ${day.completed}`} onClick={()=>setSelected(selected===index?null:index)}><span>{new Intl.DateTimeFormat('ru-RU',{weekday:'short'}).format(new Date(`${day.day}T00:00:00`))}</span><strong>{day.completed}</strong></button>)}</div>
    <div className="chart-description" aria-live="polite">{active?`${new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(new Date(`${active.day}T00:00:00`))} · Завершено задач: ${active.completed}`:'Выберите день, чтобы увидеть результат.'}</div>
  </div>;
}
function AnalyticsContent(){
  const [summary,setSummary] = useState<AnalyticsSummary|null>(null);
  const [profile,setProfile] = useState<Profile|null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const request = useRef(0);
  const { reduced } = useMotionSettings();
  const load = useCallback(async()=>{
    const id = ++request.current;setLoading(true);setError('');
    const [summaryResult,profileResult] = await Promise.allSettled([api.analytics.summary(),api.profile.get()]);
    if(id!==request.current) return;
    if(summaryResult.status==='fulfilled') setSummary(summaryResult.value);
    else setError(summaryResult.reason instanceof Error?summaryResult.reason.message:'Не удалось загрузить аналитику.');
    if(profileResult.status==='fulfilled') setProfile(profileResult.value);
    setLoading(false);
  },[]);
  useEffect(()=>{if(requireAuth()) void load();return()=>{request.current++;};},[load]);
  const weeklyTotal = summary?.daily_progress.reduce((sum,day)=>sum+day.completed,0)??0;
  return <div id="main-content" tabIndex={-1} className="app-main analytics-page">
    <div className="page-head"><div><span className="app-kicker">КАРТИНА ПРОГРЕССА / 05</span><h1 className="app-heading">Аналитика<span className="heading-period">.</span></h1><p className="app-subtitle">Замечайте свой ритм. Опирайтесь на сделанное.</p></div><button className="btn btn-secondary" disabled={loading} onClick={()=>void load()}><RefreshCw className="od-icon"/>{loading?'Обновление…':'Обновить'}</button></div>
    {error&&<div className="notice" role="alert">{error}<button onClick={()=>void load()}>Повторить</button></div>}
    {loading&&!summary?<div className="analytics-loading" role="status" aria-label="Загрузка аналитики"><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div>:!summary?<div className="empty-state"><BarChart3 className="od-icon"/><h2>Данные пока недоступны</h2><p>Повторите загрузку, когда соединение восстановится.</p><button className="btn btn-secondary" onClick={()=>void load()}>Повторить</button></div>:<div aria-busy={loading}>
      <div className="analytics-summary refined-kpis">{[{label:'ВСЕГО ЗАДАЧ',value:summary.total_tasks,helper:'за всё время'},{label:'ВЫПОЛНЕНО',value:summary.completed_tasks,helper:'за всё время'},{label:'ЗА НЕДЕЛЮ',value:weeklyTotal,helper:'за последние 7 дней'}].map((metric,index)=><m.div className="od-stat" key={metric.label} initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} transition={{delay:reduced?0:index*.04}}><span>{metric.label}</span><AnimatePresence mode="wait" initial={false}><m.strong key={metric.value} className="metric" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{metric.value}</m.strong></AnimatePresence><small>{metric.helper}</small></m.div>)}</div>
      <div className="analytics-grid refined-analytics-grid">
        <section className="panel analytics-week"><div className="analytics-panel-head"><div><span className="eyebrow">РИТМ / 7 ДНЕЙ</span><h2>Динамика недели</h2></div><TrendingUp className="od-icon"/></div><p>Завершённые задачи по дням.</p><WeeklyChart days={summary.daily_progress}/></section>
        <section className="panel completion-panel"><span className="eyebrow">ОТ ЗАМЫСЛА К РЕЗУЛЬТАТУ</span><h2>Общий прогресс</h2><ProgressRing value={summary.completion_rate} label="Доля завершённых задач"/><p><strong>{summary.completed_tasks}</strong> из <strong>{summary.total_tasks}</strong> задач выполнено</p><span className="muted">{summary.total_tasks===0?'Создайте задачу, чтобы начать.':summary.completed_tasks===summary.total_tasks?'Всё запланированное завершено.':'Каждая завершённая задача — шаг вперёд.'}</span><a href="/tasks" className="text-link">К задачам <ArrowUpRight className="od-icon"/></a></section>
        <section className="panel analytics-categories refined-categories"><div className="analytics-panel-head"><div><span className="eyebrow">НАПРАВЛЕНИЯ</span><h2>По категориям</h2></div><BarChart3 className="od-icon"/></div><p>Распределение всех ваших задач.</p>{summary.categories.length?<ul>{summary.categories.map((category,index)=><li key={category.category}><div><strong>{category.category}</strong><span className="od-nowrap">{category.count} · {category.percent}%</span></div><div className="category-track" role="progressbar" aria-label={category.category} aria-valuenow={category.percent} aria-valuemin={0} aria-valuemax={100}><m.span initial={{scaleX:reduced?category.percent/100:0}} animate={{scaleX:category.percent/100}} transition={{duration:reduced?0:.38,delay:reduced?0:index*.04}} style={{width:'100%',transformOrigin:'left',background:index%2?'var(--blue)':'var(--violet)'}}/></div></li>)}</ul>:<div className="analytics-empty">Добавьте задачи, чтобы увидеть распределение.</div>}</section>
        {profile&&<section className="panel rhythm-panel"><span className="eyebrow">ПОСЛЕДОВАТЕЛЬНОСТЬ</span><h2>Личный ритм</h2><div className="rhythm-metric od-stat"><strong className="metric od-nowrap">{profile.stats.streak_days}</strong><span>дней текущей серии</span></div><p>Продолжайте двигаться в своём темпе.</p><a className="text-link" href="/profile">Открыть профиль <ArrowUpRight className="od-icon"/></a></section>}
      </div>
    </div>}
  </div>;
}
export default function Analytics(){return <MotionScope><AnalyticsContent/></MotionScope>;}
