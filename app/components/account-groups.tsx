import type {
  AccountGroupErrors,
  AccountGroupValues,
  getAccountGroup,
} from "~/models/account-groups.server";
import type { SerializeType } from "~/utils";
import { Input, useFormModalFetcher } from "./forms";
import { PencilIcon, PlusIcon } from "./icons";
import { Modal } from "./modal";

export type AccountGroupFormLoaderData = {
  accountGroup?: NonNullable<Awaited<ReturnType<typeof getAccountGroup>>>;
};

export type AccountGroupFormActionData = {
  ok: boolean;
  errors?: AccountGroupErrors;
  values?: AccountGroupValues;
};

export function AccountGroupFormModal({
  open,
  data: { accountGroup },
  onClose,
}: AccountGroupFormModalProps) {
  const action = useFormModalFetcher<AccountGroupFormActionData>(onClose);

  const disabled = action.state !== "idle";
  return (
    <Modal open={open} onClose={onClose}>
      <action.Form
        method="post"
        action={accountGroup ? `${accountGroup.id}/edit` : "new"}
      >
        <fieldset disabled={disabled}>
          <Modal.Body
            title={accountGroup ? "Edit Account Group" : "New Account Group"}
            icon={accountGroup ? PencilIcon : PlusIcon}
          >
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <Input
                label="Name"
                name="name"
                error={action.data?.errors?.name}
                defaultValue={action.data?.values?.name || accountGroup?.name}
                groupClassName="sm:col-span-6"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button type="submit" variant="primary">
              {action.state !== "idle" ? "Saving…" : "Save"}
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
      </action.Form>
    </Modal>
  );
}

export type AccountGroupFormModalProps = {
  open: boolean;
  data: SerializeType<AccountGroupFormLoaderData>;
  onClose: () => void;
};
