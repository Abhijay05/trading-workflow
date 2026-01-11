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
export const SUPPORTED_ASSETS = ["SOL", "BTC", "ETH"];

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
              value={selectedTrigger}
              onValueChange={(value) => {
                setSelectedTrigger(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a trigger" />
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
          <div className="grid gap-3"></div>
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
