import { GridIcon } from "~/components/icons";

export default function NoAccountSelectedPage() {
  return (
    <div className="hidden h-app overflow-y-auto md:flex md:flex-col md:items-center md:justify-center md:gap-4">
      <GridIcon className="h-20 w-20 text-slate-400" />
      <h3 className="text-sm font-medium text-slate-400">
        No account selected
      </h3>
    </div>
  );
}
