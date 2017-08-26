import { Component, Input, OnInit } from '@angular/core';
import 'rxjs/add/operator/filter';

import { SendCommandService } from '../_services/send-command.service';
import { HostService } from '../_services/host.service';

import { Order } from '../_models/comm/order';
import { Host } from '../_models/objects/host';

@Component({
  selector: 'orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  providers: []
})

export class OrdersComponent implements OnInit {
	constructor( private sendCommandService: SendCommandService,
				private hostService: HostService) { }
	// @Input() host: Host;
	
	orders: Order[] = [];
	
	ngOnInit(): void {
	  this.sendCommandService.getOrders().subscribe( load => this.processOrder(load) );
	  this.hostService.getMessages()
	    .filter(load => load.data['t']!=='SERVICE' && load.data['t']!=='ALIVE' )
		.subscribe( load => this.processOrder(load) );
	}
	
	processOrder(load: any):void {
		// Orders sent have load.cmdId defined.
		// Messages received from the client have cmdId in their data part 
		var cmdId = load.cmdId || load.data.cmdId;
		if (load.data && (load.data.t==='ALIVE' || load.data.t==='SERVICE'))return;
		if (cmdId) {
			var exist = this.orders.filter(o => o.cmdId===cmdId);
			if (exist.length>0) {
				OrdersComponent.processExistingOrderLoad(exist[0], load);
			} else {
				this.orders.push(load);
			}
			this.orders = Object.assign( this.orders );
		} else {
			console.log("message without id",load.data.t, load);
		}
	}
	
	killOrder(order: Order) {
		var host =new Host();
		host.name = order['host-id'];
		host.client = order['client-id'];
		this.sendCommandService.sendKillOrder(host, order.cmdId);
	}
	
	static processExistingOrderLoad(order: Order,load: any):void {
		if (load.data.t==='RESULT' && order['cmd']==='RUN'){
			if (load.data.terminated) {
				if (load.data.killed) {
					order.state = Order.STATE_KILLED;
				} else {
					order.state = Order.STATE_DONE;
				}
			} else {
				order.state = Order.STATE_PROCESSING;
			}
		} else if (load.data.t==='UNREGISTERED' && order['cmd']==='UNREGISTER'){
			order.state = Order.STATE_DONE;
		} else if (load.data.t==='REGISTERED' && order['cmd']==='REGISTER'){
			order.state = Order.STATE_DONE;
		} else if (load.data.t==='ACK'){
			order.state = Order.STATE_ACK;
		} else {
			console.log("orders.component.ts :: unknown state ORDER=",order,"       load=",load);
			order.state = "unknown";
		}
	}
}
