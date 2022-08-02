import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type {
  StockFormActionData,
  StockFormLoaderData,
} from "~/components/stocks";
import { getStock, updateStock, validateStock } from "~/models/stocks.server";
import { requireUserId } from "~/session.server";
import { hasErrors } from "~/utils.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.stockId, "stockId not found");

  const stock = await getStock({ userId, id: params.stockId });
  if (!stock) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<StockFormLoaderData>({ stock });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.stockId, "stockId not found");

  const formData = await request.formData();
  const symbol = formData.get("symbol");
  const tradingCurrency = formData.get("tradingCurrency");

  invariant(typeof symbol === "string", "symbol not found");
  invariant(typeof tradingCurrency === "string", "tradingCurrency not found");

  const errors = validateStock({ symbol, tradingCurrency });

  if (hasErrors(errors)) {
    return json<StockFormActionData>(
      { ok: false, errors, values: { symbol, tradingCurrency } },
      { status: 400 }
    );
  }

  await updateStock({
    id: params.stockId,
    symbol,
    tradingCurrency,
    userId,
  });

  return json({ ok: true });
};
