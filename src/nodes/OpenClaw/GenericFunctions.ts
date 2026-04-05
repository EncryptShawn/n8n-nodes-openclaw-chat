import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
} from 'n8n-workflow';

interface OpenClawApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  body?: unknown;
  qs?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  auth?: boolean;
}

interface HttpResponse {
  statusCode?: number;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function openClawApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
  options: OpenClawApiRequestOptions,
): Promise<unknown> {
  const credentials = await this.getCredentials('openClawApi');

  const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
  const apiToken = credentials.apiToken as string;
  const allowInsecureHttps = credentials.allowInsecureHttps as boolean || false;

  const requestOptions = {
    method: options.method,
    uri: baseUrl + options.url,
    body: options.body,
    qs: options.qs,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    json: true,
    rejectUnauthorized: !allowInsecureHttps,
    simple: false, // we'll handle status codes manually
  };

  try {
    const response = await this.helpers.httpRequest(requestOptions) as HttpResponse;

    // Handle HTTP error status codes
    if (response.statusCode && response.statusCode >= 400) {
      const errorBody = response.body as any;
      const errorMessage = errorBody?.error?.message || errorBody?.message || response.body || `HTTP ${response.statusCode}`;
      throw new Error(`OpenClaw API error: ${errorMessage}`);
    }

    return response.body || response;
  } catch (error) {
    const err = error as any;
    if (err.response?.body) {
      const errorBody = err.response.body as any;
      const errorMessage = errorBody.error?.message || errorBody.message || JSON.stringify(err.response.body);
      throw new Error(`OpenClaw API request failed: ${errorMessage}`);
    }
    throw new Error(`OpenClaw API request failed: ${err.message}`);
  }
}

export async function openClawApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  propertyName: string,
  options: OpenClawApiRequestOptions,
): Promise<unknown[]> {
  const returnData: unknown[] = [];
  let responseData;

  do {
    responseData = await openClawApiRequest.call(this, options) as any;
    if (responseData[propertyName]) {
      returnData.push(...responseData[propertyName]);
    } else {
      returnData.push(...responseData);
    }

    // Handle pagination if present
    const nextPage = responseData.next_page_token || responseData.nextPage;
    if (nextPage) {
      options.qs = options.qs || {};
      options.qs.pageToken = nextPage;
    } else {
      break;
    }
  } while (true);

  return returnData;
}

export async function validateCredentials(
  this: ILoadOptionsFunctions,
): Promise<boolean> {
  try {
    await openClawApiRequest.call(this, {
      method: 'GET',
      url: '/health',
    });
    return true;
  } catch {
    return false;
  }
}