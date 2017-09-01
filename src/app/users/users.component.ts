import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../_services/index';

import { User } from '../_models/users/index';
import { UserService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'users.component.html',
    styleUrls: ['users.component.css']
})

export class UsersComponent implements OnInit {
    currentUser: User;
    users: User[] = [];

    constructor(private userService: UserService,
				private router: Router,
			private authenticationService: AuthenticationService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit() {
        this.loadAllUsers();
    }

    deleteUser(id: number) {
        this.userService.delete(id).subscribe(() => { this.loadAllUsers() });
    }

    private loadAllUsers() {
        this.userService.getAll().subscribe(users => { this.users = users });
    }

    private loginAs(id: number) {
         this.authenticationService.loginAs(id)
            .subscribe(
                data => {
						this.router.navigate([ '' ]);
                });
    }
}