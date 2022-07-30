import type { AccountType, AccountUnit } from "@prisma/client";
import type { LoaderFunction, ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type {
  AccountFormActionData,
  AccountFormLoaderData,
} from "~/components/accounts";
import { getAccountGroupListItems } from "~/models/account-group.server";
import { getAccount } from "~/models/account.server";
import { updateAccount } from "~/models/account.server";
import { validateAccount } from "~/models/account.server";
import { getAssetClassListItems } from "~/models/asset-class.server";
import { getStockListItems } from "~/models/stock.server";
import { requireUserId } from "~/session.server";
import { parseDate, parseDecimal } from "~/shared/util";

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

  invariant(typeof params.accountId === "string", "accountId not found");
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
    return json<AccountFormActionData>(
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

  await updateAccount({
    id: params.accountId,
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
