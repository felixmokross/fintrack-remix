import { NavLink, Outlet } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/server-runtime";
import { cn } from "~/components/classnames";
import { getTitle } from "~/utils";

const navigation = [
  { name: "Asset Classes", to: "asset-classes" },
  { name: "Account Groups", to: "account-groups" },
  { name: "Stocks", to: "stocks" },
  { name: "Income Categories", to: "income-categories" },
  { name: "Expense Categories", to: "expense-categories" },
  { name: "Import", to: "import" },
  { name: "Users", to: "users" },
];

export const meta: MetaFunction = () => ({ title: getTitle("Settings") });

export default function SettingsPage() {
  return (
    <div className="flex flex-col md:flex-row">
      <nav
        className="flex-none space-y-1 py-2 md:w-52 md:py-4"
        aria-label="Sidebar"
      >
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            prefetch="intent"
            className={({ isActive }) =>
              cn(
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                "flex items-center px-3 py-2 text-sm font-medium sm:rounded-md"
              )
            }
          >
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <main className="flex-grow py-2 md:py-4">
        <Outlet />
      </main>
    </div>
  );
}
