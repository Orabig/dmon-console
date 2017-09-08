import { Component, OnInit, OnDestroy } from '@angular/core';

import { environment } from '../../environments/environment';
import { Application, Host } from '../_models/objects';
import { ObjectsDataService } from '../_services/objects-data.service';
import { BusService } from './bus.service';

@Component({
  selector: 'page-define',
  templateUrl: './page-define.component.html',
  styleUrls: ['./page-define.component.css'],
  providers: [ BusService, ObjectsDataService ]
})

export class PageDefineComponent {
  
  hosts: Host[] = [];
  
  constructor( private objectsDataService: ObjectsDataService ) {
    this.objectsDataService.getAllHosts().subscribe(
        hosts => this.hosts = hosts
    ); 
  }
  
  
}
