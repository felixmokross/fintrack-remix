import { Dialog, Transition } from "@headlessui/react";
import type { ComponentType, PropsWithChildren } from "react";
import { Fragment } from "react";
import type { IconProps } from "~/components/icons";
import { cn } from "./classnames";
import type { NewButtonProps } from "./new-button";
import { NewButton } from "./new-button";

export enum ModalSize {
  SMALL = "SMALL",
  LARGE = "LARGE",
  EXTRA_LARGE = "EXTRA_LARGE",
}

function ModalRoot({
  open = true,
  onClose,
  initialFocus,
  children,
  size = ModalSize.SMALL,
}: ModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={initialFocus}
        onClose={onClose}
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
          <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-start sm:p-0">
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
                className={cn(
                  "relative w-full transform text-left shadow-xl transition-all sm:my-8 sm:max-w-lg",
                  {
                    "sm:max-w-lg": size === ModalSize.SMALL,
                    "sm:max-w-xl": size === ModalSize.LARGE,
                    "sm:max-w-4xl": size === ModalSize.EXTRA_LARGE,
                  }
                )}
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
  size?: ModalSize;
}>;

function Button({ className, ...props }: NewButtonProps) {
  return (
    <NewButton
      variant="solid"
      color="slate"
      className={cn(
        className,
        "w-full text-base sm:ml-3 sm:w-24 sm:min-w-max sm:text-sm"
      )}
      {...props}
    />
  );
}

function Footer({ children }: PropsWithChildren<{}>) {
  return (
    <div className="rounded-b-lg bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
      {children}
    </div>
  );
}

function Body({
  icon: Icon,
  title,
  children,
}: PropsWithChildren<ModalBodyProps>) {
  return (
    <div className="rounded-t-lg bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
        <Icon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
      </div>
      <div className="mt-3 sm:mt-5">
        <Dialog.Title
          as="h3"
          className="text-center text-lg font-medium leading-6 text-slate-900"
        >
          {title}
        </Dialog.Title>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export type ModalBodyProps = {
  title: string;
  icon: ComponentType<IconProps>;
};

export const Modal = Object.assign(ModalRoot, { Button, Footer, Body });
