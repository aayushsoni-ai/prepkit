import React, { useEffect, useRef, useState } from "react";

export interface PopoverProps {
  trigger: React.ReactNode;
  content: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function Popover({ trigger, content, align = "left", className = "" }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="inline-block cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className={`absolute top-full mt-2 z-40 bg-[var(--card-bg)] border border-[var(--border)] rounded-md shadow-lg p-4 min-w-[240px] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {content(() => setIsOpen(false))}
        </div>
      )}
    </div>
  );
}
