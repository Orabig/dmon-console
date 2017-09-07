import { Component, OnInit, OnDestroy } from '@angular/core';

import {TechnologyDataService} from '../_services/technology-data.service';
import { Technology } from '../_models/templates/technology';

@Component({
  selector: 'page-template',
  templateUrl: './page-template.component.html',
  styleUrls: ['./page-template.component.css'],
  providers: [TechnologyDataService]
})

export class PageTemplateComponent {
	
	newTechnology: Technology = new Technology();
	
	constructor(private technologyDataService: TechnologyDataService) { }

	addTechnology() {
		console.log(this.newTechnology.name);
		this.newTechnology.iconUri = '/assets/techs/' + this.newTechnology.name.toLowerCase().replace(/ /g,'_') + '.png';
		this.technologyDataService.addTechnology(this.newTechnology);
		this.newTechnology = new Technology();
	}
	
	removeTechnology(tech) {
		this.technologyDataService.deleteTechnologyById(tech.id);
	}
	
	get technologies() {
		return this.technologyDataService.getAllTechnologies();
	}
}
