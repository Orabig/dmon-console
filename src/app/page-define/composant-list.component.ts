import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Host, Application, Composant } from '../_models/objects';
import { Technology } from '../_models/templates';
import { ObjectsDataService } from '../_services/objects-data.service';

@Component({
  selector: 'composant-list',
  templateUrl: './composant-list.component.html',
  styleUrls: ['./composant-list.component.css']
})
export class ComposantListComponent implements OnChanges {

  @Input() application: Application;
  @Input() host: Host;
  
  composants: Composant[];
  
  constructor( private objectsDataService: ObjectsDataService ) { }

  ngOnChanges() {
    this.objectsDataService.getAllComponentsFor(this.host, this.application).subscribe(
        composants => this.composants = composants
    );
  }

  // Called when the user drops a technology to a host
  drop(host: Host, technology: Technology) {
    var application = this.application;
    var name = technology.name+this.s4(); // TODO (APP-TECHNO-n)
    this.objectsDataService.createNewComponent(host, application, technology, name).map(
      comp => Object.assign(comp, {tech_iconUri: technology.iconUri}) 
    ).subscribe(
      comp => this.composants.push(comp)
    );
  }

  s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }
}
