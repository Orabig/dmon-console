import { Component, Input } from '@angular/core';
import { Host } from './host';
import { HostService } from './host.service';

@Component({
  selector: 'host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css'],
  providers: [HostService]
})

export class HostComponent {
  constructor(private hostService: HostService) { }
    objectKeys = Object.keys; // Used in template
	@Input() host: Host;
}
