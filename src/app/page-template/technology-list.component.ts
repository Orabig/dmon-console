import { Component, OnInit } from '@angular/core';

import {TemplatesDataService} from '../_services/templates-data.service';
import { Technology , Family } from '../_models/templates';

@Component({
  selector: 'technology-list',
  templateUrl: './technology-list.component.html',
  styleUrls: ['./technology-list.component.css'],
  providers: [TemplatesDataService]
})

export class TechnologyListComponent implements OnInit {
	
	newTechnology: Technology = new Technology();
	technologies: Technology[] = [];

	constructor(private templatesDataService: TemplatesDataService) { }

	ngOnInit(): void {
		this.getTechnologies();
	}

	addTechnology() {
		this.newTechnology.iconUri = '/assets/techs/' + this.newTechnology.name.toLowerCase().replace(/ /g,'_') + '.png';
		this.templatesDataService.addTechnology(this.newTechnology).subscribe(
			newId => {
				this.newTechnology.id = newId;
				this.technologies.push( this.newTechnology );
				this.newTechnology = new Technology();
			}
		);
	}
	
	removeTechnology(tech) {
		this.templatesDataService.deleteTechnologyById(tech.id).subscribe(
			ok => this.technologies = this.technologies.filter(item => item.id !== tech.id )
		);
	}
	
	getTechnologies() {
		this.templatesDataService.getAllTechnologies()
			.subscribe(technologies => {
				this.technologies = technologies;
			}
		);
	}
}
