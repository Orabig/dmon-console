import { Component, Input } from '@angular/core';

import { SendCommandService } from './send-command.service';

import { Host} from './host';
@Component({
  selector: 'host-detail',
  templateUrl: './host-detail.component.html',
  styleUrls: ['./host-detail.component.css']
})
export class HostDetailComponent {
  constructor(private sendCommandService: SendCommandService) { }
    objectKeys = Object.keys; // Used in template
	@Input() host: Host;
	
	sendCommand():void {
		this.sendCommandService.sendCommandLine(this.host);
	}
}