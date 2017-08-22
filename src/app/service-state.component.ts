import { Component, Input } from '@angular/core';

import { SendCommandService } from './send-command.service';

import { Host } from './host';
import { Service } from './service';

@Component({
  selector: 'service-state',
  templateUrl: './service-state.component.html',
  styleUrls: ['./service-state.component.css']
})
export class ServiceStateComponent {
	constructor(private sendCommandService: SendCommandService) { }
	@Input() host: Host;
	@Input() service: Service;
	
	unRegister():void {
		this.sendCommandService.sendUnregister(this.host, this.service);
	}
}