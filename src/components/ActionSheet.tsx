import { useState } from "react";
import type { NodeKind, NodeMetadata } from "./CreateWorkflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { TimerNodeMetadata } from "../nodes/triggers/Timer";
import type { PriceTriggerMetadata } from "../nodes/triggers/PriceTrigger";
import type { TradingMetadata } from "@/nodes/actions/Lighter";

export const SUPPORTED_ACTIONS = [
  {
    id: "hyperliquid",
    title: "Hyperliquid",
    description: "Place a trade on Hyperliquid",
  },
  {
    id: "lighter",
    title: "Lighter",
    description: "Place a trade on Lighter",
  },
  {
    id: "backpack",
    title: "Backpack",
    description: "Send a Backpack transaction",
  },
];

export const TriggerSheet = ({
  onSelect,
}: {
  onSelect: (kind: NodeKind, metadata: NodeMetadata) => void;
}) => {
  const [metadata, setMetadata] = useState<TradingMetadata | null>(null);
  const [SelectedAction, setSelectedAction] = useState<string>("");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Add trigger</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Select trigger</SheetTitle>
          <SheetDescription>
            <Select
              value={SelectedAction}
              onValueChange={(value) => {
                setSelectedAction(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SUPPORTED_ACTIONS.map(({ id, title }) => (
                    <SelectItem key={id} value={id}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {selectedTrigger === "timer-trigger" && (
              <div>
                Number of seconds after which to run the timer
                <Input
                  value={String((metadata as TimerNodeMetadata).time)}
                  onChange={(e) =>
                    setMetadata((metadata) => ({
                      ...metadata,
                      time: Number(e.target.value),
                    }))
                  }
                ></Input>
              </div>
            )}

            {selectedTrigger === "price-trigger" && (
              <div>
                Price:
                <Input
                  type="text"
                  onChange={(e) =>
                    setMetadata((m) => ({
                      ...m,
                      price: Number(e.target.value),
                    }))
                  }
                ></Input>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SUPPORTED_ASSETS.map((id) => (
                        <SelectItem key={id} value={id}>
                          {id}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-name">Name</Label>
            <Input
              id="sheet-demo-name"
              placeholder="My trigger"
              onChange={(e) =>
                setMetadata((prev: NodeMetadata) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <SheetFooter>
          <button
            onClick={() => onSelect(selectedTrigger as NodeKind, metadata)}
          >
            saveTrigger
          </button>

          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
