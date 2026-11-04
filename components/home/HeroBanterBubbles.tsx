import React from "react";
import { Badge } from "@/components/ui/Badge";

export function HeroBanterBubbles() {
  return (
    <>
      {/* Top Left Floating Sticker: High score brag */}
      <div className="hidden lg:flex absolute -left-12 top-4 z-10 animate-bounce [animation-duration:4s] select-none pointer-events-none">
        <div className="bg-white border-2 border-[#36D399] rounded-2xl p-3 shadow-[4px_4px_0px_#FFD4B3] rotate-[-6deg] max-w-[210px] space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">👑</span>
            <span className="text-[11px] font-black uppercase text-[#1EAA78]">
              Sarah • 10/10 Score
            </span>
          </div>
          <p className="text-[11px] font-bold text-[var(--text-primary)] leading-tight">
            &ldquo;Telepathic connection! We share one braincell 💫&rdquo;
          </p>
        </div>
      </div>

      {/* Top Right Floating Sticker: Savage roast */}
      <div className="hidden lg:flex absolute -right-12 top-10 z-10 animate-bounce [animation-duration:5s] [animation-delay:1s] select-none pointer-events-none">
        <div className="bg-white border-2 border-[#FF6B8A] rounded-2xl p-3 shadow-[4px_4px_0px_#FFD4B3] rotate-[5deg] max-w-[200px] space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">😭</span>
            <span className="text-[11px] font-black uppercase text-[#FF6B8A]">
              Jake • 20% Score
            </span>
          </div>
          <p className="text-[11px] font-bold text-[var(--text-primary)] leading-tight">
            &ldquo;Caught in 4K! Do we only talk during exams? 😂&rdquo;
          </p>
        </div>
      </div>

      {/* Bottom Left Floating Sticker: Viral stat */}
      <div className="hidden xl:flex absolute -left-20 bottom-12 z-10 select-none pointer-events-none">
        <div className="bg-[#FFB830] text-[#2D1B0E] border-2 border-[#E09800] rounded-2xl px-3.5 py-2 shadow-[4px_4px_0px_#FFD4B3] rotate-[3deg] flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <div className="text-left">
            <span className="block text-[10px] font-black uppercase leading-none">
              Group Chat Clout
            </span>
            <span className="text-xs font-black">
              1.4M+ Friends Tested 💕
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
