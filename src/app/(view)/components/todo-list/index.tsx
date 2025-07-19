"use client";
 
import {
  Button,
  Card, CardContent, CardHeader, CardTitle, Badge
} from "@/components/ui";
import { Trash2,  Calendar } from "lucide-react"; 

import { useGetUpcomingEvents, useDeleteEvent } from "@/hooks/use-event";



export function TodoList() { 
  const { data: events = [], isLoading } = useGetUpcomingEvents();


  const { mutateAsync: deleteEvent } = useDeleteEvent();


  const deleteTodo = async (id: number) => {
    await deleteEvent(id);
  };


  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colorMap[color] || colorMap.gray;
  };

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
          ) : events.length === 0 ? (
            <div className="text-center text-sm text-gray-500">暂无待办事项</div>
          ) : (
            events.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{todo.title}</h4>
                    <Badge className={getColorClass(todo.color)} variant="secondary">
                      {todo.color}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {todo.description}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(todo.start_date).toLocaleDateString()} - {new Date(todo.end_date).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
