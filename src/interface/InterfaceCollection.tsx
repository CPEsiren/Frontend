export interface IDevice {
  _id: string;
  hostname: string;
  ip_address: string;
  snmp_port: string;
  snmp_version: string;
  snmp_community: string;
  hostgroup: string;
  details: { [key: string]: string };
  items: Item[];
  interfaces: IInterface[];
  status: number;
}

export interface Item {
  _id: string;
  item_name: string;
  oid: string;
  type: string;
  unit: string;
  interval: number;
}

export interface IInterface {
  _id: string;
  interface_name: string;
  interface_type: string;
  interface_speed: string;
  interface_Adminstatus: string;
  interface_Operstatus: string;
}

export interface IAlert {
  problem: string;
  problemStatus: boolean;
  alertDetail: string | null;
  area: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface IUser {
  _id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  username: string;
  role: "superdamin" | "admin" | "viewer";
  phone: string;
  isActive: boolean;
  picture?: string;
}

export interface IGraph {
  GID: string;
  DMACaddress: string;
  name: string | null;
  detail: string | null;
}

export interface DataEntry {
  timestamp: string;
  value: string;
  Change_per_second: string;
}

export interface ITrigger {
  _id: string;
  trigger_name: string;
  host_id: string;
  severity: string;
  expression: string;
  logicExpression: string[];
  isExpressionValid: boolean;
  items: [string, string][];
  ok_event_generation: string;
  recovery_expression: string;
  logicRecoveryExpression: string[];
  isRecoveryExpressionValid: boolean;
  enabled: boolean;
  createdAt: string;
  expressionPart: {
    item: string;
    operation: string;
    value: string;
    operator: string;
    functionofItem: string;
    duration: number;
  }[];
  expressionRecoveryPart: {
    item: string;
    operation: string;
    value: string;
    operator: string;
    functionofItem: string;
    duration: number;
  }[];
}

export interface IEvent {
  _id: string;
  severity: string;
  hostname: string;
  status: string;
  message: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ITemplate {
  _id: string;
  template_name: string;
  description: string;
  items: Item[];
}
