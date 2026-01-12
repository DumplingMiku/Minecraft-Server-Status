export interface MinecraftServer {
  id: string;
  name: string;
  ip?: string; // Optional because it is stripped in the frontend build
  hideIp: boolean;
}

export interface ServerStatus {
  online: boolean;
  motd?: {
    clean: string[];
    html: string[];
  };
  players: {
    online: number;
    max: number;
    list?: { name: string; uuid: string }[];
  };
  version?: string;
  icon?: string;
  hostname?: string;
}
