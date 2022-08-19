import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/users.server";
import { getTitle, validateEmail } from "~/utils";
import { safeRedirect } from "~/utils.server";
import { Logo } from "~/components/logo";
import type { PropsWithChildren } from "react";
import { forwardRef, useEffect, useRef } from "react";
import { cn } from "~/components/classnames";

const defaultRedirectTo = "/accounts";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect(defaultRedirectTo);
  return json({});
};

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(
    formData.get("redirectTo"),
    defaultRedirectTo
  );
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json<ActionData>(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json<ActionData>(
      { errors: { email: "Invalid email or password" } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
};

export const meta: MetaFunction = () => ({ title: getTitle("Login") });

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || defaultRedirectTo;
  const actionData = useActionData() as ActionData;
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <AuthLayout>
      <div className="flex flex-col">
        <Link to="/" aria-label="Home">
          <Logo className="h-10 w-auto py-1" />
        </Link>
        <div className="mt-20">
          <h2 className="text-lg font-semibold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Don’t have an account?{" "}
            <Link
              to="/join"
              className="font-medium text-sky-600 hover:underline"
            >
              Sign up
            </Link>{" "}
            for a free trial.
          </p>
        </div>
        <Form
          method="post"
          noValidate
          className="mt-10 grid grid-cols-1 gap-y-8"
        >
          <div>
            <TextField
              label="Email address"
              ref={emailRef}
              id="email"
              required
              autoFocus={true}
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
            />
            {actionData?.errors?.email && (
              <div className="mt-2 text-sm text-rose-600" id="email-error">
                {actionData.errors.email}
              </div>
            )}
          </div>
          <div>
            <TextField
              label="Password"
              id="password"
              ref={passwordRef}
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
            />
            {actionData?.errors?.password && (
              <div className="mt-2 text-sm text-rose-600" id="password-error">
                {actionData.errors.password}
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-slate-900"
              >
                Remember me
              </label>
            </div>
            {/* consider to place somewhere else for tab order */}
            {/* <Link
              to=""
              className="text-sm font-medium text-sky-600 hover:underline"
            >
              Forgot your password?
            </Link> */}
          </div>
          <div>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Button
              type="submit"
              variant="solid"
              color="sky"
              className="w-full"
            >
              <span>
                Sign in <span aria-hidden="true">&rarr;</span>
              </span>
            </Button>
          </div>
        </Form>
      </div>
    </AuthLayout>
    //       <div className="flex items-center justify-between">
    //         <div className="flex items-center">
    //
    //           <label
    //             htmlFor="remember"
    //             className="ml-2 block text-sm text-slate-900"
    //           >
    //             Remember me
    //           </label>
    //         </div>
  );
}

function AuthLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative flex min-h-full justify-center md:px-12 lg:px-0">
      <div className="relative z-10 flex flex-1 flex-col bg-white py-10 px-4 shadow-2xl sm:justify-center md:flex-none md:px-28">
        <div className="mx-auto w-full max-w-md sm:px-4 md:w-96 md:max-w-sm md:px-0">
          {children}
        </div>
      </div>
      <div className="hidden sm:contents lg:relative lg:block lg:flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/login.jpg"
          alt=""
        />
      </div>
    </div>
  );
}

const formClasses =
  "block w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-sky-500 sm:text-sm";

const TextField = forwardRef(function TextField(
  { id, label, type = "text", className = "", ...props }: TextFieldProps,
  ref: React.Ref<HTMLInputElement>
) {
  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <input ref={ref} id={id} type={type} {...props} className={formClasses} />
    </div>
  );
});

type TextFieldProps = {
  id: string;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function Label({ id, children }: LabelProps) {
  return (
    <label
      htmlFor={id}
      className="mb-3 block text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  );
}

type LabelProps = PropsWithChildren<{ id: string }>;

const baseStyles = {
  solid:
    "group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
  outline:
    "group inline-flex ring-1 items-center justify-center rounded-full py-2 px-4 text-sm focus:outline-none",
};

const variantStyles = {
  solid: {
    slate:
      "bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900",
    sky: "bg-sky-600 text-white hover:text-slate-100 hover:bg-sky-500 active:bg-sky-800 active:text-sky-100 focus-visible:outline-sky-600",
    white:
      "bg-white text-slate-900 hover:bg-sky-50 active:bg-sky-200 active:text-slate-600 focus-visible:outline-white",
  },
  outline: {
    slate:
      "ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-sky-600 focus-visible:ring-slate-300",
    sky: "",
    white:
      "ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white",
  },
};

function Button({
  to,
  className,
  variant = "solid",
  color = "slate",
  children,
  type,
}: ButtonProps) {
  className = cn(baseStyles[variant], variantStyles[variant][color], className);

  return to ? (
    <Link to={to} className={className}>
      {children}
    </Link>
  ) : (
    <button className={className} type={type}>
      {children}
    </button>
  );
}

type ButtonProps = PropsWithChildren<{
  variant?: "solid" | "outline";
  color?: "slate" | "sky" | "white";
  className?: string;
  to?: string;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
}>;
