import { Service } from './service';

export class Host {
  name: string;
  client: string;
  alive: boolean;
  
  // This is not an array, but a hash (ID:string -> Service)
  services: Service[];
  
  // Transcient properties
  last_message_time: Date;
  cmdline: string;
  last_stdout: string;
  last_stderr: string;
  last_time: Date;
  
  static removeServiceFrom(host:Host, id:string):void {
	  delete host.services[id];
	  host.services = Object.assign( host.services );
  }
  
  static addServiceTo(host:Host, id:string,cmdline:string):void {
	  if (!host.services) host.services = [];
	  host.services[id]=new Service();
	  host.services[id].id = id;
	  host.services[id].cmdLine = cmdline;
	  host.services = Object.assign( host.services );
  }
}