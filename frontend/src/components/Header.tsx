import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { getToken } from '../lib/api';

const links = [
  { label: 'Возможности', href: '#features' },
  { label: 'Как это работает', href: '#workspace' },
  { label: 'Аналитика', href: '#analytics' },
];
export default function Header() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(Boolean(getToken())); }, []);
  return <header className="site-header">
    <div className="site-header-inner">
      <a href="/" className="brand-link" aria-label="DontLoaf — на главную"><Logo /></a>
      <nav className="site-nav" aria-label="Основная навигация">
        {links.map(link => <a href={link.href} key={link.href}>{link.label}</a>)}
      </nav>
      <div className="site-actions">
        {!authed && <a className="site-login" href="/auth?mode=login">Войти</a>}
        <a className="btn btn-primary" href={authed ? '/tasks' : '/auth?mode=register'}>
          {authed ? 'В рабочее пространство' : 'Начать бесплатно'}<ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <button className="icon-btn site-menu-toggle" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} aria-controls="site-mobile-nav" onClick={() => setOpen(!open)} type="button">
        {open ? <X size={20} aria-hidden="true"/> : <Menu size={20} aria-hidden="true"/>}
      </button>
    </div>
    {open && <nav id="site-mobile-nav" className="site-mobile-nav" aria-label="Мобильная навигация">
      {links.map(link => <a href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
      {!authed && <a href="/auth?mode=login">Войти</a>}
      <a className="btn btn-primary" href={authed ? '/tasks' : '/auth?mode=register'}>{authed ? 'В рабочее пространство' : 'Начать бесплатно'}</a>
    </nav>}
  </header>;
}
