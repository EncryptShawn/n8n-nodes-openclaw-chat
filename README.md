# n8n Node for OpenClaw Gateway HTTP API

[![npm version](https://img.shields.io/npm/v/npm-nodes-openclaw-chat)](https://www.npmjs.com/package/npm-nodes-openclaw-chat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This n8n community node provides integration with **OpenClaw Gateway HTTP API**, enabling you to interact with OpenClaw agents directly from your n8n workflows. It supports chat completions, embeddings, model listing, OpenResponses, and direct tool invocation.

## Features

- **Chat Completions**: Standard OpenAI-compatible chat completions with streaming support
- **Embeddings**: Generate embeddings for text inputs
- **Model Listing**: List available OpenClaw models/agents
- **OpenResponses**: Native OpenClaw responses with file uploads, tools, and session management
- **Tool Invocation**: Direct tool calls (memory search, session listing, etc.)
- **Flexible Authentication**: Support for multiple OpenClaw Gateway instances
- **Error Handling**: Comprehensive error handling with informative messages

## Installation

### Method 1: Community Nodes (Recommended)
1. Go to **Settings → Community Nodes** in your n8n instance
2. Click **"Install"**
3. Enter `npm-nodes-openclaw-chat` and click **"Install"**

### Method 2: Manual Installation
```bash
cd ~/.n8n/nodes
npm install npm-nodes-openclaw-chat
```

### Method 3: Docker Deployment
Add to your `docker-compose.yml`:
```yaml
volumes:
  - ~/.n8n/nodes:/home/node/.n8n/nodes

environment:
  - N8N_CUSTOM_EXTENSIONS=npm-nodes-openclaw-chat
```

## Configuration

### 1. Create OpenClaw API Credentials
1. In your n8n workflow, add an **OpenClaw Chat** node
2. Click the **"Create New Credential"** button
3. Select **"OpenClaw API"** credential type
4. Fill in the following fields:

| Field | Description | Example |
|-------|-------------|---------|
| **Base URL** | Your OpenClaw Gateway URL | `http://localhost:18789` or `https://agent1.apipie.ai` |
| **API Token** | Bearer token from OpenClaw Gateway | `82af605cb191558a24874cdc5983cd07bdd40819723920cb2502f4bd456bc026` |
| **Default Agent ID** | Default agent for chat completions | `default`, `main`, `webchat` |
| **Allow Insecure HTTPS** | Allow self-signed certificates (dev only) | `false` |

> **Security Note**: Keep your API token secure. Never commit it to version control.

### 2. Get Your OpenClaw Gateway Token
- **Local OpenClaw**: Check `~/.openclaw/openclaw.json` for `gateway.auth.token`
- **OpenClaw Cloud**: Available in your instance dashboard
- **Generate new token**: Run `openclaw gateway token generate`

## Node Operations

### 📨 Chat Completion
**Endpoint**: `POST /v1/chat/completions`

Create chat completions with OpenAI-compatible API.

#### Parameters:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Model | String | Yes | `openclaw/default` | Model identifier (`openclaw/<agentId>`) |
| Messages | Array | Yes | - | Conversation history with role/content |
| Stream | Boolean | No | `false` | Enable streaming response (SSE) |
| Max Tokens | Number | No | `4096` | Maximum tokens to generate |
| Temperature | Number | No | `1` | Sampling temperature (0-2) |
| Top P | Number | No | `1` | Nucleus sampling (0-1) |
| Frequency Penalty | Number | No | `0` | Frequency penalty (-2 to 2) |
| Presence Penalty | Number | No | `0` | Presence penalty (-2 to 2) |
| Stop Sequences | String | No | - | Sequences to stop generation |
| User | String | No | - | End-user identifier |

#### Example Workflow:
```
Manual Trigger → OpenClaw Chat (Chat Completion)
```

**Node Configuration**:
- Resource: `Chat Completion`
- Operation: `Create`
- Model: `openclaw/default`
- Messages:
  - Role: `system`, Content: `You are a helpful assistant`
  - Role: `user`, Content: `What skills are installed?`
- Temperature: `0.7`

### 🔤 Embeddings
**Endpoint**: `POST /v1/embeddings`

Generate embeddings for input text.

#### Parameters:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Model | String | Yes | `openclaw/default` | Embedding model |
| Input | String | Yes | - | Text or array of texts to embed |
| Encoding Format | Options | No | `float` | `float` or `base64` |
| User | String | No | - | End-user identifier |

#### Example Workflow:
```
Webhook → OpenClaw Chat (Embeddings) → Vector Database
```

### 📋 Model Listing
**Endpoint**: `GET /v1/models`

List available OpenClaw models and agents.

#### Example Workflow:
```
Schedule Trigger → OpenClaw Chat (Model List) → Google Sheets
```

### 🚀 OpenResponses
**Endpoint**: `POST /v1/responses`

Native OpenClaw responses with advanced features (files, tools, session persistence).

#### Parameters:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Model | String | Yes | `openclaw` | Model identifier |
| Input | String/Array | Yes | - | Text, message array, or structured input |
| Stream | Boolean | No | `false` | Enable streaming response |
| Tools | JSON | No | - | Tool definitions array |
| User | String | No | - | Stable session identifier |
| Previous Response ID | String | No | - | Continue previous conversation |

#### Example Workflow:
```
Email Attachment → File Parse → OpenClaw Chat (Response) → Send Answer
```

### 🛠️ Tool Invocation
**Endpoint**: `POST /tools/invoke`

Direct tool invocation without full agent turn.

#### Parameters:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Tool Name | String | Yes | - | Tool name (e.g., `memory_search`, `sessions_list`) |
| Action | String | No | - | Tool action (e.g., `json`) |
| Arguments | JSON | No | `{}` | Tool arguments |

#### Example Workflow:
```
Manual Trigger → OpenClaw Chat (Tool) → Filter → Display Results
```

**Supported Tools** (subject to gateway policy):
- `memory_search` - Search memory files
- `sessions_list` - List active sessions
- `cron_list` - List cron jobs
- `gateway_status` - Gateway health check
- ...and other non-destructive tools

## Advanced Usage

### Streaming Responses
Enable streaming for real-time token delivery:

1. Select **"Create Streaming"** operation for Chat Completion or Response resources
2. Connect to **"Split In Batches"** node to process chunks
3. Use **"Code"** node to assemble final response

### Session Management
Use the `user` field to maintain conversation context across nodes:

```json
{
  "user": "customer-12345",
  "input": "Follow up on my previous question"
}
```

### File Uploads (OpenResponses)
Use OpenResponses endpoint with base64-encoded files:

```json
{
  "input": [
    {
      "type": "message",
      "role": "user",
      "content": "Summarize this PDF"
    },
    {
      "type": "input_file",
      "source": {
        "type": "base64",
        "media_type": "application/pdf",
        "data": "BASE64_DATA",
        "filename": "document.pdf"
      }
    }
  ]
}
```

### Tool Definitions (OpenResponses)
Define client tools for agent use:

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get current weather",
        "parameters": {
          "type": "object",
          "properties": {
            "location": { "type": "string" }
          },
          "required": ["location"]
        }
      }
    }
  ]
}
```

## Example Workflows

### 1. Customer Support Bot
```
Webhook (Customer Question)
    ↓
OpenClaw Chat (Chat Completion)
    ↓
IF (Needs Human)
    ├→ Slack Notification
    └→ Ticket Creation
    ↓
OpenClaw Chat (Response with Tools)
    ↓
Send Email Response
```

### 2. Document Processing Pipeline
```
Google Drive (New File)
    ↓
Convert to Text
    ↓
OpenClaw Chat (Embeddings)
    ↓
Qdrant Vector Store
    ↓
OpenClaw Chat (Response with RAG)
    ↓
Save to Database
```

### 3. Automated Monitoring
```
Schedule Trigger (Every hour)
    ↓
OpenClaw Chat (Tool: sessions_list)
    ↓
Filter (Inactive > 24h)
    ↓
IF (Found)
    └→ Slack Alert
```

## Error Handling

The node includes comprehensive error handling:

| Error Type | Description | Resolution |
|------------|-------------|------------|
| **Authentication Failed** | Invalid API token or base URL | Verify credentials, check gateway status |
| **Endpoint Not Found** | API endpoint disabled | Enable endpoint in gateway config |
| **Rate Limited** | Too many requests | Add wait node, implement backoff |
| **Invalid Input** | Malformed request body | Check parameter formatting |
| **Tool Denied** | Tool blocked by gateway policy | Use allowed tools only |

**Enable "Continue on Fail"** in node settings to handle errors gracefully in your workflow.

## Development

### Project Structure
```
npm-nodes-openclaw-chat/
├── src/
│   ├── credentials/
│   │   └── OpenClawApi.credentials.ts
│   ├── nodes/
│   │   └── OpenClaw/
│   │       ├── OpenClawChat.node.ts
│   │       └── GenericFunctions.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Build from Source
```bash
# Clone repository
git clone https://github.com/EncryptShawn/npm-nodes-openclaw-chat.git
cd npm-nodes-openclaw-chat

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Testing with Local n8n
1. Build the node: `npm run build`
2. Copy to n8n custom nodes directory:
   ```bash
   cp -r dist ~/.n8n/custom/npm-nodes-openclaw-chat
   ```
3. Restart n8n
4. The node will appear as **"OpenClaw Chat"** in the node panel

## API Reference

For complete OpenClaw Gateway HTTP API documentation, see:
- [OpenClaw Docs: Gateway HTTP API](https://docs.openclaw.ai/gateway/http-api)
- [OpenResponses Format](https://docs.openclaw.ai/gateway/openresponses-http-api)
- [Tool Invocation Security](https://docs.openclaw.ai/gateway/security)

## Troubleshooting

### Node Not Appearing
1. Check n8n logs for loading errors
2. Verify node is in `~/.n8n/custom/` directory
3. Restart n8n instance
4. Check n8n version compatibility (requires n8n 1.0+)

### Authentication Errors
```json
{
  "error": "OpenClaw API request failed: HTTP 401"
}
```
1. Verify base URL includes protocol (`http://` or `https://`)
2. Check API token matches gateway token
3. Test connection with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:18789/health
   ```

### Endpoint Errors
```json
{
  "error": "OpenClaw API request failed: HTTP 404"
}
```
1. Ensure endpoint is enabled in gateway config:
   ```json
   {
     "gateway": {
       "http": {
         "endpoints": {
           "chatCompletions": { "enabled": true },
           "responses": { "enabled": true }
         }
       }
     }
   }
   ```
2. Restart gateway after config changes

### Streaming Issues
1. Ensure you're using "Create Streaming" operation
2. Check n8n version supports streaming responses
3. Verify network connectivity to gateway

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

Please follow the [n8n Node Development Guidelines](https://docs.n8n.io/integrations/creating-nodes/).

## Example Workflows

Check the [`examples/`](examples/) directory for ready-to-import n8n workflows:

- **Basic Chat Completion** (`examples/basic-chat-completion.json`) – Simple manual trigger asking OpenClaw to list installed skills

To import a workflow in n8n:
1. Go to **Workflows** → **Import from file**
2. Select the JSON file
3. Configure your OpenClaw API credentials (see [Configuration](#configuration))
4. Execute the workflow

## License

MIT © [EncryptShawn](https://github.com/EncryptShawn)

## Support

- **Issues**: [GitHub Issues](https://github.com/EncryptShawn/npm-nodes-openclaw-chat/issues)
- **Documentation**: [OpenClaw Docs](https://docs.openclaw.ai)
- **Community**: [OpenClaw Discord](https://discord.com/invite/clawd)

---

**Happy Automating!** 🚀