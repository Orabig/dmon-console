import { Component } from '@angular/core';

import {TemplatesDataService} from '../_services/templates-data.service';
import { Technology , Family } from '../_models/templates';

@Component({
  selector: 'page-template',
  templateUrl: './page-template.component.html',
  styleUrls: ['./page-template.component.css'],
  providers: [TemplatesDataService]
})

export class PageTemplateComponent {
	
}
