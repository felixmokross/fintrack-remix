import type { AccountType, AccountUnit } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getAccountGroupListItems } from "~/models/account-group.server";
import type { AccountErrors, AccountValues } from "~/models/account.server";
import { validateAccount } from "~/models/account.server";
import { createAccount } from "~/models/account.server";
import { getAssetClassListItems } from "~/models/asset-class.server";
import { getStockListItems } from "~/models/stock.server";
import { requireUserId } from "~/session.server";
import { parseDate, parseDecimal } from "~/shared/util";

export type LoaderData = {
  assetClasses: Awaited<ReturnType<typeof getAssetClassListItems>>;
  accountGroups: Awaited<ReturnType<typeof getAccountGroupListItems>>;
  stocks: Awaited<ReturnType<typeof getStockListItems>>;
};

export type ActionData = {
  errors?: AccountErrors;
  values?: AccountValues;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json<LoaderData>({
    assetClasses: await getAssetClassListItems({ userId }),
    accountGroups: await getAccountGroupListItems({ userId }),
    stocks: await getStockListItems({ userId }),
  });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const type = formData.get("type");
  const assetClassId = formData.get("assetClassId");
  const groupId = formData.get("groupId");
  const unit = formData.get("unit");
  const currency = formData.get("currency");
  const stockId = formData.get("stockId");
  const preExisting = formData.get("preExisting");
  const balanceAtStart = formData.get("balanceAtStart");
  const openingDate = formData.get("openingDate");

  invariant(typeof name === "string", "name not found");
  invariant(typeof type === "string", "type not found");
  invariant(
    !assetClassId || typeof assetClassId === "string",
    "assetClassId not found"
  );
  invariant(typeof groupId === "string", "groupId not found");
  invariant(typeof unit === "string", "unit not found");
  invariant(!currency || typeof currency === "string", "currency not found");
  invariant(!stockId || typeof stockId === "string", "stockId not found");
  invariant(
    preExisting === "off" || preExisting === "on",
    "preExisting not found"
  );
  invariant(
    !balanceAtStart || typeof balanceAtStart === "string",
    "balanceAtStart not found"
  );
  invariant(
    !openingDate || typeof openingDate === "string",
    "openingDate not found"
  );

  const errors = validateAccount({
    name,
    type,
    assetClassId,
    groupId,
    unit,
    currency,
    stockId,
    preExisting,
    balanceAtStart,
    openingDate,
  });
  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      {
        errors,
        values: {
          name,
          type,
          assetClassId,
          groupId,
          unit,
          currency,
          stockId,
          preExisting,
          balanceAtStart,
          openingDate,
        },
      },
      { status: 400 }
    );
  }

  await createAccount({
    name,
    type: type as AccountType,
    assetClassId,
    groupId,
    unit: unit as AccountUnit,
    currency,
    stockId,
    userId,
    preExisting: preExisting === "on",
    balanceAtStart: balanceAtStart ? parseDecimal(balanceAtStart) : null,
    openingDate: openingDate ? parseDate(openingDate) : null,
  });

  return redirect(`/accounts`);
};
