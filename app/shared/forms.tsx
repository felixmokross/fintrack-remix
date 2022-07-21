import { Combobox } from "@headlessui/react";
import type { DetailedHTMLProps } from "react";
import { useState } from "react";
import { currenciesByCode, currencyItems } from "~/currencies";
import { CheckIcon, SelectorIcon } from "~/icons";
import { cn } from "./classnames";

export function Input({
  label,
  name,
  id,
  error,
  defaultValue,
  groupClassName,
}: InputProps) {
  const errorId = `${id}-error`;
  return (
    <div className={groupClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          type="text"
          name={name}
          id={id}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          defaultValue={defaultValue}
        />

        {error && (
          <p className="mt-2 text-sm text-red-600" id={errorId}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export type InputProps = {
  name: string;
  id: string;
  label: string;
  defaultValue?: DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >["defaultValue"];
  error?: string;
  groupClassName?: string;
};

export function CurrencyCombobox({
  groupClassName,
  label,
  name,
  error,
  id,
}: CurrencyComboboxProps) {
  const [value, setValue] = useState("");
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

  const errorId = `${id}-error`;
  return (
    <Combobox
      as="div"
      value={value}
      onChange={setValue}
      name={name}
      className={groupClassName}
    >
      <Combobox.Label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          displayValue={getDisplayName}
          id={id}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>
        {filteredCurrencies.length > 0 && (
          <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
        {error && (
          <p className="mt-2 text-sm text-red-600" id={errorId}>
            {error}
          </p>
        )}
      </div>
    </Combobox>
  );

  function getDisplayName(v: string) {
    if (!v) return "";

    const currencyName = currenciesByCode[v as keyof typeof currenciesByCode];
    return `${currencyName} (${v})`;
  }
}

type CurrencyComboboxProps = {
  groupClassName?: string;
  label: string;
  name: string;
  id: string;
  error?: string;
};
