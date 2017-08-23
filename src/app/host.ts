import { Service } from './service';

export class Host {
  name: string;
  client: string;
  alive: boolean;
  services: Service[];
  cmdline: string;
  last_stdout: string;
  last_stderr: string;
  last_time: Date;
  
  static removeServiceFrom(host:Host, id:string):void {
	  delete host.services[id];
	  host.services = Object.assign( host.services );
  }
}