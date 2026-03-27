# CyberSim UI

CyberSim is a tabletop simulation platform designed to help organizations practice responding to complex digital crises.

It provides a structured environment where teams experience realistic scenarios, make time-bound decisions, and reflect on tradeoffs across operations, communications, security, and public trust.

This repository contains the CyberSim UI: a React application that provides the interactive simulation interface.

## Origins

The CyberSim facilitation app was originally developed by Rising Stack for the National Democratic Institute (NDI), with support from Microsoft and the National Endowment for Democracy, as part of broader efforts to strengthen civic resilience in the digital age.

## How CyberSim Works

CyberSim consists of two applications:

-   **CyberSim Backend** --- Node.js API that manages the database and
    scenario data
-   **CyberSim UI** --- React application that runs the simulation
    interface

The backend stores game data in **PostgreSQL**, while the source
scenario data is maintained in **Airtable**.

The UI communicates with the backend API using the environment variable:

    REACT_APP_API_URL

Example:

    REACT_APP_API_URL=http://localhost:3001

------------------------------------------------------------------------

## Source Code Documentation

For basic source code explanations see the wiki:

https://github.com/cdoten/CyberSim-UI/wiki

------------------------------------------------------------------------

# CyberSim UI Deployment Guide

The CyberSim Game comprises two distinct applications:

-   Node.js backend API
-   React frontend UI

This guide covers deployment of the **React UI application**.

For instructions on deploying the backend application see:

https://github.com/cdoten/CyberSim-Backend#readme

------------------------------------------------------------------------

# Deployment Steps

Main deployment steps:

1.  Set up the S3 bucket for static website hosting
2.  Set up the CodePipeline
3.  Set up the CodeBuild project

------------------------------------------------------------------------

## Multi-Scenario Deployments

CyberSim supports running multiple independent scenarios, each as a
separate deployment pointing at the same codebase.

The active scenario is determined automatically from the hostname
subdomain:

| Hostname | Scenario slug |
|---|---|
| `cso.cybersim.app` | `cso` |
| `campaign.cybersim.app` | `campaign` |
| `cybersim.app` (bare domain) | env var fallback |
| `localhost` | env var fallback |

The scenario slug is passed to the backend when starting or joining a
game, so the backend can load the correct scenario content.

For local development or bare-domain deployments, set the scenario
explicitly:

    REACT_APP_SCENARIO_SLUG=cso

If neither the subdomain nor the env var is set, the UI defaults to
`cso`.

Each scenario requires its own backend deployment with its own Airtable
base imported into the database. See the Scenario Import section below.

------------------------------------------------------------------------

## Environment Component Naming Convention

Environment component names follow this format:
- **CyberSim Backend API** (Node.js / Express): manages game state, scenario data, and persistence
- **CyberSim UI** (React): renders the simulation interface for facilitators and participants

The backend stores game data in PostgreSQL. Source scenario content is maintained in Airtable and imported into the backend database.

For backend setup and deployment, see:  
https://github.com/cdoten/CyberSim-Backend

## Technology Stack

- React (Create React App)
- JavaScript
- Static build output (`build/`)

## Configuration

The UI communicates with the backend using:

```
REACT_APP_API_URL
```

Example (local development):

```
REACT_APP_API_URL=http://localhost:3001
```

## Requirements

- Node.js (v22 recommended)
- npm

## Local Development

Clone the repository:

```bash
git clone <REPO_LINK>
cd CyberSim-UI
```

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Set your backend API URL in `.env`, for example:

```bash
REACT_APP_API_URL=http://localhost:3001
```

Start the UI:

```bash
npm start
```

The UI runs at:

```
http://localhost:3000
```

## Available Scripts

Start development server:

```bash
npm start
```

Run tests:

```bash
npm test
```

Build production bundle:

```bash
npm run build
```

The production bundle is output to:

```
build/
```

## Deployment

This UI is a static React application.

You have two AWS deployment options:

- **Legacy:** S3 + CodePipeline  
  `docs/aws-s3-deployment.md`

- **Recommended:** AWS Amplify Hosting  
  `docs/aws-amplify-deployment.md`

In all deployment approaches, ensure:

```
REACT_APP_API_URL
```

is set to the live backend API URL.

## Scenario Import (Airtable → Database)

After updating scenario content in Airtable, the scenario must be imported into the backend database before running a new game.

The UI triggers the backend endpoint:

```
POST /scenario/import
```

The backend performs the import into PostgreSQL. See backend documentation for required environment variables and access controls.
