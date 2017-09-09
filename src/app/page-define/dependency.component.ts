import { Component, OnInit, Input } from '@angular/core';
import { Application, Host } from '../_models/objects';
import { Technology } from '../_models/templates';
import { ObjectsDataService } from '../_services/objects-data.service';
import { BusService } from './bus.service';

/**
 * Displays the list of components for the given host and application
 */
@Component({
  selector: 'dependency',
  templateUrl: './dependency.component.html',
  styleUrls: [ './dependency.component.css' ],
  providers: [ ObjectsDataService ]
})
export class DependencyComponent implements OnInit {
  
  application: Application;
  
  @Input() knownHosts: Host[];

  constructor( private busService: BusService, private objectsDataService: ObjectsDataService ) {
    busService.applicationSelected$.subscribe(
      application => {   
        this.application = application;  
      });
  }

  ngOnInit() {
  }
  
}
