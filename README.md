# cybersim-ui

Backend API: http://localhost:3001\
Frontend UI: http://localhost:3000

------------------------------------------------------------------------

## Local Development Setup

To set up the project on your local environment run the following
commands:

    # Clone the project
    git clone <REPO_LINK>

    # Install dependencies
    npm install

    # Create environment file
    cp .env.example .env

    # Start the React App on localhost:3000
    npm start

------------------------------------------------------------------------

## Architecture Overview

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

## Environment Component Naming Convention

Environment component names follow this format:

    <ACCOUNT_ALIAS>@<COMPONENT_NAME>

------------------------------------------------------------------------

## GitHub Repository (cdoten/CyberSim-UI)

All local repository changes are pushed to new branches in the GitHub
repository.\
Changes are reviewed and merged into the `master` branch.

------------------------------------------------------------------------

## CodePipeline (example: ndi@CyberSim-UI)

A separate CodePipeline project is created for each production
environment.

The pipeline consists of three stages.

------------------------------------------------------------------------

### SOURCE

1.  Set the Source provider to **GitHub (Version 2)**.
2.  Connect to the repository:

```{=html}
<!-- -->
```
    cdoten/CyberSim-UI

3.  Use branch:

```{=html}
<!-- -->
```
    master

4.  Enable automatic builds on push.

------------------------------------------------------------------------

### BUILD

1.  Set the Build provider to **AWS CodeBuild**.
2.  Select the **CyberSim-Codebuild** project (or create it).
3.  Add environment variable:

```{=html}
<!-- -->
```
    REACT_APP_API_URL

Set its value to the backend API URL.

Example:

    https://cybersimbackend.demcloud.org

4.  Build type: **Single build**

------------------------------------------------------------------------

### DEPLOY

1.  Deploy provider: **Amazon S3**
2.  Select the environment bucket
3.  Enable:

```{=html}
<!-- -->
```
    Extract file before deploy

No additional deployment path is required.

------------------------------------------------------------------------

# CodeBuild (ndi@CyberSim-Codebuild)

CodeBuild compiles the React application into static assets.

After CodePipeline receives a source change:

1.  Source code is sent to CodeBuild
2.  `buildspec.yml` runs
3.  Node + dependencies install
4.  React app is compiled
5.  Static files are deployed to S3

------------------------------------------------------------------------

## Creating the CodeBuild Project

Recommended configuration:

Environment image:

    aws/codebuild/amazonlinux2-x86_64-standard:5.0

Node version must match the version used by the project.

Refer to:

    buildspec.yml

for the expected runtime.

Other settings:

-   Environment type: Linux EC2
-   Privileged mode: disabled
-   Build specification: use `buildspec.yml`

------------------------------------------------------------------------

# S3 Static Hosting

Each environment uses a separate S3 bucket configured for static website
hosting.

------------------------------------------------------------------------

# Scenario Import

The game data originates from an Airtable base.

After modifying scenario content in Airtable, the data must be imported
into the backend database before starting a new game.

The UI performs this operation by calling the backend API endpoint:

    POST /scenario/import

This endpoint loads the Airtable data into the PostgreSQL database.

------------------------------------------------------------------------

## Step-by-Step Import Process

1.  **Master Password**

Set the backend environment variable:

    MIGRATION_PASSWORD

This password authorizes scenario imports.

2.  **Access Airtable**

Visit:

https://airtable.com

3.  **Generate a Personal Access Token**

Navigate to the Airtable Developer Hub and create a personal access
token.

4.  **Retrieve the Airtable Base ID**

Open your Airtable base and copy the `BASE_ID` from the URL.

Example:

    https://airtable.com/BASE_ID/...

5.  **Enter Airtable Credentials**

Provide:

-   Airtable access token
-   Airtable base ID
-   Migration password

6.  **Initiate the Import**

Click:

    Import scenario

The backend will then load the Airtable data into the PostgreSQL
database.

------------------------------------------------------------------------

# Available Scripts

### Start development server

    npm start

Runs the app in development mode.

Open:

http://localhost:3000

------------------------------------------------------------------------

### Run tests

    npm test

------------------------------------------------------------------------

### Build production bundle

    npm run build

Creates a production build in:

    build/

These files are deployed to S3.

------------------------------------------------------------------------

# Airtable Handbook

## Purchased Mitigations

Mitigations are grouped by category.

To change ordering:

1.  Open the `purchase_mitigations` table
2.  Group by `category`
3.  Reorder items inside each group

------------------------------------------------------------------------

## Locations

The game supports exactly two locations:

    hq
    local

Do not change the `location_code` values.

------------------------------------------------------------------------

## Dictionary

The dictionary table allows customization of terminology such as
replacing:

-   poll
-   budget

Add synonyms using the `synonym` column.
