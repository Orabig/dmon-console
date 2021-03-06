import { Host } from '../objects';
import { generateUUID } from '../../_helpers/utils';

// An Order object represents the state of an order sent to a client and the messages received in return.

// - state='sent'       : The order has been created and sent to a client
// - state='ack'        : The order has been acknowledged by the client, (but not yet process as far as we know)
// - state='processing' : The order is being processed, but the process is not finished (a RUN command may take several seconds to be process, still receiving multiple RESULT message)
// - state='cancel'     : Another order has been sent to cancel/kill the first message.
// - state='done'       : The order has been processed or succesfully killed by the killed
// - state='timeout'    : TODO
export class Order {
	public static readonly STATE_SENT       = 'sent';
	public static readonly STATE_ACK        = 'ack';
	public static readonly STATE_PROCESSING = 'processing';
	public static readonly STATE_CANCEL     = 'cancel';
	public static readonly STATE_DONE       = 'done';
	public static readonly STATE_KILLED     = 'killed';
		
	state: string;
	cmdId: string;
	t: string;
	
	public static buildOrderLoad(type: string, destination: Host, load: any) {
		return Object.assign( {
			t: type,
			cmdId: generateUUID(),
			'client-id': destination.client_id, 
			'host-id': destination.name
		}, load);
	}
	
	public static buildOrderLoadWithId(type: string, destination: Host, load: any, id: string) {
		return Object.assign( {
			t: type,
			cmdId: id,
			'client-id': destination.client_id, 
			'host-id': destination.name
		}, load);
	}
	
}
