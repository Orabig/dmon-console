import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { ObjectsDataService, TemplatesDataService } from '../_services/index';

import { Family, Command } from '../_models/templates/index';
import { Host, Composant, Implantation, Agent } from '../_models/objects/index';

@Component({
  templateUrl: './page-implantation.component.html',
  styleUrls: ['./page-implantation.component.css']
})
export class PageImplantationComponent implements OnInit {

  private host: Host;
  private composant: Composant;
  private implantation: Implantation;
  
  private families: Family[];
  private selectedFamilies: Family[] = [];
  
  private checksByFamilies: Agent[][] = [];
  
  // An array [ string=>boolean ] telling if the commands are shown (and thus draggable) for the given family ID
  private commandsShown: any[] = [];
  
  // The agent currently selected and in edition mode
  private selectedAgent: Agent;
  
  // The command objects (with all properties, requirements AND variables) used for the edition box
  private editCommandTemplate: Command;
  
  // A source that publish the family list when it's loaded
  private familyListSource = new Subject<Family[]>();
  public familyListSource$ = this.familyListSource.asObservable();
  
  constructor(private objectsDataService: ObjectsDataService,
				private templatesDataService: TemplatesDataService,
				private activatedRoute: ActivatedRoute) {
	  activatedRoute.paramMap.subscribe(params=>this.load(params.get('hostid'),params.get('composantid')));
	}

  ngOnInit() {
	this.templatesDataService.getAllFamilies()// .do(d=>console.log(d)) // DEBUG liste des familles
		.subscribe(fams => this.loadFamilies(fams.filter(family=>family.commands.length>0)));
  }

  load(hostid:string, compid:string) {
	  this.objectsDataService.getHostById(hostid).subscribe(host=>this.host=host);
	  this.objectsDataService.getComposantById(compid).subscribe(comp=>this.composant=comp);
	  this.objectsDataService.getImplantation(hostid,compid).subscribe(impl=>this.loadImplantation(impl));
  }
  
  loadFamilies(list: Family[]) {
	  this.families=list;
	  this.familyListSource.next( list );
  }
  
  loadImplantation(impl: Implantation) {
	  this.implantation = impl;
	  // This object comes with the list of known agents
	  impl.agents.forEach(agent => this.showNewAgent(agent.family_id, agent));
  }
  
  dropFamily(family: Family) {
	  this.moveFamily(this.families, this.selectedFamilies, family.id);
  }
  
  moveFamily(source, target, itemId: number) {
		for (var i = 0; i < source.length; i++) {
			var element = source[i];
			if (element.id == itemId) {
				source.splice(i, 1);
				target.push(element);
				i--; 
			}
		} 
	}

  // Displays the list of available command for the given family, and hides all the others (hide all if family==null)
  toggleAddCommand(family: Family) {
	  var newValue = [];
	  if (family!=null)
		newValue[family.id] = true;
	  this.commandsShown=Object.assign({}, newValue);
  }

  // Creates a new agent and displays it in the edition box
  editAgent(agent: Agent) {
	  this.templatesDataService.getCommandById(agent.command_id).subscribe( fullCommand => {
		  console.log(fullCommand);
		  this.editCommandTemplate = fullCommand;
		  this.selectedAgent = agent;
		}
	  );	  
	//this.objectsDataService.createNewAgent(agent).subscribe(		agent => this.showNewAgent(family.id, agent)	);
  }

  // Creates a new agent and displays it in the edition box
  editNewAgent(family: Family, command: Command) {
	  this.templatesDataService.getCommandById(command.id).subscribe( fullCommand => {
		  console.log(fullCommand);
		  this.editCommandTemplate = fullCommand;
		  this.selectedAgent = new Agent({ command_id: command.id, family_id: family.id, implantation_id: this.implantation.id, name: 'toto' });
		}
	  );	  
	//this.objectsDataService.createNewAgent(agent).subscribe(		agent => this.showNewAgent(family.id, agent)	);
  }
  
  // Show the agent in the list of agents for the given family
  showNewAgent(familyId: number, agent: Agent) {
	var actuals = this.checksByFamilies[familyId];
	if (!actuals) actuals = [];
	actuals.push(agent);
	var newValue = [];
	newValue[familyId] = actuals;
	this.checksByFamilies=Object.assign(this.checksByFamilies, newValue);
	// The family must be shown in the list of check, so update selectedFamilies
	if (this.selectedFamilies.filter(f=>f.id===familyId).length==0) {
		// I get the familyList from a source to avoid race conditions here.
		this.familyListSource$.subscribe( familyList =>
			this.moveFamily(familyList,this.selectedFamilies,familyId)
		);
	}
  }
  
}
