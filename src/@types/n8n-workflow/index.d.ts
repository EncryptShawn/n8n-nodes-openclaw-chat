// Type definitions for n8n-workflow
// Minimal definitions for compilation until actual types are installed

declare module 'n8n-workflow' {
  export interface ICredentialType {
    name: string;
    displayName: string;
    documentationUrl?: string;
    properties: INodeProperties[];
  }

  export interface INodeProperties {
    displayName: string;
    name: string;
    type: string;
    default?: any;
    description?: string;
    placeholder?: string;
    required?: boolean;
    typeOptions?: Record<string, any>;
    options?: Array<{ name: string; value: string }>;
    displayOptions?: {
      show?: Record<string, any>;
      hide?: Record<string, any>;
    };
  }

  export interface IExecuteFunctions {
    getInputData(): any[];
    getNodeParameter(parameterName: string, itemIndex: number, fallbackValue?: any): any;
    getCredentials(type: string): Promise<Record<string, any>>;
    helpers: {
      httpRequest(options: any): Promise<any>;
    };
    continueOnFail(): boolean;
    prepareOutputData(items: any[]): any;
  }

  export interface ILoadOptionsFunctions {
    getCredentials(type: string): Promise<Record<string, any>>;
    helpers: {
      httpRequest(options: any): Promise<any>;
    };
  }

  export interface IHookFunctions {
    getCredentials(type: string): Promise<Record<string, any>>;
    helpers: {
      httpRequest(options: any): Promise<any>;
    };
  }

  export interface IWebhookFunctions {
    getCredentials(type: string): Promise<Record<string, any>>;
    helpers: {
      httpRequest(options: any): Promise<any>;
    };
  }

  export interface INodeExecutionData {
    json: Record<string, any>;
  }

  export interface INodePropertyOptions {
    name: string;
    value: string;
  }

  export interface INodeType {
    description: INodeTypeDescription;
    execute?(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
  }

  export interface INodeTypeDescription {
    displayName: string;
    name: string;
    icon?: string;
    group: string[];
    version: number;
    subtitle?: string;
    description: string;
    defaults: {
      name: string;
      color: string;
    };
    inputs: string[];
    outputs: string[];
    credentials?: Array<{
      name: string;
      required: boolean;
    }>;
    properties: any[];
  }

  // Additional types based on usage
  export interface IDataObject {
    [key: string]: any;
  }
}