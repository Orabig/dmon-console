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
		this.getFamilies();
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
			if (application===this.selectedApplication) return false; // Do not drop anything on the current application		
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
			.subscribe(result => console.log("Added"), err => console.error(err));
	} 

	addApplication() {
		this.objectsDataService.addApplication(this.newApplication).subscribe(
			(application: Application) => {
				this.applications.push( application );
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
      }
		);		
	}
	
	getFamilies() {
		this.objectsDataService.getAllApplications()
			.subscribe(applications => {
				this.applications = applications;
			}
		);
	}
}
