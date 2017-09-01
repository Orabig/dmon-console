
import { Host, Service } from '../objects';

// Cette classe fournit une methode permettant de traiter les messages reçu des clients (via Centrifugo)
export class Message {
	
	public static applyMessage(host: Host, message): void {
		host.last_message_time = new Date();
		if (message.data['client-id']){
			host.client = message.data['client-id'];
			host.alive = true;
		} else {
			host.client = undefined;
			host.alive = false;
		}
		if (message.data['t']=='SERVICE'){
			Host.addServiceFromMessage(host, message);
		} else if (message.data['t']=='ACK'){
			// ASIS : ACK ignored for now
			// TODO : check ACK
		} else if (message.data['t']=='RESULT'){
			// TODO : check ACK ID (ne prendre en compte QUE les RESULT de NOS commandes) <<<<<<<< IMPORTANT
			console.log(message);
			host.last_stdout = message.data['stdout'].join('\n');
			host.last_stderr = message.data['stderr'].join('\n');
			if (! message.data['terminated']) {
				host.last_stdout += "...";
			}
			if (host.last_stderr === "" && host.last_stdout === "") {
				host.last_stderr="(no output)";
			}
		} else if (message.data['t']=='ALIVE'){
			// ASIS : ALIVE ignored for now
			// TODO : check ALIVE
		} else if (message.data['t']=='UNREGISTERED'){
			console.log(message);
			// Tell the host that the service has been removed
			var id = message.data['id'];
			Host.removeServiceFrom(host,id);
		} else if (message.data['t']=='REGISTERED'){ 
			// Tell the host that the service should be added
			var id = message.data['id'];
			var cmdline = message.data['cmdline'];
			console.log(message);
			Host.registerService(host,id,cmdline);
		} else {
			console.log("Unknown message type : " + message.data['t'],message);
		}
	}
  
}