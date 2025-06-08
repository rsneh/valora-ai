import Categories from "./categories";
import Locations from "./locations";

export function Filters() {
  return (
    <aside className="w-full md:w-64 space-y-6">
      <div className="ms-auto md:hidden">
        <Locations />
      </div>
      <div className="space-y-4">
        <Categories />
      </div>
    </aside>
  );
};