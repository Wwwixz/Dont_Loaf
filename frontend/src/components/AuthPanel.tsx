import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import Logo from './Logo';
import { MotionScope } from './MotionUI';
import { useMotionSettings } from '../lib/motion';
import { api, getToken, saveAuth } from '../lib/api';

type Mode = 'register'|'login';
type Field = 'username'|'email'|'password';
function AuthForm({ initialMode='register' }: { initialMode?:Mode }){
  const [mode,setMode] = useState<Mode>(initialMode);
  const [values,setValues] = useState({username:'',email:'',password:''});
  const [errors,setErrors] = useState<Partial<Record<Field,string>>>({});
  const [showPassword,setShowPassword] = useState(false);
  const [remember,setRemember] = useState(false);
  const [submitting,setSubmitting] = useState(false);
  const [error,setError] = useState('');
  const busy = useRef(false);
  const { reduced } = useMotionSettings();
  useEffect(()=>{if(getToken()){window.location.replace('/tasks');return;}setMode(new URLSearchParams(window.location.search).get('mode')==='login'?'login':'register');},[]);
  function switchMode(next:Mode){if(busy.current)return;setMode(next);setError('');setErrors({});window.history.replaceState(null,'',`/auth?mode=${next}`);}
  function fieldError(field:Field){
    const value = values[field];
    if(field==='username'&&mode==='register'&&value.trim().length<2) return 'Введите имя длиной от 2 до 50 символов.';
    if(field==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Введите почту в формате name@example.com.';
    if(field==='password'&&!value) return 'Введите пароль.';
    if(field==='password'&&mode==='register'&&value.length<6) return 'Используйте минимум 6 символов.';
    return undefined;
  }
  function blur(field:Field){setErrors(previous=>({...previous,[field]:fieldError(field)}));}
  async function submit(event:SyntheticEvent<HTMLFormElement>){
    event.preventDefault();if(busy.current)return;
    const fields:Field[]=mode==='register'?['username','email','password']:['email','password'];
    const next = Object.fromEntries(fields.map(field=>[field,fieldError(field)]));setErrors(next);setError('');
    const first=fields.find(field=>next[field]);if(first){document.getElementById(first)?.focus();return;}
    busy.current=true;setSubmitting(true);
    try{
      const payload={email:values.email.trim(),password:values.password};
      const result=mode==='register'?await api.register({...payload,username:values.username.trim()}):await api.login(payload);
      saveAuth(result.access_token,result.user,remember);window.location.assign('/tasks');
    }catch(err){setError(err instanceof Error?err.message:'Не удалось выполнить запрос. Попробуйте ещё раз.');}
    finally{busy.current=false;setSubmitting(false);}
  }
  return <div id="main-content" tabIndex={-1} className="auth-layout">
    <a className="auth-back" href="/"><ArrowLeft className="od-icon"/>На главную</a>
    <div className="auth-brand-panel"><div><a href="/" className="brand-link"><Logo size="lg"/></a><span className="auth-brand-kicker">БОЛЬШЕ ЧЕМ ПРОДУКТИВНОСТЬ</span></div><div className="auth-brand-message"><span className="eyebrow">ПРОСТРАНСТВО ДЛЯ ВАЖНОГО</span><h1>Соберите мысли.<br/>Найдите <em>свой ритм.</em></h1><p>Задачи, идеи и прогресс — в одной ясной системе.</p></div><div className="auth-depth" data-mode={mode} aria-hidden="true"><div className="auth-depth-model"><i/><i/><i/></div></div><span className="auth-brand-foot">ПЛАНИРУЙТЕ / ДЕЙСТВУЙТЕ / РАСТИТЕ</span></div>
    <div className="auth-form-panel"><div className="auth-form-inner"><span className="eyebrow">ВАШ СЛЕДУЮЩИЙ ШАГ</span>
      <AnimatePresence mode="wait" initial={false}><m.div key={mode} className="auth-heading-block" initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}><h2>{mode==='register'?'Начните с чистого листа.':'С возвращением.'}</h2><p className="auth-form-subtitle">{mode==='register'?'Создайте пространство, в котором удобно двигаться вперёд.':'Ваши задачи и идеи ждут вас. Продолжим?'}</p></m.div></AnimatePresence>
      <div className="auth-tabs" role="tablist" aria-label="Вход или регистрация" onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const next=mode==='login'?'register':'login';switchMode(next);document.getElementById(`tab-${next}`)?.focus();}}}><button id="tab-login" type="button" role="tab" tabIndex={mode==='login'?0:-1} aria-controls="auth-form-panel" aria-selected={mode==='login'} disabled={submitting} onClick={()=>switchMode('login')}>Вход</button><button id="tab-register" type="button" role="tab" tabIndex={mode==='register'?0:-1} aria-controls="auth-form-panel" aria-selected={mode==='register'} disabled={submitting} onClick={()=>switchMode('register')}>Регистрация</button></div>
      <div id="auth-form-panel" role="tabpanel" aria-labelledby={`tab-${mode}`}><form onSubmit={submit} className="auth-form" noValidate aria-busy={submitting}>
        {Object.values(errors).filter(Boolean).length>1&&<div className="notice" role="alert">Проверьте поля:{Object.entries(errors).filter(([,message])=>message).map(([field,message])=><a className="auth-error-link" key={field} href={`#${field}`} onClick={event=>{event.preventDefault();document.getElementById(field)?.focus();}}>{message}</a>)}</div>}
        <AnimatePresence initial={false}>{mode==='register'&&<m.div key="username" className="field" initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}><label htmlFor="username">Как к вам обращаться *</label><input id="username" name="username" className="control" value={values.username} onChange={event=>setValues(previous=>({...previous,username:event.target.value}))} onBlur={()=>blur('username')} autoComplete="username" maxLength={50} required disabled={submitting} aria-invalid={!!errors.username} aria-describedby={errors.username?'username-error':undefined} placeholder="Ваше имя"/>{errors.username&&<span id="username-error" className="auth-field-error">{errors.username}</span>}</m.div>}</AnimatePresence>
        <div className="field"><label htmlFor="email">Электронная почта *</label><input className="control" id="email" name="email" type="email" value={values.email} onChange={event=>setValues(previous=>({...previous,email:event.target.value}))} onBlur={()=>blur('email')} autoComplete="email" placeholder="name@example.com" required disabled={submitting} aria-invalid={!!errors.email} aria-describedby={errors.email?'email-error':undefined}/>{errors.email&&<span id="email-error" className="auth-field-error">{errors.email}</span>}</div>
        <div className="field"><label htmlFor="password">Пароль *</label><div className="password-field"><input className="control" id="password" name="password" type={showPassword?'text':'password'} value={values.password} onChange={event=>setValues(previous=>({...previous,password:event.target.value}))} onBlur={()=>blur('password')} maxLength={128} autoComplete={mode==='register'?'new-password':'current-password'} placeholder={mode==='register'?'Минимум 6 символов':'Введите пароль'} required disabled={submitting} aria-invalid={!!errors.password} aria-describedby={errors.password?'password-error':undefined}/><button type="button" className="password-toggle" aria-pressed={showPassword} onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Скрыть пароль':'Показать пароль'}>{showPassword?<EyeOff className="od-icon"/>:<Eye className="od-icon"/>}</button></div>{errors.password&&<span id="password-error" className="auth-field-error">{errors.password}</span>}</div>
        <label className="auth-remember"><input type="checkbox" checked={remember} onChange={event=>setRemember(event.target.checked)} disabled={submitting}/><span>Запомнить меня на этом устройстве</span></label>
        <AnimatePresence>{error&&<m.div key="error" role="alert" className="notice" initial={{opacity:0,y:reduced?0:4}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{error}</m.div>}</AnimatePresence>
        <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>{submitting?'Подождите…':mode==='register'?'Создать аккаунт':'Войти'}<ArrowRight className="od-icon"/></button>
        <span className="sr-only" role="status">{submitting?'Проверяем данные…':''}</span>
      </form></div>
      <p className="auth-switch">{mode==='register'?'Уже есть аккаунт?':'Нет аккаунта?'} <button type="button" disabled={submitting} onClick={()=>switchMode(mode==='register'?'login':'register')}>{mode==='register'?'Войти':'Зарегистрироваться'}</button></p>
    </div><div className="auth-security"><LockKeyhole className="od-icon"/>Ваши задачи доступны только после входа.</div></div>
  </div>;
}
export default function AuthPanel(props:{initialMode?:Mode}){return <MotionScope><AuthForm {...props}/></MotionScope>;}
