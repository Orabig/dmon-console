import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ObjectsDataService } from '../_services/objects-data.service';
import { Application, Composant } from '../_models/objects';
import { generateUUID } from '../_helpers/utils';
import { BusService } from './bus.service';

@Component({
  selector: 'application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css'],
  providers: [ObjectsDataService]
})

export class ApplicationListComponent implements OnInit {
	
	newApplication: Application =  new Application({ });
	applications: Application[] = [];
  selectedApplication: Application;
	
	constructor(private objectsDataService: ObjectsDataService,
              private busService: BusService) { 
	}

	ngOnInit(): void {
		this.getApplications();
	}
	
	isProtocolLocal(protocol: string) {
		return protocol==='local' || protocol===undefined
	}
  
  selectApplication(application: Application) {
    this.selectedApplication=application;
    this.busService.applicationselected(application);
  }
  
	  // Should return true if the data can be dropped there
	  allowDropFunction(application: Application) {
		return (dragData: any) => {
			if (application===this.selectedApplication) {
				return false; // Do not drop anything on the current application		
			}
			if (dragData['technology_id']){
			  // This is a composant
			  return true; // TRUE : we accept composants
			}else {
			  // This is a technology
			  return false; // Do not drop technologies to applications
			}
		}  
	  }

	// A composant has been dropped into another application : add a new dependency   
	dropComposant(application: Application, event: any) {
		var composant: Composant = event['dragData'];
		this.objectsDataService.assignComponentToApplication(composant, application.id)
			.subscribe(result => this.removePrefixFromName(result), err => console.error(err));
	} 
	
	// Appelé quand un composant est ajouté à une autre application.
	// Il faut renommer ce composant pour supprimer le pefixe correspondant au nom de l'application
	removePrefixFromName(composant: Composant) {
		var prefix = '^' + this.selectedApplication.name + '-';
		var regexp = new RegExp(prefix);
		var newName = composant.name.replace(regexp,'');
		if (newName != composant.name) {
			// TODO we should find an unique name
			this.checkNameThenRenameComposant(composant, newName);
		}
	}

	// Finds an unique name for the composant, then rename it
	checkNameThenRenameComposant(composant: Composant, newName: string) {
		var shortTermSubscription = this.busService.uniqueNameFound$
		  .subscribe(name=>{ // This will be called when the name has been found
			this.renameComposant(composant, name);
			shortTermSubscription.unsubscribe(); // Only listen once to this   
		  });
		this.busService.uniqueNameRequest({baseName: newName});
	}
	
	renameComposant(composant: Composant, newName: string) {
		this.objectsDataService.updateComposant(composant, {name: newName}).subscribe(
			result => this.busService.composantKnown(result),
			err => console.error("Could not rename composant : ",err)
		);
	}

	addApplication() {
		this.objectsDataService.addApplication(this.newApplication).subscribe(
			(application: Application) => {
				this.applications.push( application );
				// Automatically selects the application
				this.selectApplication( application );
				this.newApplication = new Application({ });
			}
		);		
	}

	removeApplication(application) {
		this.objectsDataService.deleteApplicationById(application.id).subscribe(
			ok => {
        if (this.selectedApplication.id===application.id)
           this.selectApplication(null);
        this.applications = this.applications.filter(item => item.id !== application.id )
		if (this.selectedApplication==null)
			this.selectApplication(application[0]);
      }
		);		
	}
	
	getApplications() {
		this.objectsDataService.getAllApplications()
			.subscribe(applications => {
				this.applications = applications;
				if (this.selectedApplication==null)
					this.selectApplication(applications[0]);
			}
		);
	}
}
