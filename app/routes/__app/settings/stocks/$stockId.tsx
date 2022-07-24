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
import { useRef } from "react";
import invariant from "tiny-invariant";
import { PencilIcon } from "~/icons";
import type { StockErrors, StockValues } from "~/models/stock.server";
import { getStock, updateStock, validateStock } from "~/models/stock.server";
import { requireUserId } from "~/session.server";
import { CurrencyCombobox, Input } from "~/shared/forms";
import { Modal } from "~/shared/modal";

type ActionData = {
  errors?: StockErrors;
  values?: StockValues;
};

type LoaderData = {
  stock: NonNullable<Awaited<ReturnType<typeof getStock>>>;
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.stockId, "stockId not found");

  const formData = await request.formData();
  const tradingCurrency = formData.get("tradingCurrency");

  invariant(typeof tradingCurrency === "string", "tradingCurrency not found");

  const errors = await validateStock(
    { id: params.stockId, tradingCurrency },
    userId,
    false
  );

  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { id: params.stockId, tradingCurrency } },
      { status: 400 }
    );
  }

  await updateStock({
    id: params.stockId,
    tradingCurrency,
    userId,
  });

  return redirect(`/settings/stocks`);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.stockId, "stockId not found");
  const stock = await getStock({
    userId,
    id: params.stockId,
  });
  if (!stock) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ stock });
};

export default function EditPage() {
  const { stock } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const tradingCurrencyRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useTransition();
  const disabled = state !== "idle";
  return (
    <Modal initialFocus={tradingCurrencyRef} onClose={onClose}>
      <Form method="post" replace>
        <fieldset disabled={disabled}>
          <Modal.Body title="Edit Stock" icon={PencilIcon}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <Input
                label="Symbol"
                name="id"
                defaultValue={actionData?.values?.id || stock.id}
                disabled={true}
                error={actionData?.errors?.id}
                groupClassName="sm:col-span-2"
              />
              <CurrencyCombobox
                name="tradingCurrency"
                label="Trading currency"
                error={actionData?.errors?.tradingCurrency}
                defaultValue={
                  actionData?.values?.tradingCurrency || stock.tradingCurrency
                }
                groupClassName="sm:col-span-4"
                ref={tradingCurrencyRef}
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
