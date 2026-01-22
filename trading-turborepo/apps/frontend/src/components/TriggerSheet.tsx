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

import type {
  TimerNodeMetadata,
  PriceTriggerMetadata,
} from "../../../../packages/common/metadata";
import { SUPPORTED_ASSETS } from "../../../../packages/common/metadata";

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
  const [selectedTrigger, setSelectedTrigger] = useState<string>("");
  
  // Timer fields
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  
  // Price trigger fields
  const [price, setPrice] = useState<number>(0);
  const [asset, setAsset] = useState<string>("");

  const calculateTotalSeconds = () => {
    return days * 86400 + hours * 3600 + minutes * 60 + seconds;
  };

  const handleSave = () => {
    if (!selectedTrigger) {
      alert("Please select a trigger type");
      return;
    }
    
    if (selectedTrigger === "timer-trigger") {
      const totalSeconds = calculateTotalSeconds();
      if (totalSeconds <= 0) {
        alert("Timer duration must be greater than 0");
        return;
      }
      onSelect(selectedTrigger as NodeKind, { time: totalSeconds });
    } else if (selectedTrigger === "price-trigger") {
      if (!price || price <= 0) {
        alert("Please enter a valid price threshold");
        return;
      }
      if (!asset) {
        alert("Please select an asset");
        return;
      }
      onSelect(selectedTrigger as NodeKind, { asset, price });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/10 text-white border-white/15 hover:bg-white/15 hover:border-white/25 shadow-lg shadow-black/10"
        >
          Add Trigger
        </Button>
      </SheetTrigger>

      <SheetContent className="space-y-6 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 border-l border-white/10">
        <SheetHeader>
          <SheetTitle className="text-slate-100 tracking-tight">
            Select a Trigger
          </SheetTitle>
          <SheetDescription>
            Configure when the workflow should run.
          </SheetDescription>
        </SheetHeader>

        {/* Trigger Type */}
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
          <Label className="text-slate-200">Trigger Type</Label>
          <Select
            value={selectedTrigger}
            onValueChange={(value) => setSelectedTrigger(value)}
          >
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-slate-100 focus:ring-2 focus:ring-indigo-400/30">
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
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <Label className="text-slate-200 text-base font-semibold">Timer Duration</Label>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Days</Label>
                <Input
                  type="number"
                  min="0"
                  className="bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400/30 text-center"
                  value={days}
                  onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Hours</Label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  className="bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400/30 text-center"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  className="bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400/30 text-center"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Seconds</Label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  className="bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400/30 text-center"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs text-slate-400">
                Total: <span className="text-slate-200 font-mono font-semibold">{calculateTotalSeconds()}</span> seconds
                {calculateTotalSeconds() > 0 && (
                  <span className="text-slate-300 ml-2">
                    ({Math.floor(calculateTotalSeconds() / 86400)}d {Math.floor((calculateTotalSeconds() % 86400) / 3600)}h {Math.floor((calculateTotalSeconds() % 3600) / 60)}m {calculateTotalSeconds() % 60}s)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedTrigger === "price-trigger" && (
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-semibold">Asset</Label>
              <Select
                value={asset}
                onValueChange={setAsset}
              >
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-slate-100 focus:ring-2 focus:ring-indigo-400/30">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SUPPORTED_ASSETS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200 text-base font-semibold">Price Threshold (USD)</Label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                className="bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400/30"
                placeholder="e.g., 0.10"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
              <div className="text-xs text-slate-400">
                Workflow will execute when {asset || "asset"} price crosses this threshold
              </div>
            </div>
          </div>
        )}

        <SheetFooter>
          <Button
            onClick={handleSave}
            disabled={!selectedTrigger}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:bg-white/10"
          >
            Save Trigger
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
