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
import { useEffect, useRef } from "react";
import { NewButton } from "~/components/new-button";
import { AuthLayout } from "~/components/auth-layout";
import { TextField } from "~/components/new-forms";

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

export const meta: MetaFunction = () => ({ title: getTitle("Sign In") });

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
          <Logo className="h-10 w-auto" />
        </Link>
        <div className="mt-20">
          <h2 className="text-lg font-semibold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Don’t have an account?{" "}
            <Link
              to={{ pathname: "/join", search: searchParams.toString() }}
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
              required
              autoFocus={true}
              name="email"
              type="email"
              autoComplete="email"
              error={actionData?.errors?.email}
            />
          </div>
          <div>
            <TextField
              label="Password"
              ref={passwordRef}
              name="password"
              type="password"
              autoComplete="current-password"
              error={actionData?.errors?.password}
            />
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
            <NewButton
              type="submit"
              variant="solid"
              color="sky"
              className="w-full"
            >
              <span>
                Sign in <span aria-hidden="true">&rarr;</span>
              </span>
            </NewButton>
          </div>
        </Form>
      </div>
    </AuthLayout>
  );
}
