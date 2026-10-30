import type { Macros } from "@recipeupgrader/shared";

const SUB_ROWS: { label: string; key: keyof Macros; unit: string; highlight?: boolean }[] = [
  { label: "Protein", key: "proteinG", unit: "g", highlight: true },
  { label: "Total Carbohydrate", key: "carbsG", unit: "g" },
  { label: "Total Fat", key: "fatG", unit: "g" },
];

/** A macro breakdown styled like a nutrition facts label, per serving. */
export function MacrosCard({ macros }: { macros: Macros }) {
  return (
    <div className="rounded-xl border-2 border-stone-900 bg-white p-4">
      <h3 className="text-xs font-extrabold uppercase tracking-wide text-stone-900">Nutrition Facts</h3>
      <p className="mb-2 text-xs text-stone-500">Per serving</p>

      <div className="flex items-baseline justify-between border-y-4 border-stone-900 py-1.5">
        <span className="text-lg font-bold text-stone-900">Calories</span>
        <span className="text-3xl font-extrabold text-stone-900">{Math.round(macros.caloriesKcal)}</span>
      </div>

      <dl>
        {SUB_ROWS.map(({ label, key, unit, highlight }) => (
          <div
            key={key}
            className="flex items-center justify-between border-b border-stone-200 py-1.5 text-sm last:border-b-0"
          >
            <dt className={highlight ? "font-bold text-emerald-700" : "font-medium text-stone-700"}>
              {label}
            </dt>
            <dd className={highlight ? "font-bold text-emerald-700" : "font-semibold text-stone-800"}>
              {Math.round(macros[key])}
              {unit}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
