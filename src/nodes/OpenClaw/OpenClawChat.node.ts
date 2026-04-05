import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import {
  openClawApiRequest,
  openClawApiRequestAllItems,
  validateCredentials,
} from './GenericFunctions';

export class OpenClawChat implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'OpenClaw Chat',
    name: 'openClawChat',
    icon: 'file:8claw-icon.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description: 'Interact with OpenClaw Gateway HTTP API',
    defaults: {
      name: 'OpenClaw Chat',
      color: '#1F8EB2',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'openClawApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Chat Completion',
            value: 'chatCompletion',
          },
          {
            name: 'Embedding',
            value: 'embedding',
          },
          {
            name: 'Model',
            value: 'model',
          },
          {
            name: 'Response',
            value: 'response',
          },
          {
            name: 'Tool',
            value: 'tool',
          },
        ],
        default: 'chatCompletion',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['chatCompletion'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a chat completion',
            action: 'Create a chat completion',
          },
        ],
        default: 'create',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['embedding'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create embeddings for input text',
            action: 'Create embeddings',
          },
        ],
        default: 'create',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['model'],
          },
        },
        options: [
          {
            name: 'List',
            value: 'list',
            description: 'List available models',
            action: 'List models',
          },
        ],
        default: 'list',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['response'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a response (OpenResponses format)',
            action: 'Create a response',
          },
        ],
        default: 'create',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['tool'],
          },
        },
        options: [
          {
            name: 'Invoke',
            value: 'invoke',
            description: 'Invoke a tool directly',
            action: 'Invoke a tool',
          },
        ],
        default: 'invoke',
      },
      // Chat Completion parameters
      {
        displayName: 'Model',
        name: 'model',
        type: 'string',
        default: 'openclaw/default',
        description: 'Model to use for completion. Use "openclaw/default" for default agent or "openclaw/&lt;agentId&gt;" for specific agent.',
        displayOptions: {
          show: {
            resource: ['chatCompletion'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Messages',
        name: 'messages',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        placeholder: 'Add Message',
        displayOptions: {
          show: {
            resource: ['chatCompletion'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Message',
            name: 'message',
            values: [
              {
                displayName: 'Role',
                name: 'role',
                type: 'options',
                options: [
                  {
                    name: 'System',
                    value: 'system',
                  },
                  {
                    name: 'User',
                    value: 'user',
                  },
                  {
                    name: 'Assistant',
                    value: 'assistant',
                  },
                ],
                default: 'user',
              },
              {
                displayName: 'Content',
                name: 'content',
                type: 'string',
                default: '',
                typeOptions: {
                  rows: 4,
                },
              },
            ],
          },
        ],
      },

      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['chatCompletion'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Max Tokens',
            name: 'maxTokens',
            type: 'number',
            default: 4096,
            description: 'Maximum number of tokens to generate',
          },
          {
            displayName: 'Temperature',
            name: 'temperature',
            type: 'number',
            typeOptions: {
              minValue: 0,
              maxValue: 2,
              numberPrecision: 2,
            },
            default: 1,
            description: 'Sampling temperature between 0 and 2',
          },
          {
            displayName: 'Top P',
            name: 'topP',
            type: 'number',
            typeOptions: {
              minValue: 0,
              maxValue: 1,
              numberPrecision: 2,
            },
            default: 1,
            description: 'Nucleus sampling parameter',
          },
          {
            displayName: 'Frequency Penalty',
            name: 'frequencyPenalty',
            type: 'number',
            typeOptions: {
              minValue: -2,
              maxValue: 2,
              numberPrecision: 2,
            },
            default: 0,
            description: 'Penalty for token frequency',
          },
          {
            displayName: 'Presence Penalty',
            name: 'presencePenalty',
            type: 'number',
            typeOptions: {
              minValue: -2,
              maxValue: 2,
              numberPrecision: 2,
            },
            default: 0,
            description: 'Penalty for token presence',
          },
          {
            displayName: 'Stop Sequences',
            name: 'stop',
            type: 'string',
            placeholder: '["\\n", "Human:"]',
            description: 'Sequences where the API will stop generating further tokens',
          },
          {
            displayName: 'User',
            name: 'user',
            type: 'string',
            default: '',
            description: 'A unique identifier representing your end-user',
          },
        ],
      },
      // Embedding parameters
      {
        displayName: 'Model',
        name: 'model',
        type: 'string',
        default: 'openclaw/default',
        description: 'Model to use for embeddings. Use "openclaw/default" for default agent.',
        displayOptions: {
          show: {
            resource: ['embedding'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Input',
        name: 'input',
        type: 'string',
        default: '',
        description: 'Input text to embed. Can be a string or array of strings.',
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          show: {
            resource: ['embedding'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Encoding Format',
        name: 'encodingFormat',
        type: 'options',
        options: [
          {
            name: 'Float',
            value: 'float',
          },
          {
            name: 'Base64',
            value: 'base64',
          },
        ],
        default: 'float',
        description: 'Format of the embedding vector',
        displayOptions: {
          show: {
            resource: ['embedding'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'User',
        name: 'user',
        type: 'string',
        default: '',
        description: 'A unique identifier representing your end-user',
        displayOptions: {
          show: {
            resource: ['embedding'],
            operation: ['create'],
          },
        },
      },
      // Response parameters
      {
        displayName: 'Model',
        name: 'model',
        type: 'string',
        default: 'openclaw',
        description: 'Model to use for response. Usually "openclaw".',
        displayOptions: {
          show: {
            resource: ['response'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Input',
        name: 'input',
        type: 'string',
        default: '',
        description: 'Input text, message array, or structured input for OpenResponses',
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          show: {
            resource: ['response'],
            operation: ['create'],
          },
        },
      },

      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['response'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Tools',
            name: 'tools',
            type: 'json',
            default: '',
            description: 'JSON array of tool definitions',
          },
          {
            displayName: 'User',
            name: 'user',
            type: 'string',
            default: '',
            description: 'A unique identifier for stable sessions',
          },
          {
            displayName: 'Previous Response ID',
            name: 'previousResponseId',
            type: 'string',
            default: '',
            description: 'ID of previous response for continuation',
          },
        ],
      },
      // Tool parameters
      {
        displayName: 'Tool Name',
        name: 'toolName',
        type: 'string',
        default: '',
        description: 'Name of the tool to invoke (e.g., "memory_search", "sessions_list")',
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
          },
        },
        required: true,
      },
      {
        displayName: 'Action',
        name: 'action',
        type: 'string',
        default: '',
        description: 'Action for the tool (e.g., "json" for sessions_list)',
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
          },
        },
      },
      {
        displayName: 'Arguments',
        name: 'arguments',
        type: 'json',
        default: '{}',
        description: 'JSON object of arguments to pass to the tool',
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        if (resource === 'chatCompletion') {
          if (operation === 'create') {
            const messages = this.getNodeParameter('messages.message', i, []) as any[];
            if (messages.length === 0) {
              throw new Error('At least one message is required for chat completion');
            }
            // Validate each message has role and content
            for (const [index, msg] of messages.entries()) {
              if (!msg.role || !msg.content) {
                throw new Error(`Message ${index + 1} is missing role or content`);
              }
            }
            const body = {
              model: this.getNodeParameter('model', i) as string,
              messages,
              stream: false,
              ...this.getNodeParameter('additionalFields', i, {}),
            };
            const response = await openClawApiRequest.call(this, {
              method: 'POST',
              url: '/v1/chat/completions',
              body,
            });
            // Validate response structure
            if (!response || typeof response !== 'object') {
              throw new Error('Invalid response received from OpenClaw API');
            }
            returnData.push({ json: response });
          }
        } else if (resource === 'embedding' && operation === 'create') {
          const input = this.getNodeParameter('input', i) as string;
          if (!input.trim()) {
            throw new Error('Input text is required for embedding');
          }
          const body = {
            model: this.getNodeParameter('model', i) as string,
            input,
            encoding_format: this.getNodeParameter('encodingFormat', i, 'float') as string,
            user: this.getNodeParameter('user', i, '') as string,
          };
          const response = await openClawApiRequest.call(this, {
            method: 'POST',
            url: '/v1/embeddings',
            body,
          });
          if (!response || typeof response !== 'object') {
            throw new Error('Invalid response received from OpenClaw API');
          }
          returnData.push({ json: response });
        } else if (resource === 'model' && operation === 'list') {
          const response = await openClawApiRequest.call(this, {
            method: 'GET',
            url: '/v1/models',
          });
          returnData.push({ json: response });
        } else if (resource === 'response') {
          if (operation === 'create') {
            const input = this.getNodeParameter('input', i) as string;
            if (!input.trim()) {
              throw new Error('Input text is required for response');
            }
            const body = {
              model: this.getNodeParameter('model', i) as string,
              input,
              stream: false,
              ...this.getNodeParameter('additionalFields', i, {}),
            };
            const response = await openClawApiRequest.call(this, {
              method: 'POST',
              url: '/v1/responses',
              body,
            });
            if (!response || typeof response !== 'object') {
              throw new Error('Invalid response received from OpenClaw API');
            }
            returnData.push({ json: response });
          }
        } else if (resource === 'tool' && operation === 'invoke') {
          const response = await openClawApiRequest.call(this, {
            method: 'POST',
            url: '/tools/invoke',
            body: {
              tool: this.getNodeParameter('toolName', i) as string,
              action: this.getNodeParameter('action', i, '') as string,
              args: JSON.parse(this.getNodeParameter('arguments', i, '{}') as string),
            },
          });
          returnData.push({ json: response });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as any).message,
            },
          });
          continue;
        }
        throw error as Error;
      }
    }

    return this.prepareOutputData(returnData);
  }
}