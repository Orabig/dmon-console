import {Observable} from 'rxjs/Observable';
import { Injectable } from '@angular/core';

import { User } from '../_models/users/index';

import { HttpInterceptorService } from './http-interceptor.service';

@Injectable()
export class GroupService {
    constructor(private httpInterceptorService: HttpInterceptorService) { }

	// Given the organization ID returns the list of groups
	// Output format is {'default':'<ID>', 'groups':[ {'id':'<ID>', 'name':'<NAME>' } ] }
	getGroups(orgId: string): Observable<any> {
        return this.httpInterceptorService.getJson('get-groups.php',{org: orgId});
	}
}