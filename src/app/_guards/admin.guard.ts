import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AdminGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem('currentUser') && 
			JSON.parse(localStorage.getItem('currentUser')).administrator==1) {
            // logged in so return true
            return true;
        }

        // not logged as admin so return to home
        this.router.navigate(['/'], { });
        return false;
    }
}