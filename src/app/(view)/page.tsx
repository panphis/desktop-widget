import { TodoList, Calendar } from "./components";
import {
  ResponsiveLayout,
  ResponsiveGrid,
  ResponsiveColumn,
} from "@/components/layout";

export default function Home() {
  return (
    <ResponsiveLayout>
      <ResponsiveGrid>
        <ResponsiveColumn className="col-span-1 order-1 lg:order-2">
          <TodoList />
        </ResponsiveColumn>

        <ResponsiveColumn className="col-span-2 order-2 lg:order-1">
          <Calendar />
        </ResponsiveColumn>
      </ResponsiveGrid>
    </ResponsiveLayout>
  );
}
