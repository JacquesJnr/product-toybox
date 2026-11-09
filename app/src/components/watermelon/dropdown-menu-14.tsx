'use client';

import { useState } from 'react';
import { HiSquares2X2, HiStar, HiPlus, HiCog6Tooth } from 'react-icons/hi2';
import { HiChevronUpDown } from 'react-icons/hi2';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HiCheck } from 'react-icons/hi';

// Watermelon dropdown-menu-14, the workspace switcher. Changed to take the workspaces
// (for Quantum State: the boards a director sits on) and to shrink to the monogram in a rail.
export type Workspace = { id: number; name: string; plan: string; members: number; icon: string }

const DropdownMenu14 = ({ workspaces, compact = false, title = 'Workspaces', note = 'Switch between your workspaces', members = 'members', create = 'Create Workspace', manage = 'Manage Workspaces' }: { workspaces: Workspace[]; compact?: boolean; title?: string; note?: string; members?: string; create?: string; manage?: string }) => {
  const [selected, setSelected] = useState(workspaces[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={compact ? "grid size-9 place-items-center rounded-md" : "bg-secondary flex w-full items-center gap-3 rounded-lg px-2 py-2"}>
        <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold">
          {selected.icon}
        </div>

        {!compact && <>
          <div className="flex min-w-0 flex-1 flex-col text-left leading-tight">
            <span className="truncate text-sm font-semibold">{selected.name}</span>
            <span className="text-muted-foreground truncate text-xs">{selected.plan}</span>
          </div>
          <HiChevronUpDown className="size-5 shrink-0 text-muted-foreground" />
        </>}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[320px] rounded-lg p-2">
        <div className="px-2 py-2">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-muted-foreground text-xs">
            {note}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2 text-xs">
          <HiStar className="size-4" />
          Recent
        </DropdownMenuLabel>

        {[selected].map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => setSelected(ws)}
            className="hover:bg-accent/50! flex items-center gap-3 rounded-lg p-2"
          >
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold">
              {ws.icon}
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium">{ws.name}</span>
              <span className="text-muted-foreground text-xs">
                {ws.members} {members}
              </span>
            </div>

            {selected.id === ws.id && (
              <HiCheck className="text-primary ml-auto size-4" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2 text-xs">
          <HiSquares2X2 className="size-4" />
          All {title.toLowerCase()}
        </DropdownMenuLabel>

        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => setSelected(ws)}
            className="hover:bg-accent/50! flex items-center gap-3 rounded-lg p-2"
          >
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold">
              {ws.icon}
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium">{ws.name}</span>
              <span className="text-muted-foreground text-xs">{ws.plan}</span>
            </div>

            <span className="text-muted-foreground ml-auto text-xs">
              {ws.members}
            </span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="hover:bg-accent/50! flex items-center gap-2 rounded-lg p-2">
          <HiPlus className="size-4" />
          {create}
        </DropdownMenuItem>

        <DropdownMenuItem className="hover:bg-accent/50! flex items-center gap-2 rounded-lg p-2">
          <HiCog6Tooth className="size-4" />
          {manage}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownMenu14;
