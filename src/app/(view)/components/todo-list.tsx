"use client";

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Calendar } from "lucide-react";
import type { EventResponse } from "./calendar/hooks/use-events";

interface TodoItem {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  color: string;
}

export function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    color: "blue"
  });

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const events = await invoke<EventResponse[]>("get_all_events");
      setTodos(events);
    } catch (error) {
      console.error("获取待办事项失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.title.trim()) return;
    
    try {
      const todo = await invoke<EventResponse>("create_event", {
        request: {
          title: newTodo.title,
          description: newTodo.description,
          start_date: new Date(newTodo.start_date).toISOString(),
          end_date: new Date(newTodo.end_date).toISOString(),
          color: newTodo.color,
        },
      });
      setTodos(prev => [...prev, todo]);
      setNewTodo({
        title: "",
        description: "",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        color: "blue"
      });
    } catch (error) {
      console.error("添加待办事项失败:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const success = await invoke<boolean>("delete_event", { id });
      if (success) {
        setTodos(prev => prev.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error("删除待办事项失败:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          待办事项
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 添加新待办事项 */}
        <div className="space-y-2">
          <Input
            placeholder="输入标题..."
            value={newTodo.title}
            onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <Input
            placeholder="输入描述..."
            value={newTodo.description}
            onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={newTodo.start_date}
              onChange={(e) => setNewTodo(prev => ({ ...prev, start_date: e.target.value }))}
            />
            <Input
              type="date"
              value={newTodo.end_date}
              onChange={(e) => setNewTodo(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>
          <Button onClick={addTodo} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            添加待办事项
          </Button>
        </div>

        {/* 待办事项列表 */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center text-sm text-gray-500">加载中...</div>
          ) : todos.length === 0 ? (
            <div className="text-center text-sm text-gray-500">暂无待办事项</div>
          ) : (
            todos.map((todo) => (
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
