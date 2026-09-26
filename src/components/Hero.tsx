import { ArrowRight, ListTodo, LineChart, Trophy, Smartphone } from 'lucide-react';

const features = [
  { icon: ListTodo, title: 'Личные задачи', description: 'Разбивай большие задачи по частям для более лёгкого выполнения' },
  { icon: LineChart, title: 'Аналитика', description: 'Следи за прогрессом и вовремя корректируй цели' },
  { icon: Trophy, title: 'Мотивация', description: 'Награды и достижения удерживают тебя в потоке' },
  { icon: Smartphone, title: 'Доступ с любого устройства', description: 'Синхронизация между телефоном и компьютером' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-glow">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text sm:text-5xl">
              Планируй.
              <br />
              Выполняй.
              <br />
              <span className="text-primary">Достигай.</span>
            </h1>

            <p className="mt-6 max-w-md text-base text-text-muted">
              DontLoaf — это твой личный помощник в мире задач. Организуй свой день,
              отслеживай прогресс и достигай целей.
            </p>

            <a
              href="/auth?mode=register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-hover"
            >
              Начать бесплатно
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="relative hidden overflow-hidden rounded-3xl border border-border bg-surface shadow-xl md:block">
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-primary/10 via-surface to-surface p-10 text-center text-text-muted">
              <p className="text-sm">
                Иллюстрация: путник любуется горами на рассвете — метафора спокойного,
                уверенного движения к цели.
              </p>
            </div>
          </div>
        </div>

        <div id="features" className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon size={18} />
              </span>
              <h3 className="text-sm font-semibold text-text">{title}</h3>
              <p className="text-xs leading-relaxed text-text-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
