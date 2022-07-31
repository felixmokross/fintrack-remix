import type { AccountType, AccountUnit } from "@prisma/client";
import type { LoaderFunction, ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type {
  AccountFormActionData,
  AccountFormLoaderData,
} from "~/components/accounts";
import { getAccountGroupListItems } from "~/models/account-group.server";
import { getAccount, getAccountValues } from "~/models/account.server";
import { updateAccount } from "~/models/account.server";
import { validateAccount } from "~/models/account.server";
import { getAssetClassListItems } from "~/models/asset-class.server";
import { getStockListItems } from "~/models/stock.server";
import { requireUserId } from "~/session.server";
import { hasErrors, parseDecimal, parseDate } from "~/utils.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.accountId, "accountId not found");

  const account = await getAccount({ userId, id: params.accountId });
  if (!account) throw new Response("Not Found", { status: 404 });

  return json<AccountFormLoaderData>({
    assetClasses: await getAssetClassListItems({ userId }),
    accountGroups: await getAccountGroupListItems({ userId }),
    stocks: await getStockListItems({ userId }),
    account,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(typeof params.accountId === "string", "accountId not found");
  const values = await getAccountValues(request);
  const errors = validateAccount(values);
  if (hasErrors(errors)) {
    return json<AccountFormActionData>(
      { ok: false, errors, values },
      { status: 400 }
    );
  }

  await updateAccount({
    id: params.accountId,
    name: values.name,
    type: values.type as AccountType,
    assetClassId: values.assetClassId,
    groupId: values.groupId,
    unit: values.unit as AccountUnit,
    currency: values.currency,
    stockId: values.stockId,
    preExisting: values.preExisting === "on",
    balanceAtStart: values.balanceAtStart
      ? parseDecimal(values.balanceAtStart)
      : null,
    openingDate: values.openingDate ? parseDate(values.openingDate) : null,
    userId,
  });

  return json({ ok: true });
};
