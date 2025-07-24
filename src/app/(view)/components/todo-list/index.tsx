"use client";

import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui";
import {  Calendar } from "lucide-react";

import { useGetUpcomingTodos } from "@/hooks/use-event";
import { useMemo } from "react";
import { EventItem } from "./event-item";





export function TodoList() {
  const { data: events = [], isLoading } = useGetUpcomingTodos();



  const sortedEvents = useMemo(() =>{
    return events.sort((a, b) => {
      // 按照 done wip todo 状态排序
      const statusOrder = {
        done: 0,
        wip: 1,
        todo: 2,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [events])

  return (
    <Card className="h-full bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          待办事项
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 待办事项列表 */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-sm text-gray-500">加载中...</div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center text-sm text-gray-500">暂无待办事项</div>
          ) : (
            sortedEvents.map((todo) => (
              <EventItem event={todo} key={todo.id} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
