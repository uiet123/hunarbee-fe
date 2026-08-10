"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import flags from "react-phone-number-input/flags";
import { getCountryOptions, type CountryCode } from "@/lib/phone";
import { cn } from "@/lib/utils";

interface CountryFieldProps {
  id: string;
  value: string;
  error?: boolean;
  onChange: (iso: string) => void;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
}

/** Dedicated country selector — drives currency + phone dial code. */
export function CountryField({ id, value, error, onChange }: CountryFieldProps) {
  const options = useMemo(() => getCountryOptions(), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = options.find((item) => item.iso === value) ?? null;
  const Flag = value ? flags[value as CountryCode] : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return options;
    return options.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.iso.toLowerCase().includes(q) ||
        item.dial.replace("+", "").includes(q) ||
        item.dial.includes(q)
    );
  }, [options, query]);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const width = Math.min(
      Math.max(rect.width, 280),
      window.innerWidth - 24
    );
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUp = spaceBelow < 260 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(280, Math.max(160, openUp ? spaceAbove : spaceBelow));

    let left = rect.left;
    if (left + width > window.innerWidth - 12) {
      left = window.innerWidth - width - 12;
    }
    if (left < 12) left = 12;

    setPos({
      top: openUp ? rect.top - gap : rect.bottom + gap,
      left,
      width,
      maxHeight,
      openUp,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onReposition = () => updatePosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setQuery("");
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
    if (!open) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-navy/20 bg-surface px-4 py-3 text-left text-sm text-navy shadow-[0_1px_2px_rgba(11,18,32,0.04)] transition-[border-color,box-shadow] duration-200 hover:border-honey/40 focus:border-honey focus:outline-none focus:ring-4 focus:ring-honey/20",
          open && "border-honey ring-4 ring-honey/20",
          error && "border-red-400"
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {Flag ? (
            <span className="flex h-4 w-[1.4rem] shrink-0 overflow-hidden rounded-[2px] border border-navy/10">
              <Flag title={selected?.name ?? value} />
            </span>
          ) : null}
          <span className="truncate font-medium">
            {selected ? (
              selected.name
            ) : (
              <span className="text-slate/60">Select country</span>
            )}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate transition-transform duration-200",
            open && "rotate-180 text-navy"
          )}
        />
      </button>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open && pos ? (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "fixed",
                    top: pos.openUp ? undefined : pos.top,
                    bottom: pos.openUp
                      ? window.innerHeight - pos.top
                      : undefined,
                    left: pos.left,
                    width: pos.width,
                    zIndex: 9999,
                  }}
                  className="overflow-hidden rounded-2xl border border-navy/10 bg-surface-elevated shadow-[var(--shadow-lift)]"
                >
                  <div className="border-b border-navy/8 p-2">
                    <input
                      ref={searchRef}
                      type="text"
                      value={query}
                      maxLength={40}
                      placeholder="Search country or code"
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full rounded-xl border-2 border-navy/15 bg-surface px-3 py-2 text-sm text-navy outline-none placeholder:text-slate/50 focus:border-honey focus:ring-4 focus:ring-honey/15"
                      aria-label="Search country"
                    />
                  </div>

                  <ul
                    id={listId}
                    role="listbox"
                    data-lenis-prevent
                    style={{ maxHeight: pos.maxHeight }}
                    className="overflow-y-auto overscroll-contain p-1.5 [-webkit-overflow-scrolling:touch]"
                  >
                    {filtered.length === 0 ? (
                      <li className="px-3 py-3 text-sm text-slate">
                        No countries found
                      </li>
                    ) : (
                      filtered.map((item) => {
                        const ItemFlag = flags[item.iso];
                        const isSelected = item.iso === value;
                        return (
                          <li
                            key={item.iso}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <button
                              type="button"
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                                isSelected
                                  ? "bg-honey/20 font-semibold text-navy"
                                  : "font-medium text-navy hover:bg-honey/10"
                              )}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                onChange(item.iso);
                                setOpen(false);
                                setQuery("");
                              }}
                            >
                              {ItemFlag ? (
                                <span className="flex h-4 w-[1.4rem] shrink-0 overflow-hidden rounded-[2px] border border-navy/10">
                                  <ItemFlag title={item.name} />
                                </span>
                              ) : null}
                              <span className="min-w-0 flex-1 truncate">
                                {item.name}
                              </span>
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
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
