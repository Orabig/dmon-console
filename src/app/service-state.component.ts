import { Component, Input } from '@angular/core';

import { Service } from './service';
@Component({
  selector: 'service-state',
  templateUrl: './service-state.component.html',
  styleUrls: ['./service-state.component.css']
})
export class ServiceStateComponent {
	@Input() service: Service;
}