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
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  password: string;
  role: string;
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
  hostname?: string;
  severity: string;
  valuetrigger: number;
  ComparisonOperator: string;
  createdAt: string;
  enabled: boolean;
}

export interface IEvent {
  _id: string;
  trigger_id: {
    host_id: {
      _id: string;
      hostname: string;
    };
  };
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
