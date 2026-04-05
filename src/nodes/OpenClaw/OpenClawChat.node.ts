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
        type: 'options',
        default: '',
        description: 'Name of the tool to invoke',
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
          },
        },
        required: true,
        options: [
          {
            name: 'exec',
            value: 'exec',
            description: 'Shell execution',
          },
          {
            name: 'process',
            value: 'process',
            description: 'Manage background exec sessions',
          },
          {
            name: 'read',
            value: 'read',
            description: 'Read file contents',
          },
          {
            name: 'write',
            value: 'write',
            description: 'Write file contents',
          },
          {
            name: 'edit',
            value: 'edit',
            description: 'Edit file by replacing exact text',
          },
          {
            name: 'apply_patch',
            value: 'apply_patch',
            description: 'Apply structured patches across files',
          },
          {
            name: 'web_search',
            value: 'web_search',
            description: 'Search the web using Brave Search API',
          },
          {
            name: 'web_fetch',
            value: 'web_fetch',
            description: 'Fetch and extract readable content from a URL',
          },
          {
            name: 'browser',
            value: 'browser',
            description: 'Control the dedicated OpenClaw-managed browser',
          },
          {
            name: 'canvas',
            value: 'canvas',
            description: 'Drive the node Canvas',
          },
          {
            name: 'nodes',
            value: 'nodes',
            description: 'Discover and target paired nodes',
          },
          {
            name: 'image',
            value: 'image',
            description: 'Analyze an image with the configured image model',
          },
          {
            name: 'image_generation',
            value: 'image_generation',
            description: 'Generate new images or edit reference images',
          },
          {
            name: 'message',
            value: 'message',
            description: 'Cross-channel messaging',
          },
          {
            name: 'cron',
            value: 'cron',
            description: 'Manage Gateway cron jobs and wakeups',
          },
          {
            name: 'gateway',
            value: 'gateway',
            description: 'Gateway management',
          },
          {
            name: 'sessions_list',
            value: 'sessions_list',
            description: 'List sessions',
          },
          {
            name: 'sessions_history',
            value: 'sessions_history',
            description: 'Fetch session history',
          },
          {
            name: 'sessions_send',
            value: 'sessions_send',
            description: 'Send to another session',
          },
          {
            name: 'sessions_spawn',
            value: 'sessions_spawn',
            description: 'Spawn sub-agent',
          },
          {
            name: 'session_status',
            value: 'session_status',
            description: 'Session status card',
          },
          {
            name: 'agents_list',
            value: 'agents_list',
            description: 'List targetable agents',
          },
          {
            name: 'tts',
            value: 'tts',
            description: 'Text to speech',
          },
          {
            name: 'memory_search',
            value: 'memory_search',
            description: 'Semantic search over memory files',
          },
          {
            name: 'memory_get',
            value: 'memory_get',
            description: 'Safe snippet read from memory files',
          },
        ],
      },
      {
        displayName: 'Action',
        name: 'action',
        type: 'string',
        default: '',
        description: 'Action for the tool (e.g., "list" for sessions_list, "poll" for process)',
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
          },
        },
      },
      // exec tool parameters
      {
        displayName: 'Exec Parameters',
        name: 'execParameters',
        type: 'collection',
        typeOptions: {
          multipleValues: false,
        },
        placeholder: 'Add Parameter',
        default: {},
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
            toolName: ['exec'],
          },
        },
        options: [
          {
            displayName: 'Command',
            name: 'command',
            type: 'string',
            default: '',
            description: 'Shell command to execute',
            required: true,
          },
          {
            displayName: 'Yield Milliseconds',
            name: 'yieldMs',
            type: 'number',
            default: 10000,
            description: 'Auto-background after timeout (default 10000)',
          },
          {
            displayName: 'Background',
            name: 'background',
            type: 'boolean',
            default: false,
            description: 'Immediate background mode',
          },
          {
            displayName: 'Timeout',
            name: 'timeout',
            type: 'number',
            default: 1800,
            description: 'Seconds; kills process if exceeded (default 1800)',
          },
          {
            displayName: 'Elevated',
            name: 'elevated',
            type: 'boolean',
            default: false,
            description: 'Run on host if elevated mode is enabled',
          },
          {
            displayName: 'Host',
            name: 'host',
            type: 'options',
            options: [
              { name: 'Sandbox', value: 'sandbox' },
              { name: 'Gateway', value: 'gateway' },
              { name: 'Node', value: 'node' },
            ],
            default: 'sandbox',
            description: 'Host to run command on',
          },
          {
            displayName: 'PTY',
            name: 'pty',
            type: 'boolean',
            default: false,
            description: 'Use a real TTY',
          },
        ],
      },
      // web_search tool parameters
      {
        displayName: 'Web Search Parameters',
        name: 'webSearchParameters',
        type: 'collection',
        placeholder: 'Add Parameter',
        default: {},
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
            toolName: ['web_search'],
          },
        },
        options: [
          {
            displayName: 'Query',
            name: 'query',
            type: 'string',
            default: '',
            description: 'Search query',
            required: true,
          },
          {
            displayName: 'Count',
            name: 'count',
            type: 'number',
            default: 10,
            description: 'Number of results to return (1-10)',
            typeOptions: {
              minValue: 1,
              maxValue: 10,
            },
          },
        ],
      },
      // web_fetch tool parameters
      {
        displayName: 'Web Fetch Parameters',
        name: 'webFetchParameters',
        type: 'collection',
        placeholder: 'Add Parameter',
        default: {},
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
            toolName: ['web_fetch'],
          },
        },
        options: [
          {
            displayName: 'URL',
            name: 'url',
            type: 'string',
            default: '',
            description: 'URL to fetch',
            required: true,
          },
          {
            displayName: 'Extract Mode',
            name: 'extractMode',
            type: 'options',
            options: [
              { name: 'Markdown', value: 'markdown' },
              { name: 'Text', value: 'text' },
            ],
            default: 'markdown',
            description: 'Extraction mode',
          },
          {
            displayName: 'Max Characters',
            name: 'maxChars',
            type: 'number',
            default: 50000,
            description: 'Maximum characters to return',
          },
        ],
      },
      // memory_search tool parameters
      {
        displayName: 'Memory Search Parameters',
        name: 'memorySearchParameters',
        type: 'collection',
        placeholder: 'Add Parameter',
        default: {},
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
            toolName: ['memory_search'],
          },
        },
        options: [
          {
            displayName: 'Query',
            name: 'query',
            type: 'string',
            default: '',
            description: 'Search query for memory',
            required: true,
          },
          {
            displayName: 'Max Results',
            name: 'maxResults',
            type: 'number',
            default: 10,
            description: 'Maximum number of results to return',
          },
        ],
      },
      // memory_get tool parameters
      {
        displayName: 'Memory Get Parameters',
        name: 'memoryGetParameters',
        type: 'collection',
        placeholder: 'Add Parameter',
        default: {},
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
            toolName: ['memory_get'],
          },
        },
        options: [
          {
            displayName: 'Path',
            name: 'path',
            type: 'string',
            default: '',
            description: 'Path to memory file',
            required: true,
          },
          {
            displayName: 'From Line',
            name: 'from',
            type: 'number',
            default: 1,
            description: 'Line number to start reading from (1-indexed)',
          },
          {
            displayName: 'Lines',
            name: 'lines',
            type: 'number',
            default: 100,
            description: 'Maximum number of lines to read',
          },
        ],
      },
      // sessions_list tool parameters
      {
        displayName: 'Sessions List Parameters',
        name: 'sessionsListParameters',
        type: 'collection',
        placeholder: 'Add Parameter',
        default: {},
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
            toolName: ['sessions_list'],
          },
        },
        options: [
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 50,
            description: 'Maximum number of sessions to list',
          },
        ],
      },
      // sessions_send tool parameters
      {
        displayName: 'Sessions Send Parameters',
        name: 'sessionsSendParameters',
        type: 'collection',
        placeholder: 'Add Parameter',
        default: {},
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
            toolName: ['sessions_send'],
          },
        },
        options: [
          {
            displayName: 'Session Key',
            name: 'sessionKey',
            type: 'string',
            default: '',
            description: 'Target session key or ID',
            required: true,
          },
          {
            displayName: 'Message',
            name: 'message',
            type: 'string',
            default: '',
            description: 'Message to send',
            typeOptions: {
              rows: 4,
            },
            required: true,
          },
        ],
      },
      // JSON arguments fallback for other tools
      {
        displayName: 'JSON Arguments',
        name: 'jsonArguments',
        type: 'json',
        default: '{}',
        description: 'JSON object of arguments (for tools without specific parameters)',
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
            toolName: ['process', 'browser', 'canvas', 'nodes', 'image', 'image_generation', 'message', 'cron', 'gateway', 'sessions_history', 'sessions_spawn', 'session_status', 'agents_list', 'tts'],
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
          const toolName = this.getNodeParameter('toolName', i) as string;
          const action = this.getNodeParameter('action', i, '') as string;
          let args = {};
          
          // Tool-specific parameter collections
          if (toolName === 'exec') {
            const execParams = this.getNodeParameter('execParameters', i, {}) as any;
            args = { ...execParams };
          } else if (toolName === 'web_search') {
            const webSearchParams = this.getNodeParameter('webSearchParameters', i, {}) as any;
            args = { ...webSearchParams };
          } else if (toolName === 'web_fetch') {
            const webFetchParams = this.getNodeParameter('webFetchParameters', i, {}) as any;
            args = { ...webFetchParams };
          } else if (toolName === 'memory_search') {
            const memorySearchParams = this.getNodeParameter('memorySearchParameters', i, {}) as any;
            args = { ...memorySearchParams };
          } else if (toolName === 'memory_get') {
            const memoryGetParams = this.getNodeParameter('memoryGetParameters', i, {}) as any;
            args = { ...memoryGetParams };
          } else if (toolName === 'sessions_list') {
            const sessionsListParams = this.getNodeParameter('sessionsListParameters', i, {}) as any;
            args = { ...sessionsListParams };
          } else if (toolName === 'sessions_send') {
            const sessionsSendParams = this.getNodeParameter('sessionsSendParameters', i, {}) as any;
            args = { ...sessionsSendParams };
          } else {
            // Fallback to JSON arguments
            const jsonArgs = this.getNodeParameter('jsonArguments', i, '{}') as string;
            try {
              args = JSON.parse(jsonArgs);
            } catch (error) {
              throw new Error(`Invalid JSON arguments: ${(error as Error).message}`);
            }
          }
          
          const response = await openClawApiRequest.call(this, {
            method: 'POST',
            url: '/tools/invoke',
            body: {
              tool: toolName,
              action,
              args,
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