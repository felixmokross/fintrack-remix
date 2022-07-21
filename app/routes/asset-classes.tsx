import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getAssetClassListItems } from "~/models/asset-class.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/shared/button";

type LoaderData = {
  assetClasses: Awaited<ReturnType<typeof getAssetClassListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const assetClasses = await getAssetClassListItems({ userId });
  return json<LoaderData>({ assetClasses });
};

export default function AssetClassesPage() {
  const { assetClasses } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Asset Classes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Asset classes are groups of assets with similar liquidity, risk, and
            return. Asset accounts are assigned to the asset classes defined
            here.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button as={Link} to="new" variant="primary">
            Add asset class
          </Button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6"
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
                <tbody className="divide-y divide-gray-200 bg-white">
                  {assetClasses.map((assetClass) => (
                    <tr key={assetClass.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {assetClass.name}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-right text-sm font-medium text-gray-900 sm:pl-6">
                        {assetClass.sortOrder}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          to={`/asset-classes/${assetClass.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                          <span className="sr-only">, {assetClass.name}</span>
                        </Link>{" "}
                        &middot;{" "}
                        <fetcher.Form
                          className="inline"
                          action="delete"
                          method="post"
                        >
                          <input
                            type="hidden"
                            name="id"
                            value={assetClass.id}
                          />
                          <button
                            type="submit"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Delete
                            <span className="sr-only">, {assetClass.name}</span>
                          </button>
                        </fetcher.Form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
