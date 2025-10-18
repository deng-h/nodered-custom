# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Node-RED development environment** (version 4.0.8) configured for developing and testing custom 3D visualization nodes, particularly for robotics and human hand tracking applications. The project includes custom Three.js-based visualization capabilities with enhanced visual effects.

## Development Commands

### Starting Node-RED
```bash
npm start                    # Start Node-RED with default settings
.\start-nodered.bat         # Start with custom settings and data directory
```

### Build and Development
```bash
npm install                 # Install all dependencies
npm run build              # Build Node-RED application
npm run dev                # Development mode with auto-reload
npm run build-dev          # Development build
npm run test               # Run tests using Grunt
npm run docs               # Generate documentation
```

### Test Individual Components
```bash
grunt                      # Run full test suite
grunt simplemocha          # Run specific tests
grunt watch                # Watch for changes and auto-run tasks
```

## Architecture

### Directory Structure
- **`packages/`** - Contains Node-RED core installation and dependencies
- **`data/`** - User data directory with flows, settings, and custom modules
- **`custom_nodes/`** - Custom node development (currently empty - nodes deleted)
- **`node_modules/`** - Root-level dependencies
- **`test/`** - Test files for Node-RED core

### Key Configuration Files
- **`packages/node_modules/node-red/settings.js`** - Main Node-RED configuration
- **`data/.config.nodes.json`** - Node registry and configuration
- **`data/flows.json`** - Current flow definitions
- **`package.json`** - Main project dependencies including custom 3D viewer nodes

### Custom Node System
The project supports custom 3D visualization nodes:
- **Robot 3D Viewer** (`node-red-contrib-robot-3d-viewer`) - Referenced in package.json
- **Hand 3D Viewer** - Previously available but files deleted
- **Humanoid Robot Utils** (`node-red-contrib-humanoid-robot-utils-0.2.0`) - Package tarball exists

Static assets are served through configured paths:
```javascript
httpStatic: [
    {path: 'D:/myCode/13-nodered-dev/data/public', root: "/"},
    {path: 'D:/myCode/13-nodered-dev/custom_nodes/robot-3d-viewer/static', root: "/static/"},
    {path: 'D:/myCode/13-nodered-dev/custom_nodes/hand-3d-viewer/static', root: "/hand-3d-viewer/static/"}
]
```

## Development Workflow

### Setup
1. Install dependencies: `npm install`
2. Build application: `npm run build`
3. Start Node-RED: `npm start` or `.\start-nodered.bat`
4. Access editor: http://localhost:1880/

### Custom Node Development
- Custom nodes are installed in `data/node_modules/`
- Static assets served from `custom_nodes/` directories
- Node registry managed through `.config.nodes.json`

### Editor Configuration
- Monaco editor enabled (modern code editor)
- Projects feature disabled
- Diagnostics enabled for debugging
- File operations use `D:/` as working directory
- External modules allowed in function nodes

## Current State

### Missing Components
- Custom node files in `custom_nodes/` directories were deleted
- Static assets for 3D viewers need restoration
- Some startup scripts may not exist

### Available Features
- Working Node-RED core with enhanced configuration
- Package references for custom 3D viewer nodes
- Enhanced visual effects for robotics applications
- Development-ready environment with Monaco editor

## Testing and Build

The project uses Grunt as the build system:
- **Build process**: Compiles and packages Node-RED
- **Testing**: Mocha-based test suite
- **Documentation**: JSDoc-based documentation generation
- **Development**: Watch mode with auto-reload

## Important Notes

- The system runs on port 1880 by default
- Custom working directory set to `D:/` for file operations
- Debug output limited to 1000 characters
- MQTT reconnect time set to 15 seconds
- HTTP request timeout at 120 seconds