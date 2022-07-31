import type { ActionFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { deleteTransaction } from "~/models/transaction.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.transactionId, "transactionId not found");

  await deleteTransaction({ id: params.transactionId, userId });

  return new Response(null, { status: 204 });
};
