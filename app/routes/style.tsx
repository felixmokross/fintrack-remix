import type { MetaFunction } from "@remix-run/server-runtime";
import { Container } from "~/components/container";
import { Link, NavBarLink } from "~/components/link";
import { Logo, LogoSmall } from "~/components/logo";
import { NewButton } from "~/components/new-button";
import { NewCombobox, SelectField, TextField } from "~/components/new-forms";
import { getTitle } from "~/utils";

export const meta: MetaFunction = () => ({ title: getTitle("Style Page") });

export default function StylePage() {
  return (
    <Container className="flex flex-col gap-8 py-10">
      <div className="flex gap-8">
        <Logo className="h-10 w-auto" />
        <LogoSmall className="h-10 w-auto" />
      </div>
      <h1 className="font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
        This is a <span className="text-sky-600">dual color</span> hero heading
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
        <Link to="/" className="font-medium text-sky-600 hover:underline">
          link to the home page
        </Link>
        .
      </p>
      <div className="flex gap-8">
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
      </div>
      <div className="flex gap-8">
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
      </div>
    </Container>
  );
}
