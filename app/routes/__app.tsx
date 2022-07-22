import { Disclosure, Menu, Transition } from "@headlessui/react";
import { NavLink, Link, Outlet, Form } from "@remix-run/react";
import { Fragment, useRef } from "react";
import { SearchIcon, XIcon, MenuIcon, CogIcon } from "~/icons";
import { cn } from "~/shared/classnames";
import { useUser } from "~/utils";

export default function App() {
  const noFocusRef = useRef(null);
  const user = useUser();
  return (
    <>
      {/* noFocusRef: prevent close() calls from focusing the triggering Disclosure.Button by passing a ref to an element which cannot be focused to the close() calls */}
      <Disclosure as="nav" className="bg-white shadow" ref={noFocusRef}>
        {({ open, close }) => {
          return (
            <>
              <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex px-2 lg:px-0">
                    <div className="flex flex-shrink-0 items-center">
                      <img
                        className="block h-8 w-auto lg:hidden"
                        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                        alt="Workflow"
                      />
                      <img
                        className="hidden h-8 w-auto lg:block"
                        src="https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg"
                        alt="Workflow"
                      />
                    </div>
                    <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                      <NavLink
                        to="#"
                        aria-disabled={true}
                        className={({ isActive }) =>
                          cn(
                            "inline-flex items-center border-b-2  px-1 pt-1 text-sm font-medium ",
                            "cursor-not-allowed border-transparent text-gray-500 opacity-50"
                            // isActive
                            //   ? "border-indigo-500 text-gray-900"
                            //   : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                          )
                        }
                      >
                        Dashboard
                      </NavLink>
                      <NavLink
                        to="accounts"
                        className={({ isActive }) =>
                          cn(
                            "inline-flex items-center border-b-2  px-1 pt-1 text-sm font-medium",
                            isActive
                              ? "border-indigo-500 text-gray-900"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                          )
                        }
                      >
                        Accounts
                      </NavLink>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
                    <div className="w-full max-w-lg lg:max-w-xs">
                      <label htmlFor="search" className="sr-only">
                        Search
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <SearchIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </div>
                        <input
                          id="search"
                          name="search"
                          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Search"
                          type="search"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center lg:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                  <div className="hidden lg:ml-4 lg:flex lg:items-center">
                    <Link
                      to="settings"
                      className="flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Go to settings</span>
                      <CogIcon className="h-6 w-6" aria-hidden="true" />
                    </Link>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-4 flex-shrink-0">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="/profile"
                                className={cn(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                Your Profile
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Form
                                action="/logout"
                                method="post"
                                className={cn(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                <button
                                  type="submit"
                                  className="w-full text-left"
                                >
                                  Sign out
                                </button>
                              </Form>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="lg:hidden">
                <div className="space-y-1 pt-2 pb-3">
                  {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800" */}
                  <NavLink
                    to="#"
                    // onClick={() => closeWithoutFocus()}
                    aria-disabled="true"
                    className="block cursor-not-allowed border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 opacity-50"
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="accounts"
                    onClick={() => closeWithoutFocus()}
                    className={({ isActive }) =>
                      cn(
                        "block border-l-4 py-2 pl-3 pr-4 text-base font-medium",
                        isActive
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                      )
                    }
                  >
                    Accounts
                  </NavLink>
                </div>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        Tom Cook
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {user.email}
                      </div>
                    </div>
                    <Link
                      to="settings"
                      onClick={() => closeWithoutFocus()}
                      className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Go to settings</span>
                      <CogIcon className="h-6 w-6" aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="mt-3 space-y-1">
                    <a
                      href="/profile"
                      onClick={() => closeWithoutFocus()}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Your Profile
                    </a>
                    <Form
                      action="/logout"
                      method="post"
                      onSubmit={() => closeWithoutFocus()}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      <button type="submit" className="w-full text-left">
                        Sign out
                      </button>
                    </Form>
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          );

          function closeWithoutFocus() {
            close(noFocusRef);
          }
        }}
      </Disclosure>
      <div className="mx-auto max-w-7xl sm:px-4 lg:px-8">
        <Outlet />
      </div>
    </>
  );
}