import { Form, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { createAccount, getAccountListItems } from "~/models/account.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  accounts: Awaited<ReturnType<typeof getAccountListItems>>;
};

type ActionData = {
  errors?: {
    name?: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const accounts = await getAccountListItems({ userId });
  return json<LoaderData>({ accounts });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    );
  }

  await createAccount({ name, userId });

  return redirect(`/accounts`);
};

export default function AccountsPage() {
  const { accounts } = useLoaderData<LoaderData>();
  return (
    <div>
      <h1>hello, world</h1>

      <Form method="post">
        <input type="text" name="name" />
        <button type="submit">Create</button>
      </Form>

      {accounts.map((account) => (
        <li key={account.id}>{account.name}</li>
      ))}
    </div>
  );
}
