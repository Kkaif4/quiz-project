"use client";
import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

import { FAQ_ITEMS, FaqItem } from "@/lib/faq";

import { cn } from "@/lib/utils";

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "group card-cozy rounded-2xl overflow-hidden transition-all duration-300",
        isOpen
          ? "border-[var(--accent-plum)]/40 ring-1 ring-[var(--accent-plum)]/20 shadow-xs"
          : "border-transparent",
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 min-h-[56px] cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
      >
        <span className="font-bold text-sm sm:text-base text-[var(--text-primary)] leading-snug">
          {item.question}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-xl bg-[var(--accent-plum)]/10 border border-[var(--accent-plum)]/20 flex items-center justify-center shrink-0 text-[var(--accent-plum)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen ? "rotate-180" : "",
          )}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* Smooth CSS Grid + Opacity animation (UI-002) */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none",
        )}
      >
        <div className="overflow-hidden min-h-0">
          <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]/60">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  return (
    <section className="space-y-6 pt-4 max-w-2xl mx-auto w-full">
      <div className="text-center space-y-2">
        <div className="pill-badge">
          <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-plum)]" />
          <span>Got Questions?</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] max-w-md mx-auto">
          Everything you need to know about creating, sharing, and playing
          LemonQuiz with your close circle.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {FAQ_ITEMS.map((item, index) => (
          <FaqAccordionItem key={index} item={item} />
        ))}
      </div>
    </section>
  );
}
