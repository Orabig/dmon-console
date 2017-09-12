import { Service } from './service';

export class Host {
  id: string;
  name: string;
  client: string; // TODO : cette information ne devrait PAS apparaitre ici. L'ID du client Centrifugo ne devrait être connue que du serveur !!!!!
  alive: boolean;
  
  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
  
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
  
  static registerService(host:Host, id:string,cmdline:string):void {
	  if (!host.services) host.services = [];
	  var service = new Service();
	  service.id = id;
	  service.cmdLine = cmdline;
	  service.last_output = '(registered. Waiting for data)';
	  service.last_time = new Date();
	  host.services[id]=service;
	  host.services = Object.assign( host.services );
  }
  
  static addServiceFromMessage(host:Host, message: any):void {
	  if (!host.services) host.services = [];
	  var serviceId = message.data['id'];
	  var service = new Service();
	  service.id=serviceId;
	  service.cmdLine=message.data['cmdline'];
	  service.last_value=message.data['exit_value'];
	  service.last_output=message.data['stdout'][0];
	  if (service.last_output) {
	  	var split = service.last_output.split("|");
	  	service.last_output = split[0];
	  	service.last_perfdata = split[1];
	  	service.last_time = new Date();
	  }
	  if (!host.services) {
	  	host.services = [];
	  }
	  host.services[serviceId] = service;
	  host.services = Object.assign( host.services );
  }
}