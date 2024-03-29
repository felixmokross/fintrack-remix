import { useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getAccountGroupListItems } from "~/models/account-groups.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/components/button";
import type { AccountGroupFormLoaderData } from "~/components/account-groups";
import { AccountGroupFormModal } from "~/components/account-groups";
import { FormModal, useFormModal } from "~/components/forms";

type LoaderData = {
  accountGroups: Awaited<ReturnType<typeof getAccountGroupListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const accountGroups = await getAccountGroupListItems({ userId });
  return json<LoaderData>({ accountGroups });
};

export default function AccountGroupsPage() {
  const formModal = useFormModal<AccountGroupFormLoaderData>((mode) =>
    mode.type === "new"
      ? { title: "New Account Group", url: "/app/settings/account-groups/new" }
      : {
          title: "Edit Account Group",
          url: `/app/settings/account-groups/${mode.id}/edit`,
        }
  );

  const deleteAction = useFetcher();

  const { accountGroups } = useLoaderData<LoaderData>();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">
            Account Groups
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            Accounts can be organized into groups, e.g. by financial
            institution, banking app, or type of account.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => formModal.open({ type: "new" })}
            variant="primary"
          >
            Add account group
          </Button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-slate-300">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {accountGroups.map((accountGroup) => (
                    <tr key={accountGroup.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        {accountGroup.name}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() =>
                            formModal.open({
                              type: "edit",
                              id: accountGroup.id,
                            })
                          }
                          className="text--600 hover:text--900"
                        >
                          Edit
                          <span className="sr-only">, {accountGroup.name}</span>
                        </button>{" "}
                        &middot;{" "}
                        <deleteAction.Form
                          className="inline"
                          action={`${accountGroup.id}/delete`}
                          method="post"
                        >
                          <button
                            type="submit"
                            className="text--600 hover:text--900"
                          >
                            Delete
                            <span className="sr-only">
                              , {accountGroup.name}
                            </span>
                          </button>
                        </deleteAction.Form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <FormModal modal={formModal} form={AccountGroupFormModal} />
    </div>
  );
}
