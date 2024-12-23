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
  status: number;
}

export interface Item {
  _id: string;
  item_name: string;
  oid: string;
  type: string;
  unit: string;
}

export interface IInterface {
  ImacAddress: string;
  Intname: string | null;
  ipAddress: string | null;
  speed: number;
  status: boolean;
  DMACaddress: string;
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

export interface ITrigger {
  trigger_name: string;
  enabled: boolean;
  severity: string;
  valuetrigger: number;
  comparisonOperator: string;
  createAt: string;
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
