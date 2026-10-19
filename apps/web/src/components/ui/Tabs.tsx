import React from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeId, onChange, className = "" }: TabsProps) {
  return (
    <div className={`border-b border-[var(--border)] ${className}`} role="tablist">
      <nav className="flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Kit Views">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap relative cursor-pointer ${
                isActive
                  ? "text-[var(--accent)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                      isActive
                        ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                        : "bg-[var(--subtle-bg)] text-[var(--text-muted)]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
