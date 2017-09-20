import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/index';
import { GroupComponent } from './page-monitor/index';
import { PageDefineComponent } from './page-define/index';
import { PageTemplateComponent } from './page-template/index';
import { PageImplantationComponent } from './page-implantation/page-implantation.component';
import { PagePluginDiscoveryComponent } from './page-plugin-discovery/page-plugin-discovery.component';
import { LoginComponent } from './login/index';
import { UsersComponent } from './users/index';
import { RegisterComponent } from './register/index';
import { AuthGuard, AdminGuard } from './_guards/index';

const appRoutes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'define', component: PageDefineComponent, canActivate: [AuthGuard]  },
    { path: 'checklist/:hostid/:composantid', component: PageImplantationComponent, canActivate: [AuthGuard]  },
    { path: 'monitor', component: GroupComponent, canActivate: [AuthGuard]  },
	
    { path: 'templates', component: PageTemplateComponent, canActivate: [AdminGuard]  },
    { path: 'plugin-discovery', component: PagePluginDiscoveryComponent, canActivate: [AdminGuard]  },
    { path: 'users', component: UsersComponent, canActivate: [AdminGuard]  },
	
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);