import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  getAccountGroup,
  validateAccountGroup,
} from "~/models/account-groups.server";
import { updateAccountGroup } from "~/models/account-groups.server";
import { requireUserId } from "~/session.server";
import type {
  AccountGroupFormActionData,
  AccountGroupFormLoaderData,
} from "~/components/account-groups";
import { hasErrors } from "~/utils.server";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.accountGroupId, "accountGroupId not found");

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

  await updateAccountGroup({
    id: params.accountGroupId,
    name,
    userId,
  });

  return json({ ok: true });
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.accountGroupId, "accountGroupId not found");
  const accountGroup = await getAccountGroup({
    userId,
    id: params.accountGroupId,
  });
  if (!accountGroup) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<AccountGroupFormLoaderData>({ accountGroup });
};
