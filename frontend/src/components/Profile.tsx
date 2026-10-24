import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Flame, Settings2, UserRound } from 'lucide-react';
import { api, requireAuth } from '../lib/api';
import type { Profile as ProfileData } from '../lib/api';

const MOTION_KEY = 'dontloaf_reduce_motion';
const DENSITY_KEY = 'dontloaf_compact_tasks';
export default function Profile() {
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    setAuthed(requireAuth());
    setReduceMotion(localStorage.getItem(MOTION_KEY) === 'true');
    setCompact(localStorage.getItem(DENSITY_KEY) === 'true');
  }, []);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setProfile(await api.profile.get()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Не удалось загрузить профиль.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (authed) void load(); }, [authed,load]);
  function setMotion(value: boolean) { setReduceMotion(value); localStorage.setItem(MOTION_KEY,String(value)); document.documentElement.dataset.motion = value ? 'reduced' : 'standard'; }
  function setDensity(value: boolean) { setCompact(value); localStorage.setItem(DENSITY_KEY,String(value)); document.documentElement.dataset.density = value ? 'compact' : 'standard'; }
  return <div id="main-content" tabIndex={-1} className="app-main profile-page">
    <div className="page-head"><div><span className="app-kicker">ВАШЕ ПРОСТРАНСТВО / 06</span><h1 className="app-heading">Профиль<span className="heading-period">.</span></h1><p className="app-subtitle">Ваша история движения и настройки рабочего пространства.</p></div></div>
    {error && <div className="notice" role="alert">{error} <button type="button" onClick={() => void load()}>Повторить</button></div>}
    {loading ? <div className="profile-loading" aria-label="Загрузка профиля"><div className="skeleton"/><div className="skeleton"/></div> : !profile ? <div className="empty-state"><UserRound size={30} color="var(--violet)" aria-hidden="true"/><h2>Профиль пока недоступен</h2><p>Попробуйте загрузить данные ещё раз.</p><button type="button" className="btn btn-secondary" onClick={() => void load()}>Повторить</button></div> : <>
      <section className="profile-hero panel"><div className="profile-avatar">{profile.user.username.charAt(0).toUpperCase()}</div><div className="profile-identity"><span className="eyebrow">УЧАСТНИК DONTLOAF</span><h2>{profile.user.username}</h2><p>{profile.user.email}</p><span>С нами с {new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(profile.user.created_at))}</span></div><div className="profile-level"><span>ТЕКУЩИЙ УРОВЕНЬ</span><strong className="metric">{profile.user.level}</strong><small>{profile.user.xp} очков опыта</small></div></section>
      <div className="profile-grid">
        <section className="panel profile-progress"><span className="eyebrow">ВАШ ПРОГРЕСС</span><h2>Каждый шаг важен.</h2><div className="profile-progress-value"><strong className="metric">{profile.stats.completion_rate}<small>%</small></strong><span>задач выполнено</span></div><div className="profile-progress-track"><span style={{width:`${profile.stats.completion_rate}%`}}/></div><div className="profile-progress-foot"><span>{profile.stats.completed_tasks} завершено</span><span>{profile.stats.total_tasks} всего</span></div></section>
        <section className="panel profile-activity"><span className="eyebrow">РИТМ НЕДЕЛИ</span><h2>Выполнено по дням</h2><div className="profile-bars" role="img" aria-label={`Задачи за последние 7 дней: ${profile.stats.weekly_completed.join(', ')}`}>{profile.stats.weekly_completed.map((value,i)=><div key={i}><span style={{height:`${Math.max(7,value / Math.max(...profile.stats.weekly_completed,1)*100)}%`}} className={value ? 'has-value' : ''}/><small>{new Intl.DateTimeFormat('ru-RU',{weekday:'short'}).format(new Date(Date.now() - (6-i)*86400000))}</small></div>)}</div></section>
      </div>
      <div className="profile-stat-strip"><div><CheckCircle2 size={20} aria-hidden="true"/><strong>{profile.stats.completed_tasks}</strong><span>выполнено</span></div><div><Flame size={20} aria-hidden="true"/><strong>{profile.stats.streak_days}</strong><span>дней серии</span></div><div><UserRound size={20} aria-hidden="true"/><strong>{profile.user.level}</strong><span>уровень</span></div></div>
    </>}
    <section className="profile-settings"><div className="profile-settings-head"><Settings2 size={20} color="var(--violet)" aria-hidden="true"/><div><h2 className="section-heading">Настройки интерфейса</h2><p>Эти предпочтения сохраняются только на этом устройстве.</p></div></div><div className="panel settings-list">
      <label className="setting-row"><span className="od-field"><strong>Уменьшить анимацию</strong><small>Минимум движения в интерфейсе и 3D-сцене.</small></span><input type="checkbox" checked={reduceMotion} onChange={e => setMotion(e.target.checked)}/><span className="setting-switch" aria-hidden="true"/></label>
      <label className="setting-row"><span className="od-field"><strong>Компактный список задач</strong><small>Больше задач на экране рабочего пространства.</small></span><input type="checkbox" checked={compact} onChange={e => setDensity(e.target.checked)}/><span className="setting-switch" aria-hidden="true"/></label>
    </div></section>
  </div>;
}
