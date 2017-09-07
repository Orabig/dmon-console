import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs/Observable';

import { ObjectsDataService } from '../_services/objects-data.service';
import { Application } from '../_models/objects';

@Component({
  selector: 'application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css'],
  providers: [ObjectsDataService]
})

export class ApplicationListComponent implements OnInit {
	
	newApplication: Application =  new Application({ });
	applications: Application[] = [];
	
	constructor(private objectsDataService: ObjectsDataService) { 
	}

	ngOnInit(): void {
		this.getFamilies();
	}
	
	isProtocolLocal(protocol: string) {
		return protocol==='local' || protocol===undefined
	}

	addApplication() {
		// Generates a new UUID
		var newId = guid();
		this.newApplication.id = newId;
		this.objectsDataService.addApplication(this.newApplication).subscribe(
			(result: any) => {
				if (result instanceof Observable) return; // TODO : should be handled in http-interceptor
				console.log("result=",result);
				this.applications.push( this.newApplication );
				this.newApplication = new Application({ });
			}
		);		
	}
	
	removeApplication(application) {
		this.objectsDataService.deleteApplicationById(application.id).subscribe(
			ok => this.applications = this.applications.filter(item => item.id !== application.id )
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

// TODO TODO Mettre ca dans une méthode utilitaire (il y a en d'autres, chercher random)
// Generates a random id
function guid() {
  function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
	  .toString(16)
	  .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	s4() + '-' + s4() + s4() + s4();
}
