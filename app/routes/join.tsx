import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { getUserId, createUserSession } from "~/session.server";

import { createUser, getUserByEmail } from "~/models/users.server";
import { getTitle, validateEmail } from "~/utils";
import { safeRedirect } from "~/utils.server";
import { AuthLayout } from "~/components/auth-layout";
import { Logo } from "~/components/logo";
import { NewButton } from "~/components/new-button";
import { NewCurrencyCombobox, TextField } from "~/components/new-forms";
import { pick } from "accept-language-parser";
import { getLocales } from "~/locales.server";

const defaultRedirectTo = "/accounts";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect(defaultRedirectTo);
  return json({});
};

interface ActionData {
  errors: {
    email?: string;
    password?: string;
    refCurrency?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const refCurrency = formData.get("refCurrency");
  const redirectTo = safeRedirect(
    formData.get("redirectTo"),
    defaultRedirectTo
  );

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

  if (typeof refCurrency !== "string" || refCurrency.length === 0) {
    return json<ActionData>(
      { errors: { password: "Reference currency is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json<ActionData>(
      { errors: { email: "A user already exists with this email" } },
      { status: 400 }
    );
  }

  const user = await createUser(
    email,
    password,
    refCurrency,
    getPreferredLocale(request)
  );

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
};

function getPreferredLocale(request: Request) {
  const acceptLanguageHeader = request.headers.get("accept-language");
  if (!acceptLanguageHeader) return undefined;

  return pick(getLocales(), acceptLanguageHeader) || undefined;
}

export const meta: MetaFunction = () => ({ title: getTitle("Sign Up") });

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
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
            Get started for free
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Already registered?{" "}
            <Link
              to={{ pathname: "/login", search: searchParams.toString() }}
              className="font-medium text-sky-600 hover:underline"
            >
              Sign in
            </Link>{" "}
            to your account.
          </p>
        </div>
      </div>
      <Form
        method="post"
        noValidate
        className="mt-10 grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2"
      >
        <div className="col-span-full">
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
        <div className="col-span-full">
          <TextField
            label="Password"
            ref={passwordRef}
            name="password"
            type="password"
            autoComplete="new-password"
            error={actionData?.errors?.password}
          />
        </div>
        <NewCurrencyCombobox
          label="Reference currency"
          name="refCurrency"
          groupClassName="col-span-full"
        />
        <div className="col-span-full">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <NewButton
            type="submit"
            variant="solid"
            color="sky"
            className="w-full"
          >
            <span>
              Sign up <span aria-hidden="true">&rarr;</span>
            </span>
          </NewButton>
        </div>
      </Form>
    </AuthLayout>
  );
}
