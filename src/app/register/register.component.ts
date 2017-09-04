import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService, UserService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'register.component.html',
	styleUrls: ['../login/login.component.css']
})

export class RegisterComponent {
    model: any = {};
    loading = false;

    constructor(
        private router: Router,
        private userService: UserService,
        private alertService: AlertService) { }

    register() {
        this.loading = true;
        this.userService.create(this.model)
            .subscribe(
                data => {
					if (data['error']) {
						console.log(data);
						this.alertService.error(data['error']);
						this.loading = false;
					} else {
						this.alertService.success('Registration successful', true);
						this.router.navigate(['/login']);
					}
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
