import { Component, OnInit } from '@angular/core';

import { ObjectsDataService } from '../_services/objects-data.service';
import { Application } from '../_models/objects';
import { Observable } from 'rxjs';
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

	addApplication() {
		var newId = generateUUID();
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
