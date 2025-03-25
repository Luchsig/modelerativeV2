import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import React from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import {ToastProvider} from "@heroui/toast";
import {ModalProvider} from "@/providers/modal-provider.tsx";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const convex = new ConvexReactClient(
    import.meta.env.VITE_CONVEX_URL as string,
  );

  if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
  }

  return (
    <ClerkProvider afterSignOutUrl="/" publishableKey={PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <HeroUIProvider navigate={navigate} useHref={useHref}>
          <ToastProvider />
          <ModalProvider />
          {children}
        </HeroUIProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
