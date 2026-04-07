import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthWrapper } from "./AuthWrapper";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button variant="ghost" className="dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white backdrop-blur-md bg-white/5 border border-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content Container with Animations */}
      <AuthWrapper>
        {children}
      </AuthWrapper>
    </div>
  );
}
