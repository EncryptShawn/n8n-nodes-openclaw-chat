import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class OpenClawApi implements ICredentialType {
  name = 'openClawApi';
  displayName = 'OpenClaw API';
  documentationUrl = 'https://docs.openclaw.ai/gateway/http-api';
  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'http://localhost:18789',
      description: 'The base URL of your OpenClaw Gateway instance',
      placeholder: 'e.g., http://localhost:18789 or https://agent1.apipie.ai',
      required: true,
    },
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Bearer token for authentication. Get this from your OpenClaw Gateway configuration.',
      required: true,
    },
    {
      displayName: 'Default Agent ID',
      name: 'defaultAgentId',
      type: 'string',
      default: 'default',
      description: 'Default agent ID to use for chat completions if not specified in node',
      placeholder: 'default, main, webchat, etc.',
    },
    {
      displayName: 'Allow Insecure HTTPS',
      name: 'allowInsecureHttps',
      type: 'boolean',
      default: false,
      description: 'Whether to allow self-signed certificates (for local development only)',
    },
  ];
}