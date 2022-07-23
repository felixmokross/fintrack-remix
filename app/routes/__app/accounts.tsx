import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { TrashIcon } from "~/icons";
import { getAccountListItems } from "~/models/account.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/shared/button";
import { getTitle } from "~/shared/util";

type LoaderData = {
  accounts: Awaited<ReturnType<typeof getAccountListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const accounts = await getAccountListItems({ userId });
  return json<LoaderData>({ accounts });
};

export const meta: MetaFunction = () => ({ title: getTitle("Accounts") });

export default function AccountsPage() {
  const fetcher = useFetcher();
  const { accounts } = useLoaderData<LoaderData>();
  return (
    <div className="py-4">
      <Button variant="primary" as={Link} to="new">
        New Account
      </Button>

      <ul className="m-4 grid grid-cols-4 gap-4">
        {accounts.map((account) => (
          <li
            key={account.id}
            className="h-28x rounded-md bg-slate-100 py-2 px-4"
          >
            {account.name}
            <fetcher.Form method="post" action="delete" className="inline">
              <input type="hidden" name="id" value={account.id} />
              <button>
                <TrashIcon className="h-5 w-5" />
              </button>
            </fetcher.Form>
          </li>
        ))}
      </ul>
      <Outlet />
    </div>
  );
}
