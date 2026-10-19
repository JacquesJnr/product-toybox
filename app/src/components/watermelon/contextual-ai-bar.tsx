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
}

export const ContextualAIBar: React.FC<ContextualAIBarProps> = ({
  defaultExpanded = false,
  placeholder = 'Refine with AI',
  tools = [],
  musicIcon,
  sparkleIcon,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

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
      className="relative flex w-full max-w-[calc(100vw-32px)] items-center justify-between overflow-hidden rounded-full border border-border/30 bg-muted p-1 shadow-sm sm:max-w-md"
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
              layoutId="active-pill"
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
              layoutId="active-pill"
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
              className="w-full flex-1 border-none bg-transparent text-lg text-foreground placeholder:text-muted-foreground outline-none sm:text-xl"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={spring}
              className="shrink-0 rounded-full border border-border bg-card p-2.5 text-foreground shadow-md hover:bg-muted sm:p-3"
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
