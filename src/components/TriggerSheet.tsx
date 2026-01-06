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
  const [metadata, setMetadata] = useState<NodeMetadata>({});

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
              onValueChange={(value) =>
                onSelect(value as NodeKind, metadata)
              }
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
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
