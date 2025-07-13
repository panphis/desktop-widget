"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, CheckCircle2, Circle } from "lucide-react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim() !== "") {
      const todo: Todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setTodos([...todos, todo]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="h-full">
      <Card className="shadow-lg h-full flex flex-col bg-transparent">
        <CardHeader className="text-center flex-shrink-0">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            我的待办清单
          </CardTitle>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
            <Badge variant="outline" className="text-xs sm:text-sm">
              总计: {totalCount}
            </Badge>
            <Badge
              variant="default"
              className="text-xs sm:text-sm bg-green-600"
            >
              已完成: {completedCount}
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              待完成: {totalCount - completedCount}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* 添加新任务 */}
          <div className="flex gap-2 flex-shrink-0">
            <Input
              type="text"
              placeholder="添加新的待办事项..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTodo();
                }
              }}
              className="flex-1"
            />
            <Button onClick={addTodo} className="px-3 sm:px-4">
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">添加</span>
            </Button>
          </div>

          {/* 任务列表 */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            {todos.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <Circle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <p className="text-base sm:text-lg">暂无待办事项</p>
                <p className="text-xs sm:text-sm">添加一个新任务开始吧！</p>
              </div>
            ) : (
              todos.map((todo) => (
                <Card
                  key={todo.id}
                  className={`transition-all duration-200 hover:shadow-md ${
                    todo.completed
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Checkbox
                        id={`todo-${todo.id}`}
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                        className="h-4 w-4 sm:h-5 sm:w-5"
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`flex-1 cursor-pointer text-xs sm:text-sm font-medium transition-all ${
                          todo.completed
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {todo.text}
                      </label>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xs text-gray-400 hidden sm:block">
                          {todo.createdAt.toLocaleDateString("zh-CN")}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTodo(todo.id)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 进度条 */}
          {totalCount > 0 && (
            <div className="mt-4 flex-shrink-0">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                <span>完成进度</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
