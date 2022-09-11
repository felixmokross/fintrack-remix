import type { MetaFunction } from "@remix-run/server-runtime";
import type { PropsWithChildren } from "react";
import { DetailedRadioGroup, RadioGroup } from "~/components/forms";
import { Link, NavBarLink } from "~/components/link";
import { Logo, LogoSmall } from "~/components/logo";
import { NewButton } from "~/components/new-button";
import { NewCombobox, SelectField, TextField } from "~/components/new-forms";
import { getTitle } from "~/utils";

export const meta: MetaFunction = () => ({ title: getTitle("Style Page") });

export default function StylePage() {
  return (
    <div className="flex flex-wrap gap-12 bg-slate-100 p-12">
      <Card title="Logos">
        <Logo className="h-10 w-auto" />
        <LogoSmall className="h-10 w-auto" />
      </Card>
      <Card title="Typography">
        <h1 className="font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
          This is a <span className="text-sky-600">dual color</span> hero
          heading
        </h1>
        <h2 className="text-lg font-semibold text-gray-900">
          This is a page heading
        </h2>
        <p className="max-w-2xl text-lg tracking-tight text-slate-700">
          Hero copy text goes here. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit.
        </p>
        <p className="text-sm text-gray-700">
          This is some body copy with a{" "}
          <Link to="/">link to the home page</Link>.
        </p>
      </Card>

      <Card title="Buttons">
        <div>
          <NavBarLink to="/">Nav Bar Link</NavBarLink>
        </div>
        <NewButton variant="solid" color="slate">
          Button solid slate
        </NewButton>
        <NewButton variant="solid" color="sky">
          Button solid sky
        </NewButton>
        <NewButton variant="solid" color="white">
          Button solid white
        </NewButton>
        <NewButton variant="outline" color="slate">
          Button outline slate
        </NewButton>
        <NewButton variant="outline" color="sky">
          Button outline sky
        </NewButton>
      </Card>
      <Card title="Form controls">
        <div>
          <TextField
            label="Text field"
            error="An error message"
            hint="Optional"
          />
        </div>
        <SelectField label="Select field">
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
        </SelectField>
        <div>
          <NewCombobox
            label="Combobox field"
            name="combobox"
            options={[
              { primaryText: "Option 1", value: "1", secondaryText: "one" },
              {
                primaryText: "Option 2",
                value: "2",
                secondaryText: "two",
              },
              { primaryText: "Option 3", value: "3", secondaryText: "three" },
            ]}
            helpText="Help text"
          />
        </div>
        <div>
          <RadioGroup
            label="Radio group"
            name="radioGroup"
            options={[
              { label: "Option 1", value: "1" },
              { label: "Option 2", value: "2" },
            ]}
          />
        </div>
        <div>
          <DetailedRadioGroup
            label="Radio group"
            name="radioGroup"
            options={[
              {
                label: "Option 1",
                value: "1",
                description: "Long text long text long text",
              },
              {
                label: "Option 2",
                value: "2",
                description:
                  "This text describes the second radio button option.",
              },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

function Card({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <div className="flex flex-col gap-8 rounded-xl bg-white p-8 pt-6">
      <h3 className="text-center text-xs font-medium uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <div className="flex flex-grow flex-col justify-center gap-4">
        {children}
      </div>
    </div>
  );
}
