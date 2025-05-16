import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shadow-sm">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <Image
          src="https://www.codeigniter.com/assets/icons/ci-logo.png"
          alt="CodeIgniter Logo"
          width={24}
          height={24}
        />
        <h1 className="text-xl font-semibold text-foreground">
          CodeIgniter Studio
        </h1>
      </div>
      {/* Add User menu or other header items here if needed */}
    </header>
  );
}
