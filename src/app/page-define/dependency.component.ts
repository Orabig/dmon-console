import { Component, OnInit, Input } from '@angular/core';
import { Application, Host } from '../_models/objects';
import { Technology } from '../_models/templates';
import { ObjectsDataService } from '../_services/objects-data.service';
import { BusService } from './bus.service';

@Component({
  selector: 'dependency',
  templateUrl: './dependency.component.html',
  styleUrls: [ './dependency.component.css' ],
  providers: [ ObjectsDataService ]
})
export class DependencyComponent implements OnInit {

  constructor( private busService: BusService, private objectsDataService: ObjectsDataService ) {
    busService.applicationSelected$.subscribe(
      application => {   
        this.application = application;  
      });
  }

  ngOnInit() {
  }
  
  @Input() knownHosts: Host[];
  
  application: Application;
  
  // Called when the user drops a technology to a host
  drop(host: Host, technology: Technology) {
    var application = this.application;
    this.objectsDataService.createNewComponent(host, application, technology);
  }

}
