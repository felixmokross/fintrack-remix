import type { ActionFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { createAssetClass } from "~/models/asset-class.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    name?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const sortOrder = formData.get("sortOrder");

  // TODO collect validation errors
  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    );
  }

  if (typeof sortOrder !== "string" || sortOrder.length === 0) {
    return json<ActionData>(
      { errors: { name: "Sort order is required" } },
      { status: 400 }
    );
  }

  const parsedSortOrder = parseInt(sortOrder, 10);
  if (isNaN(parsedSortOrder)) {
    return json<ActionData>(
      { errors: { name: "Sort order must be an integer" } },
      { status: 400 }
    );
  }

  await createAssetClass({ name, sortOrder: parsedSortOrder, userId });

  return redirect(`/asset-classes`);
};

// Dummy route for routable modal
export default function NewPage() {
  return null;
}
