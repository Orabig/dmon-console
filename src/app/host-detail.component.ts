import { Component, Input } from '@angular/core';

import { Host} from './host';
@Component({
  selector: 'host-detail',
  templateUrl: './host-detail.component.html',
  styleUrls: ['./host-detail.component.css']
})
export class HostDetailComponent {
	@Input() host: Host;
}