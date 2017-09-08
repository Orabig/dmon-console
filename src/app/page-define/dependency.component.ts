import { Component, OnInit, Input } from '@angular/core';
import { Application, Host } from '../_models/objects';
import { BusService } from './bus.service';

@Component({
  selector: 'dependency',
  templateUrl: './dependency.component.html',
  styleUrls: [ './dependency.component.css' ]
})
export class DependencyComponent implements OnInit {

  constructor( private busService: BusService ) {
    busService.applicationSelected$.subscribe(
      application => {   
        this.application = application;  
      });
  }

  ngOnInit() {
  }
  
  @Input() knownHosts: Host[];
  
  application: Application;

}
