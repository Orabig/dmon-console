import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Host, Application, Composant } from '../_models/objects';
import { Technology } from '../_models/templates';
import { ObjectsDataService } from '../_services/objects-data.service';
import { BusService } from './bus.service';

@Component({
  selector: 'composant-list',
  templateUrl: './composant-list.component.html',
  styleUrls: ['./composant-list.component.css']
})
export class ComposantListComponent implements OnChanges {

  @Input() application: Application;
  @Input() host: Host;
  
  composants: Composant[];
  
  constructor( private objectsDataService: ObjectsDataService, private busService: BusService ) { }

  ngOnChanges() {
    this.objectsDataService.getAllComponentsFor(this.host, this.application).subscribe(
        composants => this.loadComposants(composants)
    );
  }
  
  loadComposants(composants: Composant[]){
    this.composants = composants;
    // Register the composants to the bus
    composants.forEach(composant => this.busService.composantKnown(composant));
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
  
  // copy an existing component to this host
  dropComponent(application: Application, host: Host, composant: Composant) {    
    this.objectsDataService.assignComponentToHost(composant, host.id)
      .subscribe( 
        composant => this.composants.push(composant),
        err => console.log("traped:",err) );
  }
    
  // will create a new component for the given host
  dropTechnology(application: Application, host: Host, technology: Technology) {
    // This componant needs to send a request to the bug to get an unique name
    var shortTermSubscription = this.busService.uniqueNameFound$
      .subscribe(name=>{ // This will be called when the name has been found
        this.createComponent(application, host, technology, name);
        shortTermSubscription.unsubscribe(); // Only listen once to this   
      });
    this.busService.uniqueNameRequest({application: application, technology: technology});
  }
  
  createComponent(application: Application, host: Host, technology: Technology, name: string) {
    this.objectsDataService.createNewComponent(host, application, technology, name).map(
      comp => Object.assign(comp, {tech_iconUri: technology.iconUri}) 
    ).subscribe(
      comp => {
        this.composants.push(comp);
        this.busService.composantKnown(comp);
      }
    );
  }
  
  // UNASSIGN the composant on THIS host and for THIS application. If these were the last ones, then removes the composant
  // (could be impossible if there are agents assigned to it)
  deleteComponent(application: Application, host: Host, composant: Composant) {
    this.objectsDataService.deleteComponent(application, host, composant)
      .subscribe(num => this.composants = this.composants.filter(item => item.id !== composant.id ))
  }
}
