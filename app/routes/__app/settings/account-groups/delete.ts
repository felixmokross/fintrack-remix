import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { deleteAccountGroup } from "~/models/account-groups.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    id?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return json<ActionData>(
      { errors: { id: "ID is required" } },
      { status: 400 }
    );
  }

  await deleteAccountGroup({ id, userId });

  return redirect(`/settings/account-groups`);
};
