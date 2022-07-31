import {
  Form,
  useActionData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { PlusIcon } from "~/components/icons";
import type { StockErrors, StockValues } from "~/models/stocks.server";
import { createStock } from "~/models/stocks.server";
import { validateStock } from "~/models/stocks.server";
import { requireUserId } from "~/session.server";
import { CurrencyCombobox, Input } from "~/components/forms";
import { Modal } from "~/components/modal";

type ActionData = {
  errors?: StockErrors;
  values?: StockValues;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const symbol = formData.get("symbol");
  const tradingCurrency = formData.get("tradingCurrency") || "";

  invariant(typeof symbol === "string", "symbol not found");
  invariant(typeof tradingCurrency === "string", "tradingCurrency not found");

  const errors = validateStock({ symbol, tradingCurrency });

  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { symbol, tradingCurrency } },
      { status: 400 }
    );
  }

  await createStock({ symbol, tradingCurrency, userId });

  return redirect(`/settings/stocks`);
};

export default function NewStockModal() {
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  const { state } = useTransition();
  const disabled = state !== "idle";
  return (
    <Modal onClose={onClose}>
      <Form method="post" replace>
        <fieldset disabled={disabled}>
          <Modal.Body title="New Stock" icon={PlusIcon}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <Input
                label="Symbol"
                name="symbol"
                error={actionData?.errors?.symbol}
                defaultValue={actionData?.values?.symbol}
                groupClassName="sm:col-span-2"
              />
              <CurrencyCombobox
                name="tradingCurrency"
                label="Trading currency"
                error={actionData?.errors?.tradingCurrency}
                defaultValue={actionData?.values?.tradingCurrency}
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
        </fieldset>
      </Form>
    </Modal>
  );

  function onClose() {
    navigate(-1);
  }
}
