import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SendCommandService } from './services/send-command.service';

import { Host } from './model/host';
import { Service } from './model/service';

@Component({
  selector: 'service-state',
  templateUrl: './templates/service-state.component.html',
  styleUrls: ['./templates/service-state.component.css']
})
export class ServiceStateComponent {
	constructor(private sendCommandService: SendCommandService) { }
	@Input() host: Host;
	@Input() service: Service;
	
	// Event sent when the users selects the command line of this service
	@Output() cmdlineSelect = new EventEmitter<string>();
	
	selectCmdline():void {
		this.cmdlineSelect.emit(this.service.cmdLine);
	}
	unRegister():void {
		this.sendCommandService.sendUnregister(this.host, this.service);
	}
}