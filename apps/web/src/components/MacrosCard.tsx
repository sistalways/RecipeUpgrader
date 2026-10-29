import type { Macros } from "@recipeupgrader/shared";

export function MacrosCard({ title, macros }: { title: string; macros: Macros }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-slate-500">Calories</dt>
        <dd className="text-right font-medium">{Math.round(macros.caloriesKcal)} kcal</dd>
        <dt className="text-slate-500">Protein</dt>
        <dd className="text-right font-medium">{Math.round(macros.proteinG)} g</dd>
        <dt className="text-slate-500">Carbs</dt>
        <dd className="text-right font-medium">{Math.round(macros.carbsG)} g</dd>
        <dt className="text-slate-500">Fat</dt>
        <dd className="text-right font-medium">{Math.round(macros.fatG)} g</dd>
      </dl>
    </div>
  );
}
