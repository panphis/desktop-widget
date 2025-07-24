export type TodoStatus = 'todo' | 'wip' | 'done' | null;

export interface Todo {
  id: number;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  color?: string;
  status?: TodoStatus;
}

export interface TodoCreate {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  color?: string;
  status?: TodoStatus;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  color?: string;
  status?: TodoStatus;
}
