import { Component, Input } from '@angular/core';

import { Host } from './model/host';

@Component({
  selector: 'host',
  templateUrl: './templates/host.component.html',
  styleUrls: ['./templates/host.component.css']
})

export class HostComponent {
  constructor() { }
    objectKeys = Object.keys; // Used in template
	@Input() host: Host;
}
