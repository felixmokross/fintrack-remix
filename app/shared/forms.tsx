import type { DetailedHTMLProps } from "react";
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
