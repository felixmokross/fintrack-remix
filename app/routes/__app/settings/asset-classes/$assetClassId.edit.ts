import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type {
  AssetClassFormActionData,
  AssetClassFormLoaderData,
} from "~/components/asset-classes";
import {
  getAssetClass,
  parseSortOrder,
  updateAssetClass,
  validateAssetClass,
} from "~/models/asset-classes.server";
import { requireUserId } from "~/session.server";
import { hasErrors } from "~/utils.server";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.assetClassId, "assetClassId not found");

  const formData = await request.formData();
  const name = formData.get("name");
  const sortOrder = formData.get("sortOrder");

  invariant(typeof name === "string", "name not found");
  invariant(typeof sortOrder === "string", "sortOrder not found");

  const errors = validateAssetClass({ name, sortOrder });

  if (hasErrors(errors)) {
    return json<AssetClassFormActionData>(
      { ok: false, errors, values: { name, sortOrder } },
      { status: 400 }
    );
  }

  await updateAssetClass({
    id: params.assetClassId,
    name,
    sortOrder: parseSortOrder(sortOrder),
    userId,
  });

  return json<AssetClassFormActionData>({ ok: true });
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.assetClassId, "assetClassId not found");
  const assetClass = await getAssetClass({ userId, id: params.assetClassId });

  if (!assetClass) throw new Response("Not Found", { status: 404 });

  return json<AssetClassFormLoaderData>({ assetClass });
};
