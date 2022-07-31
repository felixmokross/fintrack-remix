import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { PencilIcon } from "~/components/icons";
import type {
  AccountGroupErrors,
  AccountGroupValues,
} from "~/models/account-groups.server";
import {
  getAccountGroup,
  validateAccountGroup,
} from "~/models/account-groups.server";
import { updateAccountGroup } from "~/models/account-groups.server";
import { requireUserId } from "~/session.server";
import { Input } from "~/components/forms";
import { Modal } from "~/components/modal";

type ActionData = {
  errors?: AccountGroupErrors;
  values?: AccountGroupValues;
};

type LoaderData = {
  accountGroup: NonNullable<Awaited<ReturnType<typeof getAccountGroup>>>;
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.accountGroupId, "accountGroupId not found");

  const formData = await request.formData();
  const name = formData.get("name");

  invariant(typeof name === "string", "name not found");

  const errors = validateAccountGroup({ name });

  if (Object.values(errors).length > 0) {
    return json<ActionData>({ errors, values: { name } }, { status: 400 });
  }

  await updateAccountGroup({
    id: params.accountGroupId,
    name,
    userId,
  });

  return redirect(`/settings/account-groups`);
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
  return json<LoaderData>({ accountGroup });
};

export default function EditPage() {
  const { accountGroup } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const { state } = useTransition();
  const disabled = state !== "idle";
  return (
    <Modal onClose={onClose}>
      <Form method="post" replace>
        <fieldset disabled={disabled}>
          <Modal.Body title="Edit Account Group" icon={PencilIcon}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <Input
                label="Name"
                name="name"
                error={actionData?.errors?.name}
                defaultValue={actionData?.values?.name || accountGroup.name}
                groupClassName="sm:col-span-6"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button type="submit" variant="primary">
              {state !== "idle" ? "Saving…" : "Save"}
            </Modal.Button>
            <Modal.Button
              type="button"
              onClick={onClose}
              className="mt-3 sm:mt-0"
            >
              Cancel
            </Modal.Button>
          </Modal.Footer>
        </fieldset>
      </Form>
    </Modal>
  );

  function onClose() {
    navigate(-1);
  }
}
