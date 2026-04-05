# Changelog

All notable changes to the `n8n-nodes-openclaw-chat` project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-05

### Added
- Initial stable release of OpenClaw Chat n8n node
- Support for all OpenClaw Gateway HTTP API endpoints:
  - Chat completions (standard and streaming)
  - Embeddings generation
  - Model listing
  - OpenResponses (with file uploads and tool definitions)
  - Direct tool invocation
- Comprehensive credential management with:
  - Base URL configuration
  - API token authentication
  - Default agent ID
  - Insecure HTTPS toggle for development
- Detailed documentation with examples
- TypeScript source code with linting and testing setup
- Example workflows for quick start

### Fixed
- TypeScript compilation errors with proper type definitions
- Updated module resolution to Node16 for TypeScript 5.9.3 compatibility
- Removed package-lock.json from version control (added to .gitignore)
- Improved type safety by replacing `unknown` with specific types where possible

## [1.0.5] - 2026-04-05

### Fixed
- Restored original custom SVG logo that was accidentally replaced with generic icon
- SVG file now contains the correct custom claw/animal logo

## [1.0.4] - 2026-04-05

### Added
- Structured parameter fields for key OpenClaw tools:
  - `exec`: command, yieldMs, background, timeout, elevated, host, pty
  - `web_search`: query, count
  - `web_fetch`: url, extractMode, maxChars
  - `memory_search`: query, maxResults
  - `memory_get`: path, from, lines
  - `sessions_list`: limit
  - `sessions_send`: sessionKey, message
- Tool Parameters collection that shows relevant fields based on selected tool
- JSON arguments fallback for other tools

### Changed
- Replaced generic JSON arguments with structured UI fields for common tools
- Improved user experience with tool-specific parameter validation

## [1.0.3] - 2026-04-05

### Added
- Tool selection dropdown with all OpenClaw built-in tools
- Descriptions for each tool to guide users

### Changed
- Tool Name field changed from free-text string to options dropdown

## [1.0.2] - 2026-04-05

### Added
- Validation for credentials (Base URL and API Token) with clear error messages
- Validation for required fields: messages for chat completion, input for embedding and response
- Response structure validation to catch malformed API responses

### Fixed
- Potential undefined baseUrl error causing "Cannot read properties of undefined (reading 'replace')"
- Improved error handling for missing or invalid credentials
- Ensure requests are properly sent and validated before returning success

## [1.0.1] - 2026-04-05

### Changed
- Removed streaming operations ('Create Streaming') from chatCompletion and response resources
- Updated displayOptions to only show for 'create' operation
- Hardcoded `stream: false` in all request bodies to ensure OpenClaw returns non-streaming responses (n8n compatibility)
- Removed unused Stream parameter fields

### Fixed
- n8n compatibility issue where streaming responses caused requests to hang

## [0.1.0] - 2026-04-05

### Added
- Initial release of OpenClaw Chat n8n node
- Support for all OpenClaw Gateway HTTP API endpoints
- Comprehensive credential management
- Detailed documentation with examples
- TypeScript source code with linting and testing setup

### Fixed
- TypeScript compilation errors with proper type definitions
- Updated module resolution to Node16 for TypeScript 5.9.3 compatibility
- Removed package-lock.json from version control
- Improved type safety by replacing `unknown` with specific types where possible