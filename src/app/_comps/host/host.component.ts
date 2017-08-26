import { Component, Input } from '@angular/core';

import { Host } from '../../_models/objects/host';

@Component({
  selector: 'host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})

export class HostComponent {
  constructor() { }
    objectKeys = Object.keys; // Used in template
	@Input() host: Host;
}
