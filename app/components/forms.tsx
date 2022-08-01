import {
  Combobox as HeadlessCombobox,
  RadioGroup as HeadlessRadioGroup,
  Switch,
} from "@headlessui/react";
import {
  DetailedHTMLProps,
  PropsWithChildren,
  ReactNode,
  Ref,
  RefObject,
  useRef,
} from "react";
import { useEffect } from "react";
import { useState } from "react";
import { currencyItems } from "~/currencies";
import {
  CheckCircleIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  SelectorIcon,
} from "~/components/icons";
import { cn } from "./classnames";
import { useId } from "react";
import { FetcherWithComponents, useFetcher } from "@remix-run/react";
import type { ModalSize } from "./modal";
import { Modal } from "./modal";
import type { SerializeType } from "~/utils";

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

export const Input = function Input({
  label,
  name,
  error,
  groupClassName,
  defaultValue,
  disabled,
  type,
}: InputProps) {
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
      />
      <ErrorMessage error={error} errorId={errorId} />
    </div>
  );
};

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

export function Select({
  name,
  label,
  error,
  groupClassName,
  defaultValue,
  disabled,
  children,
}: SelectProps) {
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
      >
        {children}
      </select>
      <ErrorMessage error={error} errorId={errorId} />
    </div>
  );
}

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

export function Combobox({
  groupClassName,
  label,
  name,
  error,
  defaultValue,
  options,
}: ComboboxProps) {
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
      <div className="relative mt-1">
        <HeadlessCombobox.Input
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 sm:text-sm"
          displayValue={getDisplayName}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
                        {option.primaryText}
                      </span>
                      {option.secondaryText && (
                        <span
                          className={cn(
                            "ml-2 truncate text-gray-500",
                            active ? "text-indigo-200" : "text-gray-500"
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
                          active ? "text-white" : "text-indigo-600"
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
      <ErrorMessage error={error} errorId={errorId} />
    </HeadlessCombobox>
  );

  function getDisplayName(v: string) {
    if (!v) return "";

    const option = options.find((o) => o.value === v)!;
    if (!option.secondaryText) return option.primaryText;

    return `${option.primaryText} (${option.secondaryText})`;
  }
}

export type ComboboxProps = {
  groupClassName?: string;
  label: string;
  name: string;
  error?: string;
  options: ComboboxOption[];
} & Pick<
  DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "defaultValue" | "ref"
>;

export type ComboboxOption = {
  primaryText: string;
  secondaryText?: string;
  value: string;
};

export function CurrencyCombobox({
  groupClassName,
  label,
  name,
  error,
  defaultValue,
}: CurrencyComboboxProps) {
  return (
    <Combobox
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

export type CurrencyComboboxProps = Omit<ComboboxProps, "options">;

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

export function useFormModal<TFormLoaderData>(
  url: (mode: FormModalMode) => string
): UseFormModalReturnValue<TFormLoaderData> {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<FormModalMode>({ type: "new" });
  const loader = useFetcher<SerializeType<TFormLoaderData>>();
  useEffect(() => {
    if (loader.type === "done") setIsOpen(true);
  }, [loader.type]);

  return {
    isOpen,
    open: (mode: FormModalMode) => {
      loader.load(url(mode));
      setMode(mode);
    },
    close: () => setIsOpen(false),
    loader,
    mode,
    url,
  };
}

type UseFormModalReturnValue<TFormLoaderData> = {
  isOpen: boolean;
  open: (mode: FormModalMode) => void;
  close: () => void;
  loader: FetcherWithComponents<SerializeType<TFormLoaderData>>;
  mode: FormModalMode;
  url: (mode: FormModalMode) => string;
};

export function FormModal<
  TFormLoaderData,
  TFormActionData extends FormActionData
>({
  children,
  title,
  size,
  modal: { isOpen, close, loader, mode, url },
}: FormModalProps<
  TFormLoaderData,
  TFormActionData["values"],
  TFormActionData["errors"]
>) {
  const action = useFormModalAction<TFormActionData>(close);
  const disabled = action.state !== "idle";
  return (
    <Modal open={isOpen} onClose={close} size={size}>
      <action.Form method="post" action={url(mode)}>
        <fieldset disabled={disabled}>
          <Modal.Body
            title={title(mode)}
            icon={mode.type === "edit" ? PencilIcon : PlusIcon}
          >
            {children({
              data: loader.data!,
              disabled,
              values: action.data?.values,
              errors: action.data?.errors,
            })}
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button type="submit" variant="primary">
              {action.state === "submitting" ? "Saving…" : "Save"}
            </Modal.Button>
            <Modal.Button
              type="button"
              onClick={close}
              className="mt-3 sm:mt-0"
            >
              Cancel
            </Modal.Button>
            {action.data?.errors?.form && (
              <p className="flex-grow self-center text-sm text-red-600">
                {action.data.errors.form}
              </p>
            )}
          </Modal.Footer>
        </fieldset>
      </action.Form>
    </Modal>
  );
}

function useFormModalAction<T extends FormActionData>(onClose: () => void) {
  const action = useFetcher<T>();
  const [submitting, setSubmitting] = useState(false);

  // need an extra state + useEffect currently to only close the modal if the action
  // was submitting before, since fetchers can't be reset in Remix currently
  // see https://github.com/remix-run/remix/pull/3551
  useEffect(() => {
    if (submitting && action.type === "actionReload" && action.data.ok) {
      onClose();
      setSubmitting(false);
    }
  }, [action.type, action.data, onClose, submitting]);

  useEffect(() => {
    if (action.state === "submitting") setSubmitting(true);
  }, [action.state]);

  return action;
}

type FormModalProps<TFormLoaderData, TValues, TErrors> = {
  modal: UseFormModalReturnValue<TFormLoaderData>;
  title: (mode: FormModalMode) => string;
  children: (
    params: FormRenderParams<TFormLoaderData, TValues, TErrors>
  ) => ReactNode;
  size?: ModalSize;
};

type FormModalMode = { type: "new" } | { type: "edit"; id: string };

type FormRenderParams<TFormLoaderData, TValues, TErrors> = {
  disabled: boolean;
  values?: TValues;
  errors?: TErrors;
  data: SerializeType<TFormLoaderData>;
};

type FormActionData = {
  ok: boolean;
  values?: any;
  errors?: { form?: string; [key: string]: any };
};
