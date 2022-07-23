import { Form, useActionData, useNavigate } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { PlusIcon } from "~/icons";
import type { StockErrors, StockValues } from "~/models/stock.server";
import { createStock } from "~/models/stock.server";
import { validateStock } from "~/models/stock.server";
import { requireUserId } from "~/session.server";
import { CurrencyCombobox, Input } from "~/shared/forms";
import { Modal } from "~/shared/modal";

type ActionData = {
  errors?: StockErrors;
  values?: StockValues;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const id = formData.get("id");
  const tradingCurrency = formData.get("tradingCurrency") || "";

  invariant(typeof id === "string", "id not found");
  invariant(typeof tradingCurrency === "string", "tradingCurrency not found");

  const errors = await validateStock({ id, tradingCurrency }, userId, true);

  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { id, tradingCurrency } },
      { status: 400 }
    );
  }

  await createStock({ id, tradingCurrency, userId });

  return redirect(`/settings/stocks`);
};

export default function NewStockModal() {
  const symbolInputRef = useRef(null);
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  return (
    <Modal initialFocus={symbolInputRef} onClose={onClose}>
      <Form method="post" replace>
        <Modal.Body title="New Stock" icon={PlusIcon}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <Input
              label="Symbol"
              name="id"
              id="id"
              error={actionData?.errors?.id}
              groupClassName="sm:col-span-2"
              ref={symbolInputRef}
            />
            <CurrencyCombobox
              name="tradingCurrency"
              id="tradingCurrency"
              label="Trading currency"
              error={actionData?.errors?.tradingCurrency}
              groupClassName="sm:col-span-4"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button type="submit" variant="primary">
            Save
          </Modal.Button>
          <Modal.Button
            type="button"
            onClick={onClose}
            className="mt-3 sm:mt-0"
          >
            Cancel
          </Modal.Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  function onClose() {
    navigate(-1);
  }
}
