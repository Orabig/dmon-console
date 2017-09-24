
// A service is the instant state of an Agent.
// it's used in the "monitor" template

export class Service {
  id: string;
  cmdLine: string;
  exit_value: number;
  stdout: string;
  last_perfdata: string;
  timestamp: Date;
}