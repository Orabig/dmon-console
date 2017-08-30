import { Component, OnInit } from '@angular/core';

import { User } from '../_models/users/index';
import { UserService } from '../_services/index';

@Component({
	selector: 'api-key',
    moduleId: module.id,
    template: '<b>{{key}}</b>'
})

export class ApiKeyComponent implements OnInit {
	key: string;

    constructor(private userService: UserService) {
    }

    ngOnInit() {
		this.userService.getKeys().subscribe(keys => this.key=keys ? keys[0].id : '(none)');
    }
}