import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { getToken } from '../lib/api';

const links = [
  { label: 'Главная', href: '/' },
  { label: 'Возможности', href: '#features' },
  { label: 'О нас', href: '#about' },
  { label: 'Контакты', href: '#contacts' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getToken()));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authed ? (
            <a
              href="/tasks"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Открыть приложение
            </a>
          ) : (
            <>
              <a
                href="/auth?mode=login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
              >
                Войти
              </a>
              <a
                href="/auth?mode=register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
              >
                Регистрация
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          className="text-text md:hidden"
          aria-label="Открыть меню"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-text-muted hover:text-text">
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-border pt-4">
              {authed ? (
                <a
                  href="/tasks"
                  className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-hover"
                >
                  Открыть приложение
                </a>
              ) : (
                <>
                  <a href="/auth?mode=login" className="text-sm font-medium text-text-muted hover:text-text">
                    Войти
                  </a>
                  <a
                    href="/auth?mode=register"
                    className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-hover"
                  >
                    Регистрация
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
