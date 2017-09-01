import { Component, OnInit } from '@angular/core';

import { User } from '../_models/users/user';


@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: []
})

export class HeaderComponent implements OnInit {
	
  user: User;
	
  ngOnInit(): void {
	  this.user = JSON.parse(localStorage.getItem('currentUser')) as User;
  }
}
