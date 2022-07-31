import type { ActionFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { deleteAccount } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.accountId, "accountId not found");

  await deleteAccount({ id: params.accountId, userId });

  const refererUrl = request.headers.get("referer");
  return refererUrl?.includes(`/accounts/${params.accountId}`)
    ? redirect("/accounts")
    : new Response(null, { status: 204 });
};
