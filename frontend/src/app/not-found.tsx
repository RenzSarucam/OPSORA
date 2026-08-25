import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <Image src="/opsora-icon.png" alt="" width={40} height={40} className="h-10 w-10 opacity-70" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />}>Back to Dashboard</Button>
    </div>
  );
}