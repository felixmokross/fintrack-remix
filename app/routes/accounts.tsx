import { Dialog, Transition } from "@headlessui/react";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Fragment, useRef } from "react";
import { PlusIcon, TrashIcon } from "~/icons";
import { getAccountListItems } from "~/models/account.server";
import { requireUserId } from "~/session.server";
import { Button, ModalButton } from "~/shared/button";

type LoaderData = {
  accounts: Awaited<ReturnType<typeof getAccountListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const accounts = await getAccountListItems({ userId });
  return json<LoaderData>({ accounts });
};

export default function AccountsPage() {
  const { accounts } = useLoaderData<LoaderData>();
  const { pathname } = useLocation();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const submitButtonRef = useRef(null);
  return (
    <div>
      <Button variant="primary" as="Link" to="new">
        New
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
      <Transition.Root show={pathname.endsWith("/new")} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={submitButtonRef}
          onClose={() => navigate(".")}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  as={Form}
                  method="post"
                  action="new"
                  className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                >
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <PlusIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        New Account
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="space-y-8 divide-y divide-gray-200">
                          <div className="space-y-8 divide-y divide-gray-200">
                            <div>
                              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Name
                                  </label>
                                  <div className="mt-1">
                                    <input
                                      type="text"
                                      name="name"
                                      id="name"
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="last-name"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Category
                                  </label>
                                  <div className="mt-1">
                                    <input
                                      type="text"
                                      name="last-name"
                                      id="last-name"
                                      autoComplete="family-name"
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Currency
                                  </label>
                                  <div className="mt-1">
                                    <input
                                      id="email"
                                      name="email"
                                      type="email"
                                      autoComplete="email"
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor="country"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Opening Date
                                  </label>
                                  <div className="mt-1">
                                    <select
                                      id="country"
                                      name="country"
                                      autoComplete="country-name"
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                      <option>United States</option>
                                      <option>Canada</option>
                                      <option>Mexico</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <ModalButton
                      variant="primary"
                      type="submit"
                      ref={submitButtonRef}
                    >
                      Create
                    </ModalButton>
                    <ModalButton as={Link} to="." className="mt-3 sm:mt-0">
                      Cancel
                    </ModalButton>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
