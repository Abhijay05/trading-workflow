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

import type { TimerNodeMetadata } from "common/types";
import type { PriceTriggerMetadata } from "common/types";

const SUPPORTED_TRIGGERS: {
  id: Extract<NodeKind, "price-trigger" | "timer-trigger">;
  title: string;
  description: string;
}[] = [
  {
    id: "timer-trigger",
    title: "Timer",
    description: "run this every x seconds",
  },
  {
    id: "price-trigger",
    title: "Price Trigger",
    description: "run this whenever price crosses x",
  },
];

export const TriggerSheet = ({
  onSelect,
}: {
  onSelect: (kind: NodeKind, metadata: NodeMetadata) => void;
}) => {
  const [metadata, setMetadata] = useState<
    TimerNodeMetadata | PriceTriggerMetadata
  >({
    time: 3600,
  });
  const [selectedTrigger, setSelectedTrigger] = useState<string>("");

  const handleSave = () => {
    if (!selectedTrigger) return;
    onSelect(selectedTrigger as NodeKind, metadata);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Add Trigger</Button>
      </SheetTrigger>

      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Select a Trigger</SheetTitle>
          <SheetDescription>
            Configure when the workflow should run.
          </SheetDescription>
        </SheetHeader>

        {/* Trigger Type */}
        <div className="space-y-2">
          <Label>Trigger Type</Label>
          <Select
            value={selectedTrigger}
            onValueChange={(value) => setSelectedTrigger(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose trigger type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SUPPORTED_TRIGGERS.map(({ id, title }) => (
                  <SelectItem key={id} value={id}>
                    {title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Metadata */}
        {selectedTrigger === "timer-trigger" && (
          <div className="space-y-2">
            <Label>Timer Duration (seconds)</Label>
            <Input
              type="number"
              value={String((metadata as TimerNodeMetadata).time)}
              onChange={(e) =>
                setMetadata((metadata) => ({
                  ...metadata,
                  time: Number(e.target.value),
                }))
              }
            />
          </div>
        )}

        {selectedTrigger === "price-trigger" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Price Threshold</Label>
              <Input
                type="number"
                onChange={(e) =>
                  setMetadata((meta) => ({
                    ...meta,
                    price: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select
                onValueChange={(value) =>
                  setMetadata((meta) => ({
                    ...meta,
                    asset: value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select asset" />
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
          </div>
        )}

        <SheetFooter>
          <Button
            onClick={handleSave}
            disabled={!selectedTrigger}
            className="w-full"
          >
            Save Trigger
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
