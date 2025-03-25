import {Link} from "@heroui/link";
import {button as buttonStyles} from "@heroui/theme";

import {siteConfig} from "@/config/site";
import {subtitle, title} from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import {GithubIcon} from "lucide-react";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Make&nbsp;</span>
          <span className={title({ color: "violet" })}>professional&nbsp;</span>
          <br />
          <span className={title()}>
            diagrams.
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            Expandable and customizable modeling tool for your team's needs.
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={siteConfig.links.github}
          >
            <GithubIcon size={20} />
            GitHub
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}
