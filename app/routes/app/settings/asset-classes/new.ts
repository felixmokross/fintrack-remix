import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  parseSortOrder,
  validateAssetClass,
} from "~/models/asset-classes.server";
import { createAssetClass } from "~/models/asset-classes.server";
import { requireUserId } from "~/session.server";
import type { AssetClassFormActionData } from "~/components/asset-classes";
import { hasErrors } from "~/utils.server";

export const loader: LoaderFunction = async () => ({});

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

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

  await createAssetClass({
    name,
    sortOrder: parseSortOrder(sortOrder),
    userId,
  });

  return json({ ok: true });
};
