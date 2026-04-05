# Changelog

All notable changes to the `n8n-nodes-openclaw-chat` project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-05

### Added
- Initial release of OpenClaw Chat n8n node
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

### Fixed
- TypeScript compilation errors with proper type definitions
- Updated module resolution to Node16 for TypeScript 5.9.3 compatibility
- Removed package-lock.json from version control (added to .gitignore)
- Improved type safety by replacing `unknown` with specific types where possible