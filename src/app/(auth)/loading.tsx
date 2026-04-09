import { FullPageLoader } from "@/components/ui";

export default function AuthLoading() {
  return <FullPageLoader loading label="Preparing secure access..." size="lg" variant="secondary" />;
}
