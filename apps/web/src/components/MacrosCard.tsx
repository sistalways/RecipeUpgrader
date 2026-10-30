import { Fragment } from "react";
import type { Macros } from "@recipeupgrader/shared";

const ROWS: { label: string; key: keyof Macros; unit: string }[] = [
  { label: "Calories", key: "caloriesKcal", unit: "kcal" },
  { label: "Protein", key: "proteinG", unit: "g" },
  { label: "Carbs", key: "carbsG", unit: "g" },
  { label: "Fat", key: "fatG", unit: "g" },
];

export function MacrosCard({ title, macros }: { title: string; macros: Macros }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-stone-500">{title}</h3>
      <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
        {ROWS.map(({ label, key, unit }) => (
          <Fragment key={key}>
            <dt className="text-stone-500">{label}</dt>
            <dd className="text-right font-semibold text-stone-800">
              {Math.round(macros[key])} {unit}
            </dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}
