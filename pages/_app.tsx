import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";

const clerkAppearance = {
  variables: {
    colorPrimary: "#89b4fa", // TUI blue
    colorPrimaryText: "#1e1e2e", // Terminal bg for button text
    colorBackground: "#1e1e2e", // Terminal bg
    colorText: "#cdd6f4", // Light text
    colorInputBackground: "#181825", // Input bg
    colorInputText: "#cdd6f4", // Input text
    colorInputBorder: "#89b4fa", // Input border
    colorDanger: "#f38ba8", // Error color
    colorSuccess: "#a6e3a1", // Success color
    colorAlphaShade: "#313244", // Overlay shade
  },
  elements: {
    card: "tui-panel",
    formButtonPrimary: "tui-button",
    input: "tui-input",
    socialButtonsBlockButton: "tui-button tui-button-social",
    footer: "tui-footer",
    headerTitle: "tui-panel-header",
    headerSubtitle: "tui-panel-header",
    formFieldLabel: "tui-label",
    formFieldInput: "tui-input",
    formFieldHintText: "tui-hint",
    formFieldErrorText: "tui-error",
    identityPreviewText: "tui-label",
    userButtonPopoverCard: "tui-panel",
    userButtonPopoverActionButton: "tui-button",
  },
};

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
