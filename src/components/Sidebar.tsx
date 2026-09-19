import { CheckSquare, Calendar, CalendarDays, Flame, CheckCircle2, Settings, LogOut } from 'lucide-react';
import Logo from './Logo';

const navItems = [
  { label: 'Все задачи', icon: CheckSquare, active: true },
  { label: 'Сегодня', icon: Calendar, active: false },
  { label: 'Неделя', icon: CalendarDays, active: false },
  { label: 'Высокий приоритет', icon: Flame, active: false },
  { label: 'Завершённые', icon: CheckCircle2, active: false },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-border/60 bg-surface px-4 py-6">
      <div>
        <div className="px-2">
          <Logo />
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map(({ label, icon: Icon, active }) => (
            <a
              key={label}
              href="#"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-primary/15 font-medium text-primary'
                  : 'text-text-muted hover:bg-surface-2 hover:text-text'
              }`}
            >
              <Icon size={17} />
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-1 border-t border-border/60 pt-4">
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          <Settings size={17} />
          Настройки
        </a>
        <a
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          <LogOut size={17} />
          Выход
        </a>
      </div>
    </aside>
  );
}
