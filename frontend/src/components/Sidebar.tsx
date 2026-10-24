import { m } from 'motion/react';
import { MotionScope } from './MotionUI';
import { Plus, BarChart3, BookOpen, GitBranch, ListTodo, LogOut, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { clearAuth, getStoredUser } from '../lib/api';
import type { User } from '../lib/api';

export type SidebarPage = 'tree' | 'obsidian' | 'analytics' | 'profile' | 'tasks';
const items: { key: SidebarPage; label: string; icon: typeof ListTodo; href: string }[] = [
  { key: 'tasks', label: 'Задачи', icon: ListTodo, href: '/tasks' },
  { key: 'tree', label: 'Дерево задач', icon: GitBranch, href: '/tree' },
  { key: 'obsidian', label: 'Заметки', icon: BookOpen, href: '/obsidian' },
  { key: 'analytics', label: 'Аналитика', icon: BarChart3, href: '/analytics' },
  { key: 'profile', label: 'Профиль', icon: UserRound, href: '/profile' },
];
function SidebarContent({ active }: { active: SidebarPage }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { setUser(getStoredUser()); }, []);
  const logout = () => { clearAuth(); window.location.assign('/'); };
  return <>
    <aside className="app-sidebar">
      <div>
        <a href="/" className="sidebar-brand" aria-label="DontLoaf — на главную"><Logo/></a>
        <a href="/editor" className="sidebar-create"><Plus className="od-icon"/><span>Создать задачу</span></a>
        <div className="sidebar-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="sidebar-nav" aria-label="Разделы приложения">
          {items.map(({ key, label, icon: Icon, href }) => <a key={key} href={href} aria-current={active === key ? 'page' : undefined} title={label}>
            <Icon className="od-icon" size={19} strokeWidth={1.8} aria-hidden="true"/><span>{label}</span>{active === key && <m.i className="sidebar-active-mark" layoutId="sidebar-active" aria-hidden="true"/>}
          </a>)}
        </nav>
      </div>
      <div className="sidebar-bottom">
        {user && <a href="/profile" className="sidebar-user"><span className="sidebar-avatar">{user.username.slice(0,1).toUpperCase()}</span><span className="sidebar-user-text"><strong className="od-truncate">{user.username}</strong><small className="od-truncate">{user.email}</small></span></a>}
        <button type="button" onClick={logout} className="sidebar-logout"><LogOut className="od-icon" size={18} aria-hidden="true"/><span>Выйти</span></button>
      </div>
    </aside>
    <nav className="mobile-nav" aria-label="Разделы приложения">
      {items.map(({ key, label, icon: Icon, href }) => <a key={key} href={href} aria-current={active === key ? 'page' : undefined}><Icon className="od-icon" size={20} strokeWidth={1.8} aria-hidden="true"/><span>{label}</span></a>)}
    </nav>
  </>;
}

export default function Sidebar(props: { active: SidebarPage }) { return <MotionScope><SidebarContent {...props}/></MotionScope>; }
