import { useMotionPreference } from '../lib/motion';
import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Layers3, LineChart, ListTodo, MoveUpRight } from 'lucide-react';
import Logo from './Logo';
const HeroStructure = lazy(() => import('./HeroStructure'));

type DemoTask = { id: number; title: string; category: string; done: boolean };
const initialDemo: DemoTask[] = [
  { id: 1, title: 'Определить главный результат недели', category: 'Планирование', done: true },
  { id: 2, title: 'Подготовить структуру проекта', category: 'Работа', done: false },
  { id: 3, title: 'Записать идеи для следующего этапа', category: 'Заметки', done: false },
  { id: 4, title: 'Подвести итоги дня', category: 'Личное', done: false },
];

function ProductPreview({ tasks, setTasks }: { tasks: DemoTask[]; setTasks: React.Dispatch<React.SetStateAction<DemoTask[]>> }) {
  const [view, setView] = useState<'tasks' | 'progress'>('tasks');
  const done = tasks.filter(t => t.done).length;
  return <div className="preview-frame">
    <div className="preview-topbar"><span className="preview-topbar-label"><span className="preview-live-dot"/> ДЕМОНСТРАЦИЯ ИНТЕРФЕЙСА</span><span>DontLoaf / Рабочее пространство</span></div>
    <div className="preview-body">
      <aside className="preview-sidebar" aria-hidden="true">
        <Logo size="sm" />
        <span className="preview-nav-active"><ListTodo size={15}/> Задачи</span>
        <span><Layers3 size={15}/> Дерево</span>
        <span><LineChart size={15}/> Аналитика</span>
      </aside>
      <div className="preview-content">
        <div className="preview-header"><div><span className="eyebrow">ВАШЕ ПРОСТРАНСТВО</span><h3>{view === 'tasks' ? 'Сегодня в фокусе' : 'Ритм работы'}</h3></div><span className="preview-count">{done} из {tasks.length} выполнено</span></div>
        <div className="preview-tabs" role="tablist" aria-label="Раздел демонстрации">
          <button type="button" role="tab" aria-selected={view === 'tasks'} onClick={() => setView('tasks')}>Задачи</button>
          <button type="button" role="tab" aria-selected={view === 'progress'} onClick={() => setView('progress')}>Прогресс</button>
        </div>
        {view === 'tasks' ? <div className="preview-list">
          {tasks.map(task => <label className={`preview-task ${task.done ? 'is-done' : ''}`} key={task.id}>
            <input type="checkbox" checked={task.done} onChange={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}/>
            <span className="preview-check" aria-hidden="true">{task.done && <Check size={13}/>}</span>
            <span className="preview-task-title">{task.title}</span>
            <span className="preview-category">{task.category}</span>
          </label>)}
        </div> : <div className="preview-progress">
          <span className="eyebrow">НА ОСНОВЕ ДЕМОНСТРАЦИОННЫХ ЗАДАЧ</span>
          <div className="preview-progress-number">{Math.round(done / tasks.length * 100)}<small>%</small></div>
          <p>Выполнено задач в этом примере</p>
          <div className="preview-progress-track"><span style={{ width: `${done / tasks.length * 100}%` }}/></div>
          <span className="preview-progress-foot">Отметьте задачи на соседней вкладке — показатель изменится.</span>
        </div>}
      </div>
    </div>
  </div>;
}

export default function Hero() {
  const [tasks, setTasks] = useState(initialDemo);
  const reduced = useMotionPreference();
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (reduced) { nodes.forEach(n => n.classList.add('is-visible')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); } }), { threshold: .12 });
    nodes.forEach(n => io.observe(n));
    return () => io.disconnect();
  }, [reduced]);
  const done = tasks.filter(t => t.done).length;
  return <>
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="hero-index"><span className="hero-index-line"/> НОВЫЙ ПОДХОД К ВАШЕМУ ДНЮ</span>
          <h1 id="hero-title">Меньше шума.<br/><em>Больше смысла.</em></h1>
          <p>DontLoaf собирает задачи, заметки и прогресс в одном спокойном пространстве. Держите главное в поле зрения и двигайтесь вперёд в своём темпе.</p>
          <div className="hero-actions"><a href="/auth?mode=register" className="btn btn-primary">Начать бесплатно <ArrowUpRight size={17} aria-hidden="true"/></a><a href="#workspace" className="btn btn-secondary">Посмотреть интерфейс <ArrowRight size={17} aria-hidden="true"/></a></div>
          <div className="hero-note"><span className="hero-note-line"/> Планируйте. Действуйте. Видьте результат.</div>
        </div>
        <Suspense fallback={<div className="hero-structure structure-fallback" role="img" aria-label="Геометрическая структура"><div className="structure-backdrop"/></div>}><HeroStructure /></Suspense>
      </div>
      <div className="hero-bottom"><span>01 / БОЛЬШЕ ЧЕМ ПРОДУКТИВНОСТЬ</span><a href="#features">Листайте вниз <span aria-hidden="true">↓</span></a></div>
    </section>

    <section id="features" className="landing-section feature-section">
      <div className="section-intro" data-reveal><span className="eyebrow">ПРОДУКТИВНОСТЬ БЕЗ ПЕРЕГРУЗКИ</span><h2>Инструменты, которые<br/>держат вас <em>в потоке.</em></h2><p>Вместо бесконечных списков — ясная структура дня, пространство для мыслей и честная картина прогресса.</p></div>
      <div className="feature-grid">
        <article className="feature-large" data-reveal><span className="feature-number">01 / 04</span><div className="feature-symbol feature-symbol-tasks" aria-hidden="true"><span/><span/><span/></div><div><h3>Задачи без лишнего</h3><p>Приоритеты, сроки, категории и теги помогают быстро выбрать следующий шаг.</p></div><ArrowUpRight size={20} aria-hidden="true"/></article>
        <article className="feature-small" data-reveal><span className="feature-number">02 / 04</span><div className="feature-symbol feature-symbol-tree" aria-hidden="true"><span/><span/><span/></div><div><h3>Прогресс в связях</h3><p>Дерево показывает, как дела складываются в общую картину дня.</p></div><ArrowUpRight size={20} aria-hidden="true"/></article>
        <article className="feature-small" data-reveal><span className="feature-number">03 / 04</span><div className="feature-symbol feature-symbol-notes" aria-hidden="true"><span/><span/><span/></div><div><h3>Место для идей</h3><p>Заметки всегда рядом с рабочим процессом.</p></div><ArrowUpRight size={20} aria-hidden="true"/></article>
        <article className="feature-large feature-blue" data-reveal><span className="feature-number">04 / 04</span><div className="feature-symbol feature-symbol-chart" aria-hidden="true"><span/><span/><span/></div><div><h3>Результат без догадок</h3><p>Видьте выполненные задачи, динамику недели и распределение по направлениям.</p></div><ArrowUpRight size={20} aria-hidden="true"/></article>
      </div>
    </section>

    <section id="workspace" className="landing-section workspace-section">
      <div className="workspace-head" data-reveal><div><span className="eyebrow">ВНУТРИ DONTLOAF</span><h2>Порядок, который<br/><em>ощущается легко.</em></h2></div><p>Попробуйте отметить задачу или переключить вкладку. Это интерактивный пример интерфейса, ваши данные здесь не используются.</p></div>
      <div data-reveal><ProductPreview tasks={tasks} setTasks={setTasks}/></div>
      <div className="workspace-caption"><span>01 / РАБОЧЕЕ ПРОСТРАНСТВО</span><span>Интерактивная демонстрация</span></div>
    </section>

    <section className="landing-section tree-section">
      <div className="showcase-grid">
        <div className="tree-visual" data-reveal aria-hidden="true"><div className="tree-visual-grid"/><div className="tree-path tree-path-one"/><div className="tree-path tree-path-two"/><div className="tree-path tree-path-three"/><span className="tree-node tree-node-main">ФОКУС</span><span className="tree-node tree-node-a">ПЛАН</span><span className="tree-node tree-node-b">ДЕЙСТВИЕ</span><span className="tree-node tree-node-c">РЕЗУЛЬТАТ</span><span className="tree-visual-index">02 / СВЯЗИ</span></div>
        <div className="showcase-copy" data-reveal><span className="eyebrow">ДЕРЕВО ЗАДАЧ</span><h2>Видеть не только<br/>список. <em>Видеть путь.</em></h2><p>Когда задачи становятся частью целого, проще сохранять направление. Смотрите на дела дня и отмечайте выполненное прямо в визуальном пространстве.</p><a className="text-link" href="/tree">Открыть дерево <MoveUpRight size={17} aria-hidden="true"/></a></div>
      </div>
    </section>

    <section id="analytics" className="landing-section analytics-section">
      <div className="showcase-grid showcase-grid-reverse">
        <div className="showcase-copy" data-reveal><span className="eyebrow">АНАЛИТИКА</span><h2>Маленькие шаги.<br/><em>Ясный прогресс.</em></h2><p>Следите за выполнением задач и ритмом недели без перегруженных панелей. Цифры в приложении берутся из ваших реальных данных.</p><a className="text-link" href="/analytics">Посмотреть аналитику <MoveUpRight size={17} aria-hidden="true"/></a></div>
        <div className="analytics-visual" data-reveal aria-label={`В демонстрации выполнено ${done} из ${tasks.length} задач`}>
          <div className="analytics-visual-top"><span>ПРОГРЕСС ДЕМОНСТРАЦИИ</span><span><LineChart size={17}/></span></div>
          <div className="analytics-visual-main"><div className="analytics-visual-value">{done}<span>/{tasks.length}</span></div><p>задач выполнено</p></div>
          <div className="analytics-visual-bars" aria-hidden="true">{tasks.map((t,i)=><span key={t.id} className={t.done ? 'is-done' : ''} style={{ height: `${38+i*14}%` }}/>)}</div>
          <div className="analytics-visual-foot"><span>Демонстрационные данные</span><span>{Math.round(done/tasks.length*100)}%</span></div>
        </div>
      </div>
    </section>

    <section className="final-cta" data-reveal><div className="final-cta-inner"><span className="eyebrow">ВАШ СЛЕДУЮЩИЙ ШАГ</span><h2>Дайте важному<br/><em>больше пространства.</em></h2><p>Начните с одной задачи. Остальное сложится в систему.</p><a href="/auth?mode=register" className="btn btn-primary">Создать пространство <ArrowUpRight size={17} aria-hidden="true"/></a><div className="final-cta-deco" aria-hidden="true"><span/><span/><span/></div></div></section>
    <footer className="site-footer"><div className="site-footer-main"><a href="/" className="brand-link" aria-label="DontLoaf — на главную"><Logo/></a><p>Пространство для дел, идей и движения вперёд.</p><nav aria-label="Навигация в подвале"><a href="#features">Возможности</a><a href="#workspace">Интерфейс</a><a href="/auth?mode=login">Войти</a></nav></div><div className="site-footer-bottom"><span>© {new Date().getFullYear()} DontLoaf</span><span>БОЛЬШЕ ЧЕМ ПРОДУКТИВНОСТЬ</span></div></footer>
  </>;
}
