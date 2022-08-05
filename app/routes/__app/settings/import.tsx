import type { AssetClass } from "@prisma/client";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Button } from "~/components/button";
import { Input } from "~/components/forms";
import { CheckCircleIcon } from "~/components/icons";
import { prisma } from "~/db.server";
import type { AccountCategory as ImportAccountCategory } from "~/import/types";
import { getDb } from "~/mongodb.server";
import { getSession, requireUserId, sessionStorage } from "~/session.server";

type ActionData = {
  error?: string;
};

type LoaderData = {
  message?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const importKey = form.get("importKey");
  if (!importKey) {
    return json({ error: "No import key provided" }, { status: 400 });
  }

  if (importKey !== process.env.IMPORT_KEY) {
    return json({ error: "Incorrect import key" }, { status: 403 });
  }

  const db = await getDb();
  const assetClasses = (
    await db
      .collection<ImportAccountCategory>("accountCategories")
      .find()
      .toArray()
  ).map<Omit<AssetClass, "id" | "createdAt" | "updatedAt">>((ac) => ({
    name: ac.name,
    sortOrder: ac.order,
    userId,
  }));

  await prisma.$transaction([
    prisma.assetClass.deleteMany({ where: { userId } }),
    prisma.assetClass.createMany({ data: assetClasses }),
  ]);

  const session = await getSession(request);
  session.flash(
    "flashMessage",
    `Imported ${assetClasses.length} asset classes`
  );

  return redirect("/settings/import", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const session = await getSession(request);
  const message = session.get("flashMessage");

  return json<LoaderData>(
    { message },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    }
  );
};

export default function ImportPage() {
  const transition = useTransition();
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <Form
      method="post"
      className="flex h-full flex-col items-center justify-center gap-4"
    >
      {loaderData.message && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {loaderData.message}
              </p>
            </div>
          </div>
        </div>
      )}
      <p className="text-sm font-medium">
        Note: all existing data will be lost!
      </p>
      <div>
        <Input
          name="importKey"
          type="password"
          label="Import key"
          groupClassName="w-80"
          error={actionData?.error}
        />
      </div>
      <Button
        variant="primary"
        type="submit"
        className="px-20 py-4 text-3xl font-light"
        disabled={transition.state === "submitting"}
      >
        Import
      </Button>
    </Form>
  );
}
