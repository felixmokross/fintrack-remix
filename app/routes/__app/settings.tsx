import { Outlet } from "@remix-run/react";
import { NavLink } from "react-router-dom";
import { cn } from "~/shared/classnames";

const navigation = [
  { name: "Asset Classes", to: "asset-classes" },
  { name: "Account Groups", to: "account-groups" },
  { name: "Stocks", to: "stocks" },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col md:flex-row">
      <nav
        className="flex-none space-y-1 py-2 md:w-52 md:px-2 md:py-4"
        aria-label="Sidebar"
      >
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                "flex items-center px-3 py-2 text-sm font-medium md:rounded-md"
              )
            }
            // aria-current={({ isActive }) => (isActive ? "page" : undefined)}
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
