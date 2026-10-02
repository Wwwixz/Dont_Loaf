import { TreePine, BookOpen, BarChart3, User, LogOut } from 'lucide-react';
import Logo from './Logo';
import { clearAuth } from '../lib/api';

export type SidebarPage = 'tree' | 'obsidian' | 'analytics' | 'profile' | 'tasks';

const navItems: { key: SidebarPage; label: string; icon: typeof TreePine; href: string }[] = [
  { key: 'tree', label: 'Дерево задач', icon: TreePine, href: '/tree' },
  { key: 'obsidian', label: 'Obsidian', icon: BookOpen, href: '/obsidian' },
  { key: 'analytics', label: 'Аналитика', icon: BarChart3, href: '/analytics' },
  { key: 'profile', label: 'Профиль', icon: User, href: '/profile' },
];

interface SidebarProps {
  active: SidebarPage;
}

export default function Sidebar({ active }: SidebarProps) {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between bg-sidebar px-4 py-6">
      <div>
        <div className="px-2">
          <Logo invert />
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map(({ key, label, icon: Icon, href }) => {
            const isActive = key === active;
            return (
              <a
                key={key}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/20 font-medium text-primary'
                    : 'text-invert-muted hover:bg-sidebar-hover hover:text-invert'
                }`}
              >
                <Icon size={17} />
                {label}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-1 border-t border-sidebar-border pt-4">
        <button
          type="button"
          onClick={() => {
            clearAuth();
            window.location.assign('/');
          }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-invert-muted transition-colors hover:bg-sidebar-hover hover:text-invert"
        >
          <LogOut size={17} />
          Выход
        </button>
      </div>
    </aside>
  );
}
