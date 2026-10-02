// Клиент API DontLoaf. Все запросы идут на /api/* — Vercel проксирует их в бэкенд,
// а локально dev-сервер Astro должен проксировать /api на http://localhost:8000.

const TOKEN_KEY = 'dontloaf_token';
const USER_KEY = 'dontloaf_user';

export interface User {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  streak_days: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: Priority;
  due_date: string | null;
  done: boolean;
  created_at: string;
  completed_at: string | null;
  tags: Tag[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percent: number;
}

export interface DailyProgress {
  day: string;
  completed: number;
}

export interface AnalyticsSummary {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  categories: CategoryBreakdown[];
  daily_progress: DailyProgress[];
}

export interface ProfileStats {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  streak_days: number;
  weekly_completed: number[];
}

export interface Profile {
  user: User;
  stats: ProfileStats;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveAuth(token: string, user: User, remember: boolean): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
}

// Защита страниц приложения: без токена — на форму входа.
// Вызывать только на клиенте (например, внутри useEffect) — на сервере вернёт false.
export function requireAuth(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  if (getToken()) {
    return true;
  }
  window.location.replace('/auth?mode=login');
  return false;
}

function extractDetail(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null && 'detail' in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) =>
          typeof item === 'object' && item !== null && 'msg' in item && typeof (item as { msg: unknown }).msg === 'string'
            ? (item as { msg: string }).msg
            : null,
        )
        .filter((m): m is string => m !== null);
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }
  }
  return fallback;
}

async function parseError(response: Response): Promise<ApiError> {
  const fallback = `Не удалось выполнить запрос (ошибка ${response.status}).`;
  try {
    const payload: unknown = await response.json();
    return new ApiError(extractDetail(payload, fallback), response.status);
  } catch {
    return new ApiError(fallback, response.status);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    throw new ApiError('Не удалось связаться с сервером. Проверьте подключение.', 0);
  }

  // Истёкший токен — сбрасываем сессию и просим войти заново.
  if (response.status === 401) {
    clearAuth();
    window.location.replace('/auth?mode=login');
    throw new ApiError('Сессия истекла, войдите заново.', 401);
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

// ---------- Эндпоинты ----------

export interface TaskFilters {
  filter?: 'all' | 'today' | 'week' | 'month';
  search?: string;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }
  const text = query.toString();
  return text ? `?${text}` : '';
}

export const api = {
  register: (payload: { username: string; email: string; password: string }) =>
    apiFetch<{ access_token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiFetch<{ access_token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  tasks: {
    list: (filters: TaskFilters = {}) =>
      apiFetch<Task[]>(`/api/tasks${buildQuery({ filter: filters.filter, search: filters.search })}`),

    get: (id: string) => apiFetch<Task>(`/api/tasks/${id}`),

    create: (payload: {
      title: string;
      description?: string | null;
      category?: string;
      priority?: Priority;
      due_date?: string | null;
      tags?: string[];
    }) =>
      apiFetch<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    update: (
      id: string,
      payload: Partial<{
        title: string;
        description: string | null;
        category: string;
        priority: Priority;
        due_date: string | null;
        done: boolean;
        tags: string[];
      }>,
    ) =>
      apiFetch<Task>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    toggle: (id: string) =>
      apiFetch<Task>(`/api/tasks/${id}/toggle`, { method: 'PATCH' }),

    remove: (id: string) => apiFetch<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
  },

  analytics: {
    summary: () => apiFetch<AnalyticsSummary>('/api/analytics/summary'),
  },

  profile: {
    get: () => apiFetch<Profile>('/api/profile'),
  },

  notes: {
    list: () => apiFetch<Note[]>('/api/notes'),
    create: (payload: { title: string; content?: string }) =>
      apiFetch<Note>('/api/notes', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: { title?: string; content?: string }) =>
      apiFetch<Note>(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id: string) => apiFetch<void>(`/api/notes/${id}`, { method: 'DELETE' }),
  },
};

// ---------- Отображение данных ----------

export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) {
    return '—';
  }
  const value = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(value, today)) {
    return 'Сегодня';
  }
  if (sameDay(value, tomorrow)) {
    return 'Завтра';
  }
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(value);
}

// Цвет бейджа категории/тега — детерминированно по тексту.
const badgePalette = [
  'bg-blue-100 text-blue-600',
  'bg-violet-100 text-violet-600',
  'bg-rose-100 text-rose-600',
  'bg-amber-100 text-amber-700',
  'bg-teal-100 text-teal-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
];

export function badgeColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return badgePalette[hash % badgePalette.length];
}
