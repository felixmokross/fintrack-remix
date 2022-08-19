import type { DetailedHTMLProps, PropsWithChildren } from "react";
import { useState } from "react";
import { useId } from "react";
import { forwardRef } from "react";
import { cn } from "./classnames";
import { Combobox as HeadlessCombobox } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "./icons";
import { currencyItems } from "~/currencies";

const formClasses =
  "block w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-sky-500 sm:text-sm";

export function SelectField({
  label,
  className = "",
  error,
  ...props
}: SelectFieldProps) {
  const id = `input-${useId()}`;
  const errorId = `input-error-${useId()}`;
  return (
    <>
      <div className={className}>
        {label && <Label id={id}>{label}</Label>}
        <select
          id={id}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
          className={cn(formClasses, "pr-8")}
        />
      </div>
      <NewErrorMessage error={error} errorId={errorId} />
    </>
  );
}

type SelectFieldProps = {
  label?: string;
  error?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id">;

export const TextField = forwardRef(function TextField(
  { label, type = "text", className = "", error, ...props }: TextFieldProps,
  ref: React.Ref<HTMLInputElement>
) {
  const id = `input-${useId()}`;
  const errorId = `input-error-${useId()}`;
  return (
    <>
      <div className={className}>
        {label && <Label id={id}>{label}</Label>}
        <input
          ref={ref}
          id={id}
          type={type}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
          className={formClasses}
        />
      </div>
      <NewErrorMessage error={error} errorId={errorId} />
    </>
  );
});

type TextFieldProps = {
  label?: string;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">;

export function NewCombobox({
  groupClassName,
  label,
  name,
  error,
  defaultValue,
  options,
}: NewComboboxProps) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) => {
          return (
            option.primaryText.toLowerCase().includes(query.toLowerCase()) ||
            (option.secondaryText &&
              option.secondaryText.toLowerCase().includes(query.toLowerCase()))
          );
        });

  const errorId = `combobox-error-${useId()}`;
  return (
    <HeadlessCombobox
      as="div"
      value={value}
      onChange={setValue}
      name={name}
      className={groupClassName}
    >
      <HeadlessCombobox.Label className={labelClassName}>
        {label}
      </HeadlessCombobox.Label>
      <div className="relative">
        <HeadlessCombobox.Input
          onChange={(event) => setQuery(event.target.value)}
          className={cn(formClasses, "pr-8")}
          displayValue={getDisplayName}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
          <SelectorIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </HeadlessCombobox.Button>
        {filteredOptions.length > 0 && (
          <HeadlessCombobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((option) => (
              <HeadlessCombobox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  cn(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-sky-600 text-white" : "text-slate-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex">
                      <span
                        className={cn("truncate", selected && "font-semibold")}
                      >
                        {option.primaryText}
                      </span>
                      {option.secondaryText && (
                        <span
                          className={cn(
                            "ml-2 truncate text-slate-500",
                            active ? "text-sky-200" : "text-slate-500"
                          )}
                        >
                          {option.secondaryText}
                        </span>
                      )}
                    </div>

                    {selected && (
                      <span
                        className={cn(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-sky-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </HeadlessCombobox.Option>
            ))}
          </HeadlessCombobox.Options>
        )}
      </div>
      <NewErrorMessage error={error} errorId={errorId} />
    </HeadlessCombobox>
  );

  function getDisplayName(v: string) {
    if (!v) return "";

    const option = options.find((o) => o.value === v);

    if (!option) return v;
    if (!option.secondaryText) return option.primaryText;

    return `${option.primaryText} (${option.secondaryText})`;
  }
}

export type NewComboboxProps = {
  groupClassName?: string;
  label: string;
  name: string;
  error?: string;
  options: NewComboboxOption[];
} & Pick<
  DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "defaultValue"
>;

export type NewComboboxOption = {
  primaryText: string;
  secondaryText?: string;
  value: string;
};

export function NewCurrencyCombobox({
  groupClassName,
  label,
  name,
  error,
  defaultValue,
}: NewCurrencyComboboxProps) {
  return (
    <NewCombobox
      label={label}
      name={name}
      error={error}
      defaultValue={defaultValue}
      groupClassName={groupClassName}
      options={currencyItems.map((c) => ({
        primaryText: c.name,
        secondaryText: c.code,
        value: c.code,
      }))}
    />
  );
}

export type NewCurrencyComboboxProps = Omit<NewComboboxProps, "options">;

const labelClassName = "mb-1 block text-sm font-medium text-gray-700";

function Label({ id, children }: LabelProps) {
  return (
    <label htmlFor={id} className={labelClassName}>
      {children}
    </label>
  );
}

type LabelProps = PropsWithChildren<{ id: string }>;

export function NewErrorMessage({ error, errorId }: NewErrorMessageProps) {
  if (!error) return null;
  return (
    <p className="mt-2 text-sm text-rose-600" id={errorId}>
      {error}
    </p>
  );
}

type NewErrorMessageProps = { error?: string; errorId: string };
