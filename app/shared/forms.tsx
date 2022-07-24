import {
  Combobox,
  RadioGroup as HeadlessRadioGroup,
  Switch,
} from "@headlessui/react";
import { forwardRef } from "react";
import type { DetailedHTMLProps, PropsWithChildren } from "react";
import { useState } from "react";
import { currenciesByCode, currencyItems } from "~/currencies";
import { CheckCircleIcon, CheckIcon, SelectorIcon } from "~/icons";
import { cn } from "./classnames";
import { useId } from "react";

const labelClassName = "block text-sm font-medium text-gray-700";

function Label({ htmlFor, children }: PropsWithChildren<LabelProps>) {
  return (
    <label htmlFor={htmlFor} className={labelClassName}>
      {children}
    </label>
  );
}

type LabelProps = {
  htmlFor: string;
};

function ErrorMessage({ error, errorId }: ErrorMessageProps) {
  if (!error) return null;
  return (
    <p className="mt-2 text-sm text-red-600" id={errorId}>
      {error}
    </p>
  );
}

type ErrorMessageProps = { error?: string; errorId: string };

export const Input = forwardRef(function Input(
  {
    label,
    name,
    error,
    groupClassName,
    defaultValue,
    disabled,
    type,
  }: InputProps,
  ref: InputProps["ref"]
) {
  const id = `input-${useId()}`;
  const errorId = `input-error-${useId()}`;
  return (
    <div className={groupClassName}>
      <Label htmlFor={id}>{label}</Label>
      <input
        type={type || "text"}
        name={name}
        id={id}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 sm:text-sm"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        defaultValue={defaultValue}
        disabled={disabled}
        ref={ref}
      />
      <ErrorMessage error={error} errorId={errorId} />
    </div>
  );
});

export type InputProps = {
  name: string;
  label: string;
  error?: string;
  groupClassName?: string;
} & Pick<
  DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "defaultValue" | "disabled" | "ref" | "type"
>;

export const Select = forwardRef(function Select(
  {
    name,
    label,
    error,
    groupClassName,
    defaultValue,
    disabled,
    children,
  }: SelectProps,
  ref: SelectProps["ref"]
) {
  const id = `select-${useId()}`;
  const errorId = `select-error-${useId()}`;
  return (
    <div className={groupClassName}>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 sm:text-sm"
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        ref={ref}
      >
        {children}
      </select>
      <ErrorMessage error={error} errorId={errorId} />
    </div>
  );
});

export type SelectProps = {
  name: string;
  label: string;
  error?: string;
  groupClassName?: string;
} & Pick<
  DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >,
  "defaultValue" | "disabled" | "children" | "ref"
>;

export const CurrencyCombobox = forwardRef(function CurrencyCombobox(
  { groupClassName, label, name, error, defaultValue }: CurrencyComboboxProps,
  ref: CurrencyComboboxProps["ref"]
) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const filteredCurrencies =
    query === ""
      ? currencyItems
      : currencyItems.filter((currencyItem) => {
          return (
            currencyItem.code.toLowerCase().includes(query.toLowerCase()) ||
            currencyItem.name.toLowerCase().includes(query.toLowerCase())
          );
        });

  const errorId = `currency-combobox-error-${useId()}`;
  return (
    <Combobox
      as="div"
      value={value}
      onChange={setValue}
      name={name}
      className={groupClassName}
    >
      <Combobox.Label className={labelClassName}>{label}</Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 sm:text-sm"
          displayValue={getDisplayName}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          ref={ref}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>
        {filteredCurrencies.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredCurrencies.map((currencyItem) => (
              <Combobox.Option
                key={currencyItem.code}
                value={currencyItem.code}
                className={({ active }) =>
                  cn(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-indigo-600 text-white" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex">
                      <span
                        className={cn("truncate", selected && "font-semibold")}
                      >
                        {currencyItem.name}
                      </span>
                      <span
                        className={cn(
                          "ml-2 truncate text-gray-500",
                          active ? "text-indigo-200" : "text-gray-500"
                        )}
                      >
                        {currencyItem.code}
                      </span>
                    </div>

                    {selected && (
                      <span
                        className={cn(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-indigo-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
      <ErrorMessage error={error} errorId={errorId} />
    </Combobox>
  );

  function getDisplayName(v: string) {
    if (!v) return "";

    const currencyName = currenciesByCode[v as keyof typeof currenciesByCode];
    return `${currencyName} (${v})`;
  }
});

export type CurrencyComboboxProps = {
  groupClassName?: string;
  label: string;
  name: string;
  error?: string;
} & Pick<
  DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "defaultValue" | "ref"
>;

export function RadioGroup<TValue extends string | undefined>({
  groupClassName,
  label,
  name,
  error,
  onChange,
  defaultValue,
  options,
  disabled = false,
}: RadioGroupProps<TValue>) {
  const [value, setValue] = useState(defaultValue);
  const errorId = `radio-group-error-${useId()}`;
  return (
    <HeadlessRadioGroup
      value={value}
      onChange={(value) => {
        setValue(value);
        onChange && onChange(value as TValue);
      }}
      className={groupClassName}
      name={name}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={error ? errorId : undefined}
      disabled={disabled}
    >
      <HeadlessRadioGroup.Label className={labelClassName}>
        {label}
      </HeadlessRadioGroup.Label>
      <div className="mt-1 grid grid-cols-2 gap-x-3">
        {options.map((option) => (
          <HeadlessRadioGroup.Option
            key={option.value}
            value={option.value}
            className={({ active, checked }) =>
              cn(
                "focus:outline-none",
                active ? "ring-2 ring-indigo-500 ring-offset-2" : "",
                checked
                  ? "border-transparent bg-indigo-600 text-white"
                  : "border-gray-200 bg-white text-gray-900",
                "flex items-center justify-center rounded-md border py-2 px-3 text-sm font-medium sm:flex-1",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                !disabled && checked && "hover:bg-indigo-700",
                !disabled && !checked && "hover:bg-gray-50"
              )
            }
          >
            <HeadlessRadioGroup.Label as="span">
              {option.label}
            </HeadlessRadioGroup.Label>
          </HeadlessRadioGroup.Option>
        ))}
      </div>
      <ErrorMessage error={error} errorId={errorId} />
    </HeadlessRadioGroup>
  );
}

export type RadioGroupProps<TValue extends string | undefined> = {
  groupClassName?: string;
  label: string;
  name: string;
  error?: string;
  defaultValue?: string;
  onChange?: (value: TValue) => void;
  options: { label: string; value: TValue }[];
  disabled?: boolean;
};

export function DetailedRadioGroup<TValue extends string | undefined>({
  defaultValue,
  onChange,
  groupClassName,
  label,
  options,
  error,
  name,
  disabled = false,
}: DetailedRadioGroupProps<TValue>) {
  const [value, setValue] = useState(defaultValue);
  const errorId = `detailed-radio-group-error-${useId()}`;
  return (
    <HeadlessRadioGroup
      value={value}
      onChange={(value) => {
        setValue(value);
        onChange && onChange(value as TValue);
      }}
      className={groupClassName}
      name={name}
      disabled={disabled}
    >
      <HeadlessRadioGroup.Label className={labelClassName}>
        {label}
      </HeadlessRadioGroup.Label>
      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        {options.map((option) => (
          <HeadlessRadioGroup.Option
            key={option.value}
            value={option.value}
            className={({ checked, active }) =>
              cn(
                checked ? "border-transparent" : "border-gray-300",
                active ? "border-indigo-500 ring-2 ring-indigo-500" : "",
                "relative flex rounded-lg border bg-white p-4 shadow-sm focus:outline-none",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              )
            }
          >
            {({ checked, active }) => (
              <>
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <HeadlessRadioGroup.Label
                      as="span"
                      className="block text-sm font-medium text-gray-900"
                    >
                      {option.label}
                    </HeadlessRadioGroup.Label>
                    <HeadlessRadioGroup.Description
                      as="span"
                      className="mt-1 flex items-center text-sm text-gray-500"
                    >
                      {option.description}
                    </HeadlessRadioGroup.Description>
                  </span>
                </span>
                <CheckCircleIcon
                  className={cn(
                    !checked ? "invisible" : "",
                    "h-5 w-5 text-indigo-600"
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    active ? "border" : "border-2",
                    checked ? "border-indigo-500" : "border-transparent",
                    "pointer-events-none absolute -inset-px rounded-lg"
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </HeadlessRadioGroup.Option>
        ))}
      </div>
      <ErrorMessage error={error} errorId={errorId} />
    </HeadlessRadioGroup>
  );
}

export type DetailedRadioGroupProps<TValue extends string | undefined> = {
  groupClassName?: string;
  label: string;
  name: string;
  error?: string;
  defaultValue?: string;
  onChange?: (value: TValue) => void;
  options: { label: string; description: string; value: TValue }[];
  disabled?: boolean;
};

// currently not used, but maybe useful later -- if not, should be removed at some point
export function Toggle({
  groupClassName,
  label,
  description,
  name,
  defaultValue,
  onChange,
}: ToggleProps) {
  const [enabled, setEnabled] = useState(defaultValue === "true");
  return (
    <Switch.Group as="div" className={cn("flex items-center", groupClassName)}>
      <Switch
        checked={enabled}
        onChange={(enabled) => {
          setEnabled(enabled);
          onChange && onChange(enabled);
        }}
        name={name}
        className={cn(
          enabled ? "bg-indigo-600" : "bg-gray-200",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            enabled ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        />
      </Switch>
      <div className="ml-4 flex flex-col">
        <Switch.Label className="text-sm font-medium text-gray-700">
          {label}
        </Switch.Label>
        <Switch.Description className="mt-1 text-sm text-gray-500">
          {description}
        </Switch.Description>
      </div>
    </Switch.Group>
  );
}

export type ToggleProps = {
  groupClassName?: string;
  label: string;
  description: string;
  name: string;
  defaultValue?: string;
  onChange?: (enabled: boolean) => void;
};
