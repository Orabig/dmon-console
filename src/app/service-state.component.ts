import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SendCommandService } from './_services/send-command.service';

import { Host } from './_models/objects/host';
import { Service } from './_models/objects/service';

@Component({
  selector: 'service-state',
  templateUrl: './templates/service-state.component.html',
  styleUrls: ['./templates/service-state.component.css']
})
export class ServiceStateComponent {
	constructor(private sendCommandService: SendCommandService) { }
	@Input() host: Host;
	@Input() service: Service;
	
	// This component sends a "cmdlineSelect" Event when the users click on the "select" button
	@Output() cmdlineSelect = new EventEmitter<string>();
	
	onSelectCmdline():void {
		this.cmdlineSelect.emit(this.service.cmdLine);
	}
	unRegister():void {
		this.sendCommandService.sendUnregister(this.host, this.service);
	}
}