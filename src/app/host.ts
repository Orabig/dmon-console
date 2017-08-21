import { Service } from './service';

export class Host {
  name: string;
  client: string;
  alive: boolean;
  cmdline: string;
  services: Service[];
}