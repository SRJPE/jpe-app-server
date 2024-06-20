# JPE App Server

## Table of Contents

1.  **[Objective](#objective)**
2.  **[Dependencies](#dependencies)**
3.  **[Environmental Variables](#environment-variables)**
4.  **[Setup](#setup)**
5.  **[Interacting with the User Interface and Database](#interacting-with-the-user-interface-and-server)**
6.  **[REST API Documentation](#rest-api-documentation)**


## Objective
This server uses Node, Express, and knex to receive HTTP requests and make queries to the Postgresql DB.

## Dependencies

Please ensure these software are installed on your computer:

- Node.js

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

These values pertain to the PostgreSQL database you are attempting to connect to, either the local database instance or the cloud hosted database. See the [RST Database Repo](https://github.com/SRJPE/rst-database) for details on these values.

`AZURE_HOST` 

`AZURE_USER`

`AZURE_PASSWORD`

`AZURE_DB`

`AZURE_PORT`

`AZURE_SSL`

The port value for this server.

`PORT`

## Setup

### Local Server
- Run `npm install` to install all package dependencies
- For runnning the server locally, run the `npm dev-start` command. This will monitor for any changes in the source code and automatically restart your server.
- Once this is successfully running, the server will be accessible at `http://localhost:<PORT>`

### Cloud Server
- For hosting the server within a cloud service, follow the instructions provided by the cloud service provider (Azure, AWS, GCP, etc)
- Once that server has been deployed, the server will be accessible at the location that the cloud service indicates.

## Interacting with the User Interface and Server

Please visit the GitHub repositories for the User Interface and the Server to access setup instructions for those portions of the application.

[User Interface (Tablet Application)](https://github.com/SRJPE/rst-pilot-app-client)

[RST Database Repo](https://github.com/SRJPE/rst-database)



## REST API Documentation

This documentation outlines the requests, payloads, and responses currently available within this server.
  
------------------------------------------------------------------------------------------
