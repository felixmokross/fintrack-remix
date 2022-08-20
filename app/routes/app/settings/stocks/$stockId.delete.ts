import type { ActionFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { deleteStock } from "~/models/stocks.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.stockId, "stockId not found");

  await deleteStock({ id: params.stockId, userId });

  return new Response(undefined, { status: 204 });
};
