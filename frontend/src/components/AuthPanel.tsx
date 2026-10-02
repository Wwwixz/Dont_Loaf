import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Logo from './Logo';
import { api, getToken, saveAuth } from '../lib/api';

type Mode = 'register' | 'login';

interface AuthPanelProps {
  initialMode?: Mode;
}

export default function AuthPanel({ initialMode = 'register' }: AuthPanelProps) {
  const [mode, setMode] = useState<Mode>(initialMode);

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

  useEffect(() => {
    // Уже вошёл — сразу в приложение.
    if (getToken()) {
      window.location.replace('/tasks');
      return;
    }
    if (new URLSearchParams(window.location.search).get('mode') === 'login') {
      onSwitch('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const isRegistering = mode === 'register';
    const remember = formData.get('remember') === 'on';

    try {
      const result = isRegistering
        ? await api.register({
            username: String(formData.get('username') ?? '').trim(),
            email,
            password,
          })
        : await api.login({ email, password });

      saveAuth(result.access_token, result.user as User, remember);
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
