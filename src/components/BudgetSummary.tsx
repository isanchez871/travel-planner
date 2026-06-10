import { Budget } from '@/lib/types';

interface BudgetSummaryProps {
  presupuesto: Budget;
}

const categoryColors: Record<string, string> = {
  Alojamiento: 'bg-amber-500',
  Combustible: 'bg-orange-500',
  Peajes: 'bg-blue-500',
  Comida: 'bg-green-500',
  Actividades: 'bg-purple-500',
  Varios: 'bg-slate-500',
  'Mantención moto': 'bg-red-500',
};

export function BudgetSummary({ presupuesto }: BudgetSummaryProps) {
  const totalGastado = presupuesto.categorias.reduce((sum, cat) => sum + (cat.real || 0), 0);
  const totalEstimado = presupuesto.categorias.reduce((sum, cat) => sum + cat.estimado, 0);
  const restante = totalEstimado - totalGastado;
  const percentage = totalEstimado > 0 ? (totalGastado / totalEstimado) * 100 : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Presupuesto
      </h3>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 dark:text-slate-400">Gastado</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {totalGastado.toLocaleString()}€ / {totalEstimado.toLocaleString()}€
          </span>
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {presupuesto.categorias.map((categoria) => (
          <div 
            key={categoria.nombre}
            className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${categoryColors[categoria.nombre] || 'bg-slate-400'}`} />
              <span className="text-sm text-slate-600 dark:text-slate-400">{categoria.nombre}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {categoria.real !== undefined ? categoria.real : categoria.estimado}€
              </span>
              {categoria.real !== undefined && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Est: {categoria.estimado}€
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Restante: 
          <span className={`ml-2 font-medium ${restante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {restante.toLocaleString()}€
          </span>
        </div>
        <div className="text-lg font-bold text-slate-900 dark:text-white">
          Total: {presupuesto.totalReal !== undefined ? presupuesto.totalReal : presupuesto.totalEstimado}€ {presupuesto.moneda}
        </div>
      </div>
    </div>
  );
}