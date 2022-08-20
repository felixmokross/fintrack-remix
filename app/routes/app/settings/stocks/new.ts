import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { createStock } from "~/models/stocks.server";
import { validateStock } from "~/models/stocks.server";
import { requireUserId } from "~/session.server";
import { hasErrors } from "~/utils.server";
import type { StockFormActionData } from "~/components/stocks";

export const loader: LoaderFunction = async () => ({});

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const symbol = formData.get("symbol");
  const tradingCurrency = formData.get("tradingCurrency") || "";

  invariant(typeof symbol === "string", "symbol not found");
  invariant(typeof tradingCurrency === "string", "tradingCurrency not found");

  const errors = validateStock({ symbol, tradingCurrency });

  if (hasErrors(errors)) {
    return json<StockFormActionData>(
      { ok: false, errors, values: { symbol, tradingCurrency } },
      { status: 400 }
    );
  }

  await createStock({ symbol, tradingCurrency, userId });

  return json({ ok: true });
};
