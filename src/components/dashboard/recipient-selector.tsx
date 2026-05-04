
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Recipient } from "@/lib/types";

interface RecipientSelectorProps {
  allRecipients: Recipient[];
  selectedRecipients: string[];
  onChange: (selectedIds: string[]) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function RecipientSelector({
  allRecipients,
  selectedRecipients,
  onChange,
  isLoading,
  disabled,
}: RecipientSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const selectedSet = new Set(selectedRecipients);

  const handleSelect = (recipientId: string) => {
    const newSelected = new Set(selectedSet);
    if (newSelected.has(recipientId)) {
      newSelected.delete(recipientId);
    } else {
      newSelected.add(recipientId);
    }
    onChange(Array.from(newSelected));
  };

  const selectedRecipientDetails = React.useMemo(() => {
    return allRecipients.filter((r) => selectedSet.has(r.id));
  }, [allRecipients, selectedSet]);
  
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedRecipientDetails.length > 0
                ? `${selectedRecipientDetails.length} destinatário(s) selecionado(s)`
                : "Selecione os destinatários..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Buscar destinatário..." />
            <CommandList>
                <CommandEmpty>Nenhum destinatário encontrado.</CommandEmpty>
                <CommandGroup>
                {allRecipients.map((recipient) => (
                    <CommandItem
                    key={recipient.id}
                    value={recipient.name}
                    onSelect={() => handleSelect(recipient.id)}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        selectedSet.has(recipient.id) ? "opacity-100" : "opacity-0"
                        )}
                    />
                    <div className="flex flex-col">
                        <span className="font-medium">{recipient.name}</span>
                        <span className="text-xs text-muted-foreground">{recipient.email}</span>
                    </div>
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedRecipientDetails.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedRecipientDetails.map((recipient) => (
            <Badge
              key={recipient.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {recipient.name}
              <button
                type="button"
                onClick={() => handleSelect(recipient.id)}
                className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={`Remover ${recipient.name}`}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
