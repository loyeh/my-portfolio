"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/content/site.config";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line text-ink-soft"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-16 z-40 border-b border-line bg-paper px-6 py-6"
          >
            <nav className="flex flex-col gap-4">
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-mono text-sm uppercase tracking-wide text-ink-soft hover:text-brass"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 border-t border-line pt-6">
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
