import { Form, useLoaderData, useTransition } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Button } from "~/components/button";
import { Combobox, CurrencyCombobox } from "~/components/forms";
import { CheckCircleIcon } from "~/components/icons";
import { prisma } from "~/db.server";
import { getLocales } from "~/locales.server";
import { getSession, requireUserId, sessionStorage } from "~/session.server";

type LoaderData = {
  user: { preferredLocale: string; refCurrency: string };
  message?: string;
  locales: [string, string][];
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const form = await request.formData();

  const preferredLocale = form.get("preferredLocale");
  invariant(typeof preferredLocale === "string", "preferredLocale is required");

  const refCurrency = form.get("refCurrency");
  invariant(typeof refCurrency === "string", "refCurrency is required");

  await prisma.user.update({
    where: { id: userId },
    data: { preferredLocale, refCurrency },
  });

  const session = await getSession(request);
  session.flash("flashMessage", "Preferences have been saved");

  return redirect("/settings/preferences", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferredLocale: true, refCurrency: true },
  });
  if (!user) return new Response("Not found", { status: 404 });

  const session = await getSession(request);
  const message = session.get("flashMessage");

  return json<LoaderData>(
    { user, message, locales: await getLocales() },
    { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } }
  );
};

export default function Preferences() {
  const transition = useTransition();
  const { user, message, locales } = useLoaderData<LoaderData>();
  const disabled = transition.state !== "idle";
  return (
    <Form method="post">
      <fieldset disabled={disabled}>
        <div className="mx-auto flex max-w-sm flex-col gap-4">
          {message && (
            <div className="rounded-md bg-emerald-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon
                    className="h-5 w-5 text-emerald-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-emerald-800">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}
          <Combobox
            label="Preferred locale"
            name="preferredLocale"
            defaultValue={user.preferredLocale}
            options={locales.map(([locale, localeName]) => ({
              primaryText: localeName,
              secondaryText: locale,
              value: locale,
            }))}
          />
          <CurrencyCombobox
            label="Reference currency"
            name="refCurrency"
            defaultValue={user.refCurrency}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </div>
      </fieldset>
    </Form>
  );
}
