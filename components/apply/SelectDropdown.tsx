"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  /** Allow typing in the field to filter options (no separate search box) */
  searchable?: boolean;
}

/**
 * Brand-styled select that stays inside the page layout.
 * Optional searchable mode types directly in the field — not a second input.
 */
export function SelectDropdown({
  id,
  value,
  options,
  placeholder = "Select an option",
  error,
  onChange,
  maxMenuHeight = 220,
  searchable = false,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
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
    const needed = Math.min(
      filteredOptions.length * 44 + 16,
      maxMenuHeight + 16
    );

    setDropUp(spaceBelow < needed && spaceAbove > spaceBelow);
  }, [open, maxMenuHeight, filteredOptions.length]);

  useEffect(() => {
    if (open && searchable) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
  }, [open, searchable]);

  const stopNestedScroll = (event: React.WheelEvent | React.TouchEvent) => {
    event.stopPropagation();
  };

  const displayValue =
    open && searchable ? query : selected?.label ?? "";

  const selectOption = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full min-w-0", open ? "z-50" : "z-10")}
    >
      {searchable ? (
        <div
          className={cn(
            "flex w-full min-w-0 items-center gap-2 rounded-2xl border-2 border-navy/20 bg-surface px-4 py-3 shadow-[0_1px_2px_rgba(11,18,32,0.04)] transition-[border-color,box-shadow,background-color] duration-200",
            open && "border-honey bg-surface-elevated ring-4 ring-honey/20",
            error && "border-red-400"
          )}
        >
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            placeholder={placeholder}
            value={displayValue}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (value) onChange("");
            }}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate/55",
              displayValue ? "font-medium text-navy" : "text-slate/55"
            )}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Toggle options"
            className="shrink-0 text-slate"
            onClick={() => {
              setOpen((prev) => !prev);
              if (!open) inputRef.current?.focus();
            }}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                open && "rotate-180 text-navy"
              )}
            />
          </button>
        </div>
      ) : (
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
      )}

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
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-3 text-sm text-slate">No matches found</li>
            ) : (
              filteredOptions.map((option) => {
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
                      onClick={() => selectOption(option.value)}
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
              })
            )}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
