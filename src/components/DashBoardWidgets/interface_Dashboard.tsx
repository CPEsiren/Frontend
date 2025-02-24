// API response interfaces
export interface DashboardLayout {
  id: string;
  name: string;
  components: ActiveComponentWithGraph[];
}
export interface APIComponent {
  id: string;
  position: number;
  componentType: string;
  graphSelection?: {
    itemId: string;
    hostId: string;
  };
  todoItems: {
    id: string;
    text: string;
    completed: boolean;
  };
  _id: string;
}

export interface APIDashboard {
  _id: string;
  dashboard_name: string;
  user_id: string;
  isDefault: boolean;
  components: APIComponent[];
  isViewer: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ComponentConfig {
  id: string;
  name: string;
  icon: JSX.Element;
  component: React.ComponentType<any>;
  defaultSize: {
    xs: number;
    sm?: number;
    md?: number;
  };
  height: string;
  allowMultiple: boolean;
  todoItems?: TodoItem[]; // Add this line if needed
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export interface GraphSelection {
  itemId: string;
  hostId: string;
}

export interface ActiveComponentWithGraph {
  id: string;
  position: number;
  componentType?: string;
  graphSelection?: GraphSelection;
  todoItems?: TodoItem[]; // Add this line
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}
