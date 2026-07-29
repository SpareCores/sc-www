import { dark } from "@clerk/ui/themes";

export const CLERK_APPEARANCE = {
  theme: dark,
  captcha: { theme: "dark" as const },
  variables: {
    colorPrimary: "#34D399",
    colorPrimaryForeground: "#ffffff",
    colorSuccess: "#14B8A6",
    colorWarning: "#EAB308",
    colorDanger: "#EF4444",
    colorBackground: "#082F49",
    colorMuted: "#0C4A6E",
    colorForeground: "#ffffff",
    colorMutedForeground: "#9ca3af",
    colorInput: "#06263a",
    colorInputForeground: "#ffffff",
    colorNeutral: "#ffffff",
    colorRing: "#34D399",
    colorBorder: "#0C4A6E",
    colorModalBackdrop: "rgba(0, 0, 0, 0.5)",
    borderRadius: "0.5rem",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontFamilyMono: "Roboto Mono, ui-monospace, monospace",
  },
};

export const CLERK_TEXTS = {
  signIn: {
    start: {
      title: "Sign in to Spare Cores",
      titleCombined: "Sign in to Spare Cores",
      subtitle: "Welcome back!",
      subtitleCombined: "Welcome back!",
      actionText: "Don't have an account?",
      actionLink: "Register!",
    },
  },
  signUp: {
    start: {
      actionText: "Already have an account?",
      actionLink: "Log in",
    },
    continue: {
      actionText: "Already have an account?",
      actionLink: "Log in",
    },
  },
} as const;
