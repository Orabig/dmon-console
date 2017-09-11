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
  
  constructor(
		private objectsDataService: ObjectsDataService,
		private busService: BusService ) {
			busService.composantKnown$.subscribe(
				// Updates the list if some composant has changed (name mostly)
				composant => this.updateComposantsFor(composant)
			);
		}

  ngOnChanges() {
    if (this.application!=null)
      this.objectsDataService.getAllComponentsFor(this.host, this.application)
        .subscribe( composants => this.loadComposants(composants) );
  }
  
  loadComposants(composants: Composant[]){
    this.composants = composants;
    // Tell the bus that the composants do exist
    composants.forEach(composant => this.busService.composantKnown(composant));
  }
  
  // This method is called when a composant (not necessary known here) is new or has changed its name
  // (or any parameter). It's time to update in that case
  updateComposantsFor(composant: Composant) {
	if (this.composants != null) {
		this.composants.filter(comp => comp.id===composant.id)
			.forEach(toUpdate => Object.assign(toUpdate,composant));
	}
  }
  
  allowDropFunction() {
	return (dragData: any) => {
		if (this.application==null) return false;
		// Detects if objects is a Technology or a Composant
		if (dragData['technology_id']){
		  // This is a component. Do NOT allow the drop if the composant is already in the list
		  if (this.composants.filter(c => c.id===dragData['id']).length>0) {
			  return false;
		  }
		  return true;
		}else {
		  // This is a technology
		  return true; // allow drop
		}	
	}  	  
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
        err => console.error(err) );
  }
    
  // will create a new component for the given host
  dropTechnology(application: Application, host: Host, technology: Technology) {
    // This componant needs to send a request to the bug to get an unique name
	this.checkNameThenCreateComposant(application, host, technology);
  }
  
  checkNameThenCreateComposant(application: Application, host: Host, technology: Technology) {
    var shortTermSubscription = this.busService.uniqueNameFound$
      .subscribe(name=>{ // This will be called when the name has been found
        this.createComponent(application, host, technology, name);
        shortTermSubscription.unsubscribe(); // Only listen once to this   
      });
	var baseName = application.name + '-' + technology.name;
    this.busService.uniqueNameRequest({baseName: baseName});
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
