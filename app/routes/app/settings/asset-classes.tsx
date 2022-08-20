import { useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getAssetClassListItems } from "~/models/asset-classes.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/components/button";
import { FormModal, useFormModal } from "~/components/forms";
import type { AssetClassFormLoaderData } from "~/components/asset-classes";
import { AssetClassForm } from "~/components/asset-classes";

type LoaderData = {
  assetClasses: Awaited<ReturnType<typeof getAssetClassListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const assetClasses = await getAssetClassListItems({ userId });
  return json<LoaderData>({ assetClasses });
};

export default function AssetClassesPage() {
  const formModal = useFormModal<AssetClassFormLoaderData>((mode) =>
    mode.type === "new"
      ? { title: "New Asset Class", url: "/app/settings/asset-classes/new" }
      : {
          title: "Edit Asset Class",
          url: `/app/settings/asset-classes/${mode.id}/edit`,
        }
  );

  const { assetClasses } = useLoaderData<LoaderData>();
  const deleteAction = useFetcher();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">
            Asset Classes
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            Asset classes are groups of assets with similar liquidity, risk, and
            return. Asset accounts are assigned to the asset classes defined
            here.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => formModal.open({ type: "new" })}
            variant="primary"
          >
            Add asset class
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
                      className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-slate-900 sm:pl-6"
                    >
                      Sort Order
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
                  {assetClasses.map((assetClass) => (
                    <tr key={assetClass.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        {assetClass.name}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-right text-sm font-medium text-slate-900 sm:pl-6">
                        {assetClass.sortOrder}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() =>
                            formModal.open({ type: "edit", id: assetClass.id })
                          }
                          className="text--600 hover:text--900"
                        >
                          Edit
                          <span className="sr-only">, {assetClass.name}</span>
                        </button>{" "}
                        &middot;{" "}
                        <deleteAction.Form
                          className="inline"
                          action={`${assetClass.id}/delete`}
                          method="post"
                        >
                          <button
                            type="submit"
                            className="text--600 hover:text--900"
                          >
                            Delete
                            <span className="sr-only">, {assetClass.name}</span>
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
      <FormModal modal={formModal} form={AssetClassForm} />
    </div>
  );
}
