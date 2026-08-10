"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  id: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  onChange: (value: string) => void;
  /** Max visible panel height before scrolling */
  maxMenuHeight?: number;
}

/** Brand-styled select that stays inside the page layout. */
export function SelectDropdown({
  id,
  value,
  options,
  placeholder = "Select an option",
  error,
  onChange,
  maxMenuHeight = 220,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !rootRef.current) return;

    const rect = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const needed = Math.min(options.length * 44 + 16, maxMenuHeight + 16);

    setDropUp(spaceBelow < needed && spaceAbove > spaceBelow);
  }, [open, maxMenuHeight, options.length]);

  const stopNestedScroll = (event: React.WheelEvent | React.TouchEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full min-w-0", open ? "z-50" : "z-10")}
    >
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border-2 border-navy/20 bg-surface px-4 py-3 text-left text-sm shadow-[0_1px_2px_rgba(11,18,32,0.04)] outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-navy/30",
          open && "border-honey bg-surface-elevated ring-4 ring-honey/20",
          error && "border-red-400",
          selected ? "text-navy" : "text-slate/55"
        )}
      >
        <span className="truncate font-medium">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate transition-transform duration-200",
            open && "rotate-180 text-navy"
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={listId}
            role="listbox"
            aria-labelledby={id}
            data-lenis-prevent
            onWheel={stopNestedScroll}
            onTouchMove={stopNestedScroll}
            initial={{ opacity: 0, y: dropUp ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxHeight: maxMenuHeight }}
            className={cn(
              "absolute left-0 right-0 z-[60] w-full min-w-0 overflow-y-auto overscroll-contain rounded-2xl border border-navy/10 bg-surface-elevated p-1.5 shadow-[var(--shadow-lift)] [-webkit-overflow-scrolling:touch]",
              dropUp ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]"
            )}
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-honey/20 font-semibold text-navy"
                        : "font-medium text-navy hover:bg-honey/10"
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <Check
                        className="h-4 w-4 shrink-0 text-honey-deep"
                        strokeWidth={2.5}
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
