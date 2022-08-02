import { useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getIncomeCategoryListItems } from "~/models/income-expense-categories.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/components/button";
import { FormModal, useFormModal } from "~/components/forms";
import type { IncomeExpenseCategoryFormLoaderData } from "~/components/income-expense-categories";
import { IncomeExpenseCategoryForm } from "~/components/income-expense-categories";
import { IncomeExpenseCategoryType } from "@prisma/client";

type LoaderData = {
  categories: Awaited<ReturnType<typeof getIncomeCategoryListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const categories = await getIncomeCategoryListItems({
    userId,
  });
  return json<LoaderData>({ categories });
};

export default function IncomeCategoriesPage() {
  const formModal = useFormModal<IncomeExpenseCategoryFormLoaderData>((mode) =>
    mode.type === "new"
      ? {
          title: "New Income Category",
          url: "/settings/income-expense-categories/new",
        }
      : {
          title: "Edit Income Category",
          url: `/settings/income-expense-categories/${mode.id}/edit`,
        }
  );

  const { categories } = useLoaderData<LoaderData>();
  const deleteAction = useFetcher();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            Income Categories
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            By categorizing income bookings into categories, you get an overview
            of where your money is coming from.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => formModal.open({ type: "new" })}
            variant="primary"
          >
            Add income category
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
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {category.name}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          type="button"
                          onClick={() =>
                            formModal.open({ type: "edit", id: category.id })
                          }
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                          <span className="sr-only">, {category.name}</span>
                        </button>{" "}
                        &middot;{" "}
                        <deleteAction.Form
                          className="inline"
                          action={`/settings/income-expense-categories/${category.id}/delete`}
                          method="post"
                        >
                          <button
                            type="submit"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Delete
                            <span className="sr-only">, {category.name}</span>
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
      <FormModal
        modal={formModal}
        form={IncomeExpenseCategoryForm}
        type={IncomeExpenseCategoryType.INCOME}
      />
    </div>
  );
}
