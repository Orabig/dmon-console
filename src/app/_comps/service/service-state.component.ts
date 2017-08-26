import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SendCommandService } from '../../_services/send-command.service';

import { Host, Service } from '../../_models/objects';

@Component({
  selector: 'service-state',
  templateUrl: './service-state.component.html',
  styleUrls: ['./service-state.component.css']
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