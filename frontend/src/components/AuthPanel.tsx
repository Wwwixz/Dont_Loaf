import { useEffect, useState } from 'react';
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
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#29A9EA" />
      <path fill="#fff" d="M17.94 7.24 15.9 17.3c-.15.68-.56.84-1.13.52l-3.12-2.3-1.5 1.45c-.17.17-.31.31-.63.31l.23-3.2 5.82-5.26c.25-.23-.06-.35-.39-.13l-7.2 4.53-3.1-.97c-.67-.21-.68-.67.14-.99l12.13-4.68c.56-.2 1.05.13.85 1.16Z" />
    </svg>
  );
}

export default function AuthPanel({ initialMode = 'register' }: AuthPanelProps) {
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mode') === 'login') {
      setMode('login');
    }
  }, []);

  return (
    <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl md:grid-cols-2">
      <BrandSide />
      <FormSide mode={mode} onSwitch={setMode} />
    </div>
  );
}

function BrandSide() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 md:flex">
      <div>
        <Logo size="lg" invert />
        <p className="mt-10 max-w-[220px] text-2xl font-semibold leading-snug text-invert">
          Маленькие шаги приводят к большим результатам
        </p>
      </div>
      <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-sidebar-hover/60">
        <div className="flex h-full items-center justify-center text-xs text-invert-muted">
          Иллюстрация: горы на рассвете
        </div>
      </div>
    </div>
  );
}

interface FormSideProps {
  mode: Mode;
  onSwitch: (mode: Mode) => void;
}

function FormSide({ mode, onSwitch }: FormSideProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const isRegistering = mode === 'register';
    const payload = isRegistering
      ? {
          username: String(formData.get('username') ?? '').trim(),
          email,
          password,
        }
      : { email, password };

    try {
      const response = await fetch(`/api/auth/${isRegistering ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = response.headers.get('content-type') ?? '';

      if (!contentType.includes('application/json')) {
        throw new Error(
          response.ok
            ? 'Сервер вернул неожиданный ответ. Проверьте настройки API.'
            : `Сервер API вернул ошибку ${response.status}.`,
        );
      }

      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(getApiErrorMessage(result, response.status));
      }
      if (
        typeof result !== 'object' ||
        result === null ||
        !('access_token' in result) ||
        typeof result.access_token !== 'string' ||
        !('user' in result)
      ) {
        throw new Error('Сервер вернул неполные данные авторизации.');
      }

      localStorage.removeItem('dontloaf_token');
      sessionStorage.removeItem('dontloaf_token');
      const storage = formData.get('remember') === 'on' ? localStorage : sessionStorage;
      storage.setItem('dontloaf_token', result.access_token);
      storage.setItem('dontloaf_user', JSON.stringify(result.user));
      window.location.assign('/tasks');
    } catch (error) {
      setErrorMessage(
        error instanceof TypeError
          ? 'Не удалось связаться с сервером. Проверьте, настроен ли API и подключена ли база данных.'
          : error instanceof Error
            ? error.message
            : 'Не удалось выполнить вход. Попробуйте ещё раз.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-8 sm:p-10">
      <div className="mb-8 flex gap-6 border-b border-border">
        <TabButton active={mode === 'login'} onClick={() => onSwitch('login')}>
          Вход
        </TabButton>
        <TabButton active={mode === 'register'} onClick={() => onSwitch('register')}>
          Регистрация
        </TabButton>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <Field label="Никнейм" type="text" placeholder="Придумайте ник" name="username" required />
        )}

        <Field
          label="Email"
          type="email"
          placeholder="name@example.com"
          name="email"
          required
        />

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor="password">
            Пароль
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'register' ? 'Придумайте пароль' : 'Введите пароль'}
              required
              minLength={mode === 'register' ? 6 : undefined}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
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
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-text-muted">
              <input name="remember" type="checkbox" className="h-3.5 w-3.5 rounded border-border accent-primary" />
              Запомнить меня
            </label>
            <a href="#" className="font-medium text-primary hover:underline">
              Забыли пароль?
            </a>
          </div>
        )}

        {errorMessage && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-lg bg-sidebar py-2.5 text-sm font-semibold text-invert shadow-md transition-colors hover:bg-sidebar-hover"
        >
          {isSubmitting ? 'Подождите…' : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
        </button>

        <p className="text-center text-xs text-text-muted">
          {mode === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
          <button
            type="button"
            onClick={() => onSwitch(mode === 'register' ? 'login' : 'register')}
            className="font-medium text-primary hover:underline"
          >
            {mode === 'register' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-muted">или продолжить через</span>
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
      className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
        active ? 'border-primary text-text' : 'border-transparent text-text-muted hover:text-text'
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
  required?: boolean;
}

function Field({ label, type, placeholder, name, required = false }: FieldProps) {
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
        required={required}
        autoComplete={name === 'email' ? 'email' : 'username'}
        className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/60 outline-none focus:border-primary"
      />
    </div>
  );
}

function getApiErrorMessage(result: unknown, status: number): string {
  if (typeof result === 'object' && result !== null && 'detail' in result) {
    const detail = result.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      const messages = detail
        .filter(
          (item): item is { msg: string } =>
            typeof item === 'object' &&
            item !== null &&
            'msg' in item &&
            typeof item.msg === 'string',
        )
        .map((item) => item.msg);
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }
  }

  return `Не удалось выполнить запрос (ошибка ${status}).`;
}
