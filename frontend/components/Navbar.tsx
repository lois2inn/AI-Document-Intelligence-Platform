"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Documents", href: "/documents" },
  { label: "Upload", href: "/upload" },
  { label: "Semantic Search", href: "/search" },
  { label: "Ask AI", href: "/ask" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="border-b bg-white">
       <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          AI Document Intelligence Platform
        </Link>

        <div className="flex flex-wrap gap-2 md:gap-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
                
            return (
            <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}