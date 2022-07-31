import type { ActionFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { deleteAccountGroup } from "~/models/account-groups.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.accountGroupId, "accountGroupId not found");

  await deleteAccountGroup({ id: params.accountGroupId, userId });

  return new Response(undefined, { status: 204 });
};
