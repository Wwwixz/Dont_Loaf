import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Logo from './Logo';

type Mode = 'register' | 'login';

interface AuthPanelProps {
  initialMode?: Mode;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#29A9EA" />
      <path
        fill="#fff"
        d="M17.94 7.24 15.9 17.3c-.15.68-.56.84-1.13.52l-3.12-2.3-1.5 1.45c-.17.17-.31.31-.63.31l.23-3.2 5.82-5.26c.25-.23-.06-.35-.39-.13l-7.2 4.53-3.1-.97c-.67-.21-.68-.67.14-.99l12.13-4.68c.56-.2 1.05.13.85 1.16Z"
      />
    </svg>
  );
}

export default function AuthPanel({ initialMode = 'register' }: AuthPanelProps) {
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border/60 bg-surface shadow-2xl shadow-black/40 md:grid-cols-2">
      <BrandSide />
      <FormSide mode={mode} onSwitch={setMode} />
    </div>
  );
}

function BrandSide() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-surface-2 to-bg p-10 md:flex">
      <div className="absolute inset-0 bg-gradient-glow" />
      <div className="relative">
        <Logo size="lg" />
        <p className="mt-8 max-w-[220px] text-2xl font-semibold leading-snug text-text">
          Начни свой путь к продуктивности
        </p>
      </div>
      <blockquote className="relative text-sm italic text-text-muted">
        «Маленькие шаги каждый день приводят к большим результатам»
      </blockquote>
    </div>
  );
}

interface FormSideProps {
  mode: Mode;
  onSwitch: (mode: Mode) => void;
}

function FormSide({ mode, onSwitch }: FormSideProps) {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Здесь будет вызов API аутентификации
  }

  return (
    <div className="p-8 sm:p-10">
      <div className="mb-6 flex gap-1 rounded-xl bg-surface-2 p-1">
        <TabButton active={mode === 'register'} onClick={() => onSwitch('register')}>
          Регистрация
        </TabButton>
        <TabButton active={mode === 'login'} onClick={() => onSwitch('login')}>
          Вход
        </TabButton>
      </div>

      <h2 className="text-lg font-semibold text-text">
        {mode === 'register' ? 'Создай аккаунт и начни выполнять задачи' : 'С возвращением!'}
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        {mode === 'register' ? 'Создай аккаунт и начни выполнять задачи' : 'Войди в свой аккаунт'}
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <Field label="Никнейм" type="text" placeholder="Придумайте ник" name="username" />
        )}

        <Field label="Email" type="email" placeholder="example@mail.com" name="email" />

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="password">
            Пароль
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'register' ? 'Придумайте пароль' : 'Пароль'}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/60 outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {mode === 'login' && (
          <div className="-mt-1 text-right">
            <a href="#" className="text-xs font-medium text-primary hover:underline">
              Забыли пароль?
            </a>
          </div>
        )}

        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-hover"
        >
          {mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
        </button>

        {mode === 'register' && (
          <p className="text-center text-xs text-text-muted">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              onClick={() => onSwitch('login')}
              className="font-medium text-primary hover:underline"
            >
              Войти
            </button>
          </p>
        )}
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-muted">или</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 py-2.5 text-sm font-medium text-text transition-colors hover:border-primary/50"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 py-2.5 text-sm font-medium text-text transition-colors hover:border-primary/50"
        >
          <TelegramIcon />
          Telegram
        </button>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
        active ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

interface FieldProps {
  label: string;
  type: string;
  placeholder: string;
  name: string;
}

function Field({ label, type, placeholder, name }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/60 outline-none focus:border-primary"
      />
    </div>
  );
}
