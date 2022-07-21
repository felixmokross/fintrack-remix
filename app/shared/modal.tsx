import { Dialog, Transition } from "@headlessui/react";
import type {
  ComponentPropsWithRef,
  ComponentType,
  ElementType,
  PropsWithChildren,
} from "react";
import { forwardRef } from "react";
import { Fragment } from "react";
import type { IconProps } from "~/icons";
import type { ButtonProps } from "./button";
import { Button as StandardButton } from "./button";
import { cn } from "./classnames";

function ModalRoot({ onClose, initialFocus, children }: ModalProps) {
  return (
    <Transition.Root show={true} appear={true} as={Fragment}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
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
  onClose: () => void;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
}>;

const Button = forwardRef(function ModalButton<T extends ElementType>(
  { className, ...props }: ButtonProps<T>,
  ref?: ComponentPropsWithRef<T>["ref"]
) {
  return (
    <StandardButton
      className={cn(className, "w-full text-base sm:ml-3 sm:text-sm")}
      {...props}
      ref={ref}
    />
  );
});

function Footer({ children }: PropsWithChildren<{}>) {
  return (
    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
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
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <Icon className="h-6 w-6 text-green-600" aria-hidden="true" />
      </div>
      <div className="mt-3 sm:mt-5">
        <Dialog.Title
          as="h3"
          className="text-center text-lg font-medium leading-6 text-gray-900"
        >
          {title}
        </Dialog.Title>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export type ModalBodyProps = {
  title: string;
  icon: ComponentType<IconProps>;
};

export const Modal = Object.assign(ModalRoot, { Button, Footer, Body });
