"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function WorkspaceNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  const links = [
    { name: "طاولة الحلقة", href: `/research/${projectId}/desk` },
    { name: "غرفة البحث والتوثيق", href: `/research/${projectId}/room` },
    { name: "اللقاء التمهيدي", href: `/research/${projectId}/pre-interview` },
    { name: "المراجعة", href: `/research/${projectId}/review` },
    { name: "موجز المقدّم", href: `/research/${projectId}/presenter` },
  ];

  return (
    <nav className="flex items-center gap-space-xs overflow-x-auto pb-2 -mb-2">
      {links.map(link => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-space-md py-space-xs rounded font-label-md transition-colors whitespace-nowrap ${
              isActive 
                ? "bg-surface-elevated text-text-ivory border-b-2 border-b-accent-acid" 
                : "text-text-muted hover:text-text-ivory hover:bg-surface-elevated"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
