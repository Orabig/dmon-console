import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SendCommandService } from './send-command.service';

import { Host } from './host';
import { Service } from './service';

@Component({
  selector: 'service-state',
  templateUrl: './service-state.component.html',
  styleUrls: ['./service-state.component.css'],
  providers: [SendCommandService]
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