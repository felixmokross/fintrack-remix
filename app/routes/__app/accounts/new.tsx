import type { AccountType, AccountUnit } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import type {
  AccountFormActionData,
  AccountFormLoaderData,
} from "~/components/accounts";
import { getAccountGroupListItems } from "~/models/account-group.server";
import { getAccountValues, validateAccount } from "~/models/account.server";
import { createAccount } from "~/models/account.server";
import { getAssetClassListItems } from "~/models/asset-class.server";
import { getStockListItems } from "~/models/stock.server";
import { requireUserId } from "~/session.server";
import { hasErrors, parseDate, parseDecimal } from "~/shared/util";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json<AccountFormLoaderData>({
    assetClasses: await getAssetClassListItems({ userId }),
    accountGroups: await getAccountGroupListItems({ userId }),
    stocks: await getStockListItems({ userId }),
  });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const values = await getAccountValues(request);
  const errors = validateAccount(values);

  if (hasErrors(errors)) {
    return json<AccountFormActionData>({ errors, values }, { status: 400 });
  }

  await createAccount({
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

  return redirect(`/accounts`);
};
