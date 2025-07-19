import { TodoList, Calendar, Shortcut } from "./components";

import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className={`h-full p-2 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6`}>
      
      <div className={cn("col-span-3 h-full")}>
        <Shortcut />
      </div>
      <div className={cn("col-span-1 order-1 lg:order-2 h-full")}>
        <TodoList />
      </div>
      <div className={cn("col-span-2 order-2 lg:order-1 h-full")}>
        <Calendar />
      </div>
    </div>
  );
}
