import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
} from 'n8n-workflow';

interface OpenClawApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  body?: any;
  qs?: any;
  headers?: Record<string, string>;
  auth?: boolean;
}

export async function openClawApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
  options: OpenClawApiRequestOptions,
): Promise<any> {
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
    const response = await this.helpers.httpRequest(requestOptions);

    // Handle HTTP error status codes
    if (response.statusCode && response.statusCode >= 400) {
      const errorMessage = response.body?.error?.message || response.body?.message || response.body || `HTTP ${response.statusCode}`;
      throw new Error(`OpenClaw API error: ${errorMessage}`);
    }

    return response.body || response;
  } catch (error) {
    const err = error as any;
    if (err.response?.body) {
      const errorMessage = err.response.body.error?.message || err.response.body.message || JSON.stringify(err.response.body);
      throw new Error(`OpenClaw API request failed: ${errorMessage}`);
    }
    throw new Error(`OpenClaw API request failed: ${err.message}`);
  }
}

export async function openClawApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  propertyName: string,
  options: OpenClawApiRequestOptions,
): Promise<any[]> {
  const returnData: any[] = [];
  let responseData;

  do {
    responseData = await openClawApiRequest.call(this, options);
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