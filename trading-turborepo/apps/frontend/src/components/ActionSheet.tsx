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

import type { TradingMetadata } from "../../../../packages/common/metadata";
import { SUPPORTED_ASSETS } from "../../../../packages/common/metadata";

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
  //   open,
  //   onClose,
  onSelect,
}: {
  //   open: boolean;
  //   onClose: () => void;
  onSelect: (kind: NodeKind, metadata: NodeMetadata) => void;
}) => {
  const [metadata, setMetadata] = useState<TradingMetadata | {}>({ qty: 0 });
  const [SelectedAction, setSelectedAction] = useState<string>("");

  return (
    <Sheet open={true}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Select Action</SheetTitle>
          <SheetDescription>
            Select the type of action
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
                Type
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
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={"long"}> LONG </SelectItem>
                      <SelectItem value={"short"}> SHORT </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            }
            {
              <div>
                Symbol
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
            <Input
              value={(metadata as TradingMetadata).qty}
              onChange={(e) =>
                setMetadata((metadata) => ({
                  ...metadata,
                  qty: Number(e.target.value),
                }))
              }
            ></Input>
          </SheetDescription>
        </SheetHeader>

        <SheetFooter>
          <button
            onClick={() => onSelect(SelectedAction as NodeKind, metadata)}
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
