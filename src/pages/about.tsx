import { Card } from "@heroui/react";
import { Image } from "@heroui/image";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function DocsPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-10 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>About</h1>
        </div>
        <div className="inline-block text-center justify-center">
          <div className="flex flex-row justify-center gap-5">
            <Card className={"bg-opacity-50 p-5"}>
              <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <h2 className="text-2xl font-bold">Welcome to Modelerative!</h2>
                <p className="text-lg text-left">
                  Modelerative is a collaborative tool for creating and sharing
                  diagrams. It allows users to create diagrams in real-time with
                  others, making it perfect for brainstorming sessions and team
                  projects.
                </p>
                <p className="text-lg text-left">
                  With Modelerative, you can easily create diagrams using a
                  simple and intuitive interface. Plus, you can share your
                  diagrams with others and collaborate in real-time.
                </p>
              </div>
            </Card>
            <Card className={"bg-opacity-20 border-none shadow-none p-4"}>
              <Image
                alt={"placeholder"}
                src={"/placeholder/Placeholder_1.svg"}
                width={800}
              />
              {/*<div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">*/}
              {/*  <h2 className="text-2xl font-bold">Welcome to Modelerative!</h2>*/}
              {/*  <p className="text-lg">*/}
              {/*    Modelerative is a collaborative tool for creating and sharing*/}
              {/*    diagrams. It allows users to create diagrams in real-time with*/}
              {/*    others, making it perfect for brainstorming sessions and team*/}
              {/*    projects.*/}
              {/*  </p>*/}
              {/*  <p className="text-lg">*/}
              {/*    With Modelerative, you can easily create diagrams using a*/}
              {/*    simple and intuitive interface. Plus, you can share your*/}
              {/*    diagrams with others and collaborate in real-time.*/}
              {/*  </p>*/}
              {/*</div>*/}
            </Card>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
