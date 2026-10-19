'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Watermelon pagination (ui.watermelon.sh/animated-components/pagination), on the preset.
// Changed for the toybox: Lucide arrows, theme colors, and a `label` for each page in place of the
// rolling "3 of 10" digits. The whole label rolls in the direction of travel. `ai` tints a page's label.

export interface PaginationProps {
  totalPages?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (page: number) => void;
  label?: (page: number) => string;
  ai?: (page: number) => boolean;
}

const labelVariants = {
  initial: (dir: number) => ({ y: dir > 0 ? 20 : -20, opacity: 0, scale: 0.5, filter: 'blur(2px)' }),
  animate: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ y: dir > 0 ? -20 : 20, opacity: 0, scale: 0.5, filter: 'blur(2px)' }),
};

const arrow =
  'flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground shadow-soft transition-colors duration-200 hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-foreground';

export function Pagination({
  totalPages = 15,
  value,
  defaultValue = 1,
  onChange,
  label = page => `${page} of ${totalPages}`,
  ai = () => false,
}: PaginationProps) {
  const isControlled = value !== undefined;
  const [internalPage, setInternalPage] = React.useState(defaultValue);
  const currentPage = isControlled ? value! : internalPage;

  // Roll in the direction the page moved, also when the page changes from outside (playback, the wheel).
  const [last, setLast] = React.useState(currentPage);
  const [direction, setDirection] = React.useState(0);
  if (last !== currentPage) {
    setDirection(currentPage > last ? 1 : -1);
    setLast(currentPage);
  }

  const paginate = (dir: number) => {
    const next = Math.min(totalPages, Math.max(1, currentPage + dir));
    if (next === currentPage) return;
    if (!isControlled) setInternalPage(next);
    onChange?.(next);
  };

  const text = label(currentPage);

  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/90 p-1 shadow-soft backdrop-blur-md">
      <motion.button whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        onClick={() => paginate(-1)} disabled={currentPage === 1} aria-label="Previous timeframe" className={arrow}>
        <ArrowLeft className="h-4 w-4" />
      </motion.button>

      <div className="relative flex h-7 min-w-36 items-center justify-center overflow-hidden px-1 select-none" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.span key={text} custom={direction} variants={labelVariants} initial="initial" animate="animate" exit="exit"
            transition={{ type: 'spring', stiffness: 200, damping: 16, mass: 1.2 }}
            className="font-heading text-sm font-semibold whitespace-nowrap">
            {/* The roll animates filter (blur), so the AI glow sits on an inner span. */}
            <span className={ai(currentPage) ? 'ai-text ai-glow' : 'text-foreground'}>{text}</span>
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        onClick={() => paginate(1)} disabled={currentPage === totalPages} aria-label="Next timeframe" className={arrow}>
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
