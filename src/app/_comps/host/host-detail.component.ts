import { Component, Input } from '@angular/core';

import { SendCommandService } from '../../_services/send-command.service';

import { Host} from '../../_models/objects/host';

@Component({
  selector: 'host-detail',
  templateUrl: './host-detail.component.html',
  styleUrls: ['./host-detail.component.css']
})
export class HostDetailComponent {
  constructor(private sendCommandService: SendCommandService) { }
    objectKeys = Object.keys; // Used in template
	@Input() host: Host;
	
	// Send a request to client to execute the command line (stored in the host object)
	sendCommand():void {
		this.sendCommandService.sendCommandLine(this.host);
	}
	
	// Fills the field 'cmdline' with the given string, then send a command request
	selectCmdline(cmdline: string):void {
		this.host.cmdline = cmdline;
		this.sendCommand();
	}
	
	registerCmdline():void {
		// ASIS : le nom du service est calculé à partir du plugins
		// TOBE : ...
		var serviceId=s4();
		this.sendCommandService.sendRegister(this.host,serviceId,this.host.cmdline);
	}
}

 function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
	  .toString(16)
	  .substring(1);
  }