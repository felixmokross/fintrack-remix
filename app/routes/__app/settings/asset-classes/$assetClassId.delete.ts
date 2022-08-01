import type { ActionFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { deleteAssetClass } from "~/models/asset-classes.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.assetClassId, "assetClassId not found");

  await deleteAssetClass({ id: params.assetClassId, userId });

  return new Response(undefined, { status: 204 });
};
