'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export interface ContextualAIBarProps {
  defaultExpanded?: boolean;
  placeholder?: string;
  tools?: React.ReactNode[];
  musicIcon: React.ReactNode;
  sparkleIcon: React.ReactNode;
  // Toybox additions: a controlled input that submits, and a width override.
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
  className?: string;
}

export const ContextualAIBar: React.FC<ContextualAIBarProps> = ({
  defaultExpanded = false,
  placeholder = 'Refine with AI',
  tools = [],
  musicIcon,
  sparkleIcon,
  value,
  onValueChange,
  onSubmit,
  submitDisabled,
  submitLabel = 'Send',
  className = 'sm:max-w-md',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  // Toybox: one layout id per bar, so two bars on a page cannot share the pill (issue #22).
  const pillId = React.useId();

  const spring = {
    type: 'spring',
    stiffness: 220,
    damping: 16,
    mass: 1.2,
  } as const;

  return (
    <motion.div
      layout
      transition={spring}
      className={`relative flex w-full max-w-[calc(100vw-32px)] items-center justify-between overflow-hidden rounded-full border border-border/30 bg-muted p-1 shadow-sm ${className}`}
    >
      <motion.div
        layout
        className="flex shrink-0 items-center gap-1 rounded-full bg-card p-1 shadow-md "
      >
        <motion.button
          onClick={() => setIsExpanded(false)}
          whileTap={{ scale: 0.9 }}
          className="relative rounded-full p-2.5 outline-none"
        >
          {!isExpanded && (
            <motion.div
              layoutId={pillId}
              transition={spring}
              className="absolute inset-0 rounded-full bg-secondary "
            />
          )}

          <div className="relative z-10">{musicIcon}</div>
        </motion.button>

        <motion.button
          onClick={() => setIsExpanded(true)}
          whileTap={{ scale: 0.9 }}
          className="relative rounded-full p-2.5 outline-none"
        >
          {isExpanded && (
            <motion.div
              layoutId={pillId}
              transition={spring}
              className="absolute inset-0 rounded-full bg-secondary "
            />
          )}

          <div className="relative z-10">{sparkleIcon}</div>
        </motion.button>
      </motion.div>

      <AnimatePresence mode="popLayout" initial={false}>
        {!isExpanded ? (
          <motion.div
            key="tools"
            initial={{ opacity: 0, filter: 'blur(4px)', x: 22 }}
            animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
            exit={{ opacity: 0, filter: 'blur(4px)', x: 30 }}
            transition={spring}
            className="flex flex-1 items-center justify-end gap-3 px-4 sm:gap-5"
          >
            {tools.map((tool, index) => (
              <ToolIcon key={index}>{tool}</ToolIcon>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="flex flex-1 items-center gap-1 pl-2 sm:gap-2 sm:pl-4"
          >
            <input
              autoFocus
              type="text"
              placeholder={placeholder}
              aria-label={placeholder}
              value={value}
              onChange={event => onValueChange?.(event.target.value)}
              onKeyDown={event => { if (event.key === 'Enter' && !submitDisabled) onSubmit?.() }}
              className="w-full flex-1 border-none bg-transparent text-lg text-foreground placeholder:text-muted-foreground outline-none sm:text-xl"
            />

            <motion.button
              onClick={onSubmit}
              disabled={submitDisabled}
              aria-label={submitLabel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={spring}
              className="shrink-0 disabled:opacity-50 rounded-full border border-border bg-card p-2.5 text-foreground shadow-md hover:bg-muted sm:p-3"
            >
              <ArrowRight
                size={20}
                className="sm:h-[22px] sm:w-[22px]"
                strokeWidth={2.5}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ToolIcon = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.92 }}
    transition={{
      type: 'spring',
      stiffness: 300,
      damping: 26,
      mass: 1.1,
    }}
    className="cursor-pointer text-foreground "
  >
    {children}
  </motion.div>
);
