import Categories from "./categories";

export function Filters() {
  return (
    <aside className="w-full md:w-64 space-y-6">
      <div className="space-y-4">
        <Categories />
      </div>
    </aside>
  );
};