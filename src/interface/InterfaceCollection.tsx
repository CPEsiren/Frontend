export interface IDevice {
  _id: string;
  hostname: string;
  ip_address: string;
  template: string;
  snmp_port: string;
  snmp_version: string;
  snmp_community: string;
  hostgroup: string;
  details: { [key: string]: string };
  items: Item[];
  interfaces: IInterface[];
  status: number;
  authenV3: {
    username: string;
    securityLevel: string;
    authenProtocol: string;
    authenPass: string;
    privacyProtocol: string;
    privacyPass: string;
  };
}

export interface Item {
  _id: string;
  item_name: string;
  oid: string;
  type: string;
  unit: string;
  interval: number;
  isOverview: boolean;
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
  role: "superadmin" | "admin" | "viewer";
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
  expressionPart: ExpressionPart[];
  expressionRecoveryPart: RecoveryPart[];
  thresholdDuration: number;
}

export interface IEvent {
  _id: string;
  severity: string;
  hostname: string;
  status: string;
  message: string;
  timestamp: string;
  createdAt: string;
  resolvedAt: string;
  __v: number;
}

export interface ITemplate {
  _id: string;
  template_name: string;
  description: string;
  items: ItemTemplate[];
  triggers: ITriggerTemplate[];
}

export interface ITriggerTemplate {
  trigger_name: string;
  severity: string;
  expression: string;
  ok_event_generation: string;
  recovery_expression: string;
  thresholdDuration: number;
  expressionPart: ExpressionPart[];
  expressionRecoveryPart: RecoveryPart[];
}

export interface ItemTemplate {
  item_name: string;
  oid: string;
  type: string;
  unit: string;
  interval: number;
}

export interface ExpressionPart {
  item: string;
  operation: string;
  value: string;
  operator?: string; // 'and' or 'or'
  functionofItem: string;
  duration: string;
}

export interface RecoveryPart {
  item: string;
  operation: string;
  value: string;
  operator?: string; // 'and' or 'or'
  functionofItem: string;
  duration: string;
}
