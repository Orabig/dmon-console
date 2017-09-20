import { Component, OnInit, Input } from '@angular/core';

import {TemplatesDataService} from '../_services/templates-data.service';
import { Technology , Family } from '../_models/templates';

@Component({
  selector: 'family-list',
  templateUrl: './family-list.component.html',
  styleUrls: ['./family-list.component.css']
})

export class FamilyListComponent implements OnInit {
	
	newFamily: Family;
	families: Family[] = [];
	
	private currentShortName: string;
	
	constructor(private templatesDataService: TemplatesDataService) { 
		this.newLocalFamily();
	}

	ngOnInit(): void {
		this.getFamilies();
	}
	
	newLocalFamily() {
		this.newFamily = new Family({  });
	}

	addFamily() {
		this.templatesDataService.insertFamily(this.newFamily).subscribe(
			family => {
				this.families.push( family );
				this.newLocalFamily();
			}
		);		
	}
	
	removeFamily(family) {
		this.templatesDataService.deleteFamilyById(family.id).subscribe(
			ok => this.families = this.families.filter(item => item.id !== family.id )
		);		
	}
	
	getFamilies() {
		this.templatesDataService.getAllFamilies()
			.subscribe(families => {
				this.families = families;
			}
		);
	}
}
