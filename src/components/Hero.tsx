import { ArrowRight, Network, LineChart, Trophy } from 'lucide-react';

const features = [
  {
    icon: Network,
    title: 'Дерево задач',
    description: 'Визуализируй свой прогресс в виде дерева',
  },
  {
    icon: LineChart,
    title: 'Статистика',
    description: 'Следи за своей продуктивностью и результатами',
  },
  {
    icon: Trophy,
    title: 'Геймификация',
    description: 'Зарабатывай достижения и не давай себе расслабиться',
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-glow">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Планируй.
            <br />
            Выполняй.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Развивайся.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base text-text-muted">
            DontLoaf — это твой личный помощник в мире задач. Организуй свои дела,
            отслеживай прогресс и достигай целей. Без прокрастинации.
          </p>

          <a
            href="/auth?mode=register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover"
          >
            Начать бесплатно
            <ArrowRight size={18} />
          </a>

          <div id="features" className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
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

        <div className="relative hidden md:block">
          <div className="aspect-square w-full rounded-3xl border border-border/60 bg-surface/60 shadow-2xl shadow-black/40">
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-transparent p-10 text-center text-text-muted">
              <p className="text-sm">
                Иллюстрация: путник у дерева под луной — символ спокойного, вдумчивого прогресса.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
