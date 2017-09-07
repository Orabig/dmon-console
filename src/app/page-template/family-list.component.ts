import { Component, OnInit, Input } from '@angular/core';

import {TemplatesDataService} from '../_services/templates-data.service';
import { Technology , Family } from '../_models/templates';

@Component({
  selector: 'family-list',
  templateUrl: './family-list.component.html',
  styleUrls: ['./family-list.component.css'],
  providers: [TemplatesDataService]
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

	@Input()
	set protocol(protocol: string) {
		this.newFamily.protocol = protocol;
		this.shortname=this.currentShortName;
	}

	@Input()
	set shortname(name: string) {
		var protocol = this.newFamily.protocol;
		this.currentShortName=name;
		this.newFamily.name = this.isProtocolLocal(protocol) ? name +' (local)' : name==='' ? '' : name + ' (Remote/'+protocol+')';
	}
	
	newLocalFamily() {
		this.newFamily = new Family({ protocol: 'local' });
		this.shortname = this.currentShortName;
	}
	
	isProtocolLocal(protocol: string) {
		return protocol==='local' || protocol===undefined
	}

	addFamily() {
		this.newFamily.remote = ! this.isProtocolLocal(this.newFamily.protocol);
		this.templatesDataService.addFamily(this.newFamily).subscribe(
			newId => {
				this.newFamily.id = newId;
				this.families.push( this.newFamily );
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
