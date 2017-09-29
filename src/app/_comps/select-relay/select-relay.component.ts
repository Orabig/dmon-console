import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { ObjectsDataService } from '../../_services';
import { Host } from '../../_models/objects';


@Component({
  selector: 'select-relay',
  templateUrl: './select-relay.component.html',
  styleUrls: ['./select-relay.component.css']
})
export class SelectRelayComponent implements OnInit {
	
  hosts: Host[];
  selected: Host;
  
  @Output() hostSelected = new EventEmitter();

  constructor( private objectsDataService: ObjectsDataService ) {}

  ngOnInit() {
	  this.objectsDataService.getAllHosts().subscribe( hosts => this.hosts=hosts.filter(host=>host.client_id!=null) );
  }
  
  select(host: Host) {
	  this.selected=host;
	  this.hostSelected.emit(host);
  }

}
