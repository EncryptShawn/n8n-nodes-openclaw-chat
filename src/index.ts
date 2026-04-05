import { INodeType, INodeTypeBaseDescription } from 'n8n-workflow';
import { OpenClawChat } from './nodes/OpenClaw/OpenClawChat.node';
import { OpenClawApi } from './credentials/OpenClawApi.credentials';

export const nodeTypes: INodeType[] = [
  new OpenClawChat(),
];

export const credentialTypes = {
  openClawApi: new OpenClawApi(),
};