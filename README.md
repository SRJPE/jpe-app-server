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

### Authentication
- This server utilizes authentication middleware to authenticate and authorize HTTP requests using Bearer Tokens. The current code utilizes Azure AD B2C to perform this functionality.

- You will need to refactor this logic if you do not intend to replicate the Azure AD B2C flow. The authentication middleware can you found in `src/middleware/auth-middleware.ts`

## Interacting with the User Interface and Server

Please visit the GitHub repositories for the User Interface and the Server to access setup instructions for those portions of the application.

[User Interface (Tablet Application)](https://github.com/SRJPE/rst-pilot-app-client)

[RST Database Repo](https://github.com/SRJPE/rst-database)



## REST API Documentation

This documentation outlines the requests, payloads, and responses currently available within this server.
  
------------------------------------------------------------------------------------------
### Trap Visit Requests

#### Creating a trap visit

<details>
 <summary><code>POST</code> <code><b>/trap-visit</b></code></summary>

##### Body

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | None      |  required | object (JSON)   | N/A  |
Example:
```
{
  "trapVisitUid": <unique string of length 11>,
  "crew": [<array of crew member personnel IDs], 
  "programId": <program id>,
  "visitTypeId": null, 
  "trapLocationId": <trap location id>, 
  "isPaperEntry": boolean,
  "trapVisitTimeStart": timestamp,
  "trapVisitTimeEnd": timestamp,
  "fishProcessed": <id from fish_processed table>,
  "whyFishNotProcessed": <id from why_fish_not_processed table> | NULL,
  "sampleGearId": <id from equipment table> | NULLm
  "coneDepth": <integer> | NULL,
  "trapInThalweg": <boolean> | NULL,
  "trapFunctioning": <id from trap_functionality table>,
  "whyTrapNotFunctioning": <id from why_trap_not_functioning table> | NULL,
  "trapStatusAtEnd": <id from trap_status_at_end table>,
  "totalRevolutions": <integer> | NULL
  "rpmAtStart": <integer> | NULL
  "rpmAtEnd": <integer> | NULL
  "trapVisitEnvironmental": [
    {
      "measureName": <string>,
      "measureValueNumeric": <integer>,
      "measureValueText": <string>,
      "measureUnit": <id from unit table>
    },
  ],
  "trapCoordinates": {
    "xCoord": <float> | NULL,
    "yCoord":<float> | NULL,
    "datum": <string> | NULL,
    "projection": <string> | NULL
  },
  "inHalfConeConfiguration": boolean,
  "debrisVolumeLiters": <integer> | NULL,
  "qcCompleted": <boolean> | NULL,
  "qcCompletedAt": <boolean> | NULL,
  "comments": <string> | NULL
}
```

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`     | `application/json; charset=utf-8` | JSON Object |
> | `400`     | `application/json; charset=utf-8` | {"code":"400","message": \<error message> } |

</details>

------------------------------------------------------------------------------------------

#### Get neccesary dropdown values for the Trap Visit form
 
<details>
 <summary><code>GET</code> <code><b>/trap-visit/dropdowns</b></code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response    |
> | --------- | -------------------------- | ----------- |
> | `200`     | `application/json; charset=utf-8` | JSON Object |
> | `400`     | `application/json; charset=utf-8` | {"code":"400","message": \<error message> } |

##### Example cURL

> ```javascript
>  curl -X GET http://localhost:8000/trap-visit/dropdowns
> ```
</details>

#### Get Trap Visit setup values (program, traps, crew, etc) for a personnel
 
<details>
 <summary><code>GET</code> <code><b>/trap-visit/visit-setup/default/:personnelId</b></code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response    |
> | --------- | -------------------------- | ----------- |
> | `200`     | `application/json; charset=utf-8` | JSON Object |
> | `400`     | `application/json; charset=utf-8` | {"code":"400","message": \<error message> } |

</details>

