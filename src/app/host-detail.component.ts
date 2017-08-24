import { Component, Input } from '@angular/core';

import { SendCommandService } from './services/send-command.service';

import { Host} from './model/host';
@Component({
  selector: 'host-detail',
  templateUrl: './templates/host-detail.component.html',
  styleUrls: ['./templates/host-detail.component.css']
})
export class HostDetailComponent {
  constructor(private sendCommandService: SendCommandService) { }
    objectKeys = Object.keys; // Used in template
	@Input() host: Host;
	
	sendCommand():void {
		this.sendCommandService.sendCommandLine(this.host);
	}
	
	selectCmdline(cmdline: string):void {
		this.host.cmdline = cmdline;
		this.sendCommand();
	}
	
	registerCmdline():void {
		// ASIS : le nom du service est calculé à partir du plugins
		// TOBE : ...
		var serviceId=s4();
		this.sendCommandService.registerService(this.host,serviceId,this.host.cmdline);
	}
}

 function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
	  .toString(16)
	  .substring(1);
  }