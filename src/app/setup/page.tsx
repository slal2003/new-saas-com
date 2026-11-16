import { AppHeader } from "@/components/app-header";
import { SetupChecklist } from "@/components/setup-checklist";
import { SiteFooter } from "@/components/site-footer";

export default function SetupPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <SetupChecklist />
      </main>
      <SiteFooter />
    </div>
  );
}
