﻿import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/index';
import { GroupComponent } from './group/index';
import { LoginComponent } from './login/index';
import { UsersComponent } from './users/index';
import { RegisterComponent } from './register/index';
import { AuthGuard } from './_guards/index';

const appRoutes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'group', component: GroupComponent },
    { path: 'users', component: UsersComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);