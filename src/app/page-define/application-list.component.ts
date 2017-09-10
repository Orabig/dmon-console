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
