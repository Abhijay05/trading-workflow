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
    id: "swap",
    title: "Swap",
    description: "Execute swap on Cronos via x402",
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
      <SheetContent className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 border-l border-white/10">
        <SheetHeader>
          <SheetTitle className="text-slate-100 tracking-tight">Select Action</SheetTitle>
          <SheetDescription className="text-slate-400">
            Configure what happens when the trigger fires
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <Label className="text-slate-200 text-base font-semibold">Action Type</Label>
            <Select
              value={SelectedAction}
              onValueChange={(value) => {
                setSelectedAction(value);
              }}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-slate-100 focus:ring-2 focus:ring-indigo-400/30">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SUPPORTED_ACTIONS.map(({ id, title, description }) => (
                    <SelectItem key={id} value={id}>
                      <div>
                        <div className="font-medium">{title}</div>
                        <div className="text-xs text-slate-400">{description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <Label className="text-slate-200 text-base font-semibold">Direction</Label>
            <Select
              value={(metadata as TradingMetadata).type}
              onValueChange={(value) => {
                setMetadata((meta) => ({
                  ...meta,
                  type: value as "LONG" | "SHORT",
                }));
              }}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-slate-100 focus:ring-2 focus:ring-indigo-400/30">
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="LONG">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">↑</span>
                      <span>BUY (LONG)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="SHORT">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">↓</span>
                      <span>SELL (SHORT)</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <Label className="text-slate-200 text-base font-semibold">Asset</Label>
            <Select
              value={(metadata as TradingMetadata).symbol}
              onValueChange={(value) => {
                setMetadata((meta) => ({
                  ...meta,
                  symbol: value,
                }));
              }}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-slate-100 focus:ring-2 focus:ring-indigo-400/30">
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

          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <Label className="text-slate-200 text-base font-semibold">Quantity (USDC.e)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 50"
              className="bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400/30"
              value={(metadata as TradingMetadata).qty || ""}
              onChange={(e) =>
                setMetadata((meta) => ({
                  ...meta,
                  qty: Number(e.target.value) || 0,
                }))
              }
            />
            <div className="text-xs text-slate-400">
              Amount to swap in USDC.e (6 decimals)
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button
            onClick={() => {
              if (!SelectedAction) {
                alert("Please select an action type");
                return;
              }
              if (!(metadata as TradingMetadata).type || !(metadata as TradingMetadata).qty) {
                alert("Please fill in all fields");
                return;
              }
              onSelect(SelectedAction as NodeKind, metadata as TradingMetadata);
            }}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20"
          >
            Save Action
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="bg-white/10 border-white/15 text-white hover:bg-white/15">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
