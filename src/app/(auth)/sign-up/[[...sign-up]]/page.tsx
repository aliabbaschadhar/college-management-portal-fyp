import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <SignUp 
      appearance={{
        baseTheme: dark,
        elements: {
          card: "bg-zinc-950/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl flex flex-col items-center",
          headerTitle: "text-white font-bold",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all w-full",
          socialButtonsBlockButtonText: "text-zinc-200",
          formButtonPrimary: "bg-primary w-full hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
          formFieldLabel: "text-zinc-300",
          formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20 transition-all",
          footerActionText: "text-zinc-400",
          footerActionLink: "text-primary hover:text-primary/90 hover:underline",
          dividerLine: "bg-white/10",
          dividerText: "text-zinc-500",
          identityPreviewText: "text-zinc-300",
          identityPreviewEditButtonIcon: "text-primary hover:text-primary/90",
          formFieldSuccessText: "text-emerald-400",
          formFieldErrorText: "text-red-400",
        },
        variables: {
          colorBackground: "transparent",
          colorInputBackground: "transparent",
          colorInputText: "white",
          colorText: "white",
        }
      }}
    />
  );
}
