"use client";

import { useCalendar } from "../contexts/calendar-context";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

export function ChangeBadgeVariantInput() {
  const { badgeVariant, setBadgeVariant } = useCalendar();

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">修改标记样式</p>

      <Select value={badgeVariant} onValueChange={setBadgeVariant}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="dot">点</SelectItem>
          <SelectItem value="colored">着色</SelectItem>
          <SelectItem value="mixed">混合</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
