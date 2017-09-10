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

  // Called when the user drops a technology to a host OR a component to another host
  drop(host: Host, object: any) {
    // Detects if objects is a Technology or a Composant
    if (object['technology_id']){
      // This is a component
      this.dropComponent(this.application, host, object);
    }else {
      // This is a technology
      this.dropTechnology(this.application, host, object);
    }
  }
  
  // will copy the existing component to this host
  dropComponent(application: Application, host: Host, composant: Composant) {    
    console.log("DROP1",composant,"to",host);
    this.objectsDataService.assignComponentToHost(composant, host.id)
      .do(result => console.log("DROP RETURNED ",result))
      .subscribe(
      result => this.composants.push(result)
    );
  }
    
  // will create a new component for the given host
  dropTechnology(application: Application, host: Host, technology: Technology) {
    var name = application.name + '-' + technology.name + '/'+this.s4(); // TODO (APP-TECHNO-n)
    this.objectsDataService.createNewComponent(host, application, technology, name).map(
      comp => Object.assign(comp, {tech_iconUri: technology.iconUri}) 
    ).subscribe(
      comp => this.composants.push(comp)
    );
  }
  
  // UNASSIGN the composant on THIS host and for THIS application. If these were the last ones, then removes the composant
  // (could be impossible if there are agents assigned to it)
  delete(application: Application, host: Host, composant: Composant) {
    this.objectsDataService.deleteComponent(application, host, composant)
      .subscribe(num => this.composants = this.composants.filter(item => item.id !== composant.id ))
  }

  s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }
}
