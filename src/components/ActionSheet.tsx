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
import { SUPPORTED_ASSETS } from "./TriggerSheet";

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

export const ActionSheet = ({
  onSelect,
}: {
  onSelect: (kind: NodeKind, metadata: NodeMetadata) => void;
}) => {
  const [metadata, setMetadata] = useState<TradingMetadata | {}>({});
  const [SelectedAction, setSelectedAction] = useState<string>("");

  return (
    <Sheet>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Select Action</SheetTitle>
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

            {
              <div>
                <Select
                  value={metadata.type}
                  onValueChange={(value) => {
                    setMetadata((metadata) => ({
                      ...metadata,
                      type: value,
                    }));
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={"long"}> LONG </SelectItem>;
                      <SelectItem value={"short"}> SHORT </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            }
            {
              <div>
                <Select
                  value={metadata.symbol}
                  onValueChange={(value) => {
                    setMetadata((metadata) => ({
                      ...metadata,
                      symbol: value,
                    }));
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SUPPORTED_ASSETS.map((asset) => (
                        <SelectItem key={asset} value={asset}>
                          {asset}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            }
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-name">Name</Label>
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
