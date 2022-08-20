import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type { AccountGroupFormActionData } from "~/components/account-groups";
import {
  createAccountGroup,
  validateAccountGroup,
} from "~/models/account-groups.server";
import { requireUserId } from "~/session.server";
import { hasErrors } from "~/utils.server";

export const loader: LoaderFunction = async () => ({});

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");

  invariant(typeof name === "string", "name not found");

  const errors = validateAccountGroup({ name });

  if (hasErrors(errors)) {
    return json<AccountGroupFormActionData>(
      { ok: false, errors, values: { name } },
      { status: 400 }
    );
  }

  await createAccountGroup({ name, userId });

  return json({ ok: true });
};
