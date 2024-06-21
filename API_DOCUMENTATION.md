# REST API Documentation

This documentation outlines the requests, payloads, and responses currently available within this server.

## Table of Contents

1.  **[Trap Visit Requests](#trap-visit-requests)**
2.  **[Catch Requests](#catch-requests)**
3.  **[Personnel Requests](#personnel-requests)**
4.  **[Program Requests](#program-requests)**
  
## Trap Visit Requests

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

#### Get a Trap Visit object

<details>
 <summary><code>GET</code> <code><b>/trap-visit/:trapVisitId</b></code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response    |
> | --------- | -------------------------- | ----------- |
> | `200`     | `application/json; charset=utf-8` | JSON Object |
> | `400`     | `application/json; charset=utf-8` | {"code":"400","message": \<error message> } |

</details>

#### Get all trap visits for a Program

<details>
 <summary><code>GET</code> <code><b>/trap-visit/program/:programId</b></code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response    |
> | --------- | -------------------------- | ----------- |
> | `200`     | `application/json; charset=utf-8` | JSON Object |
> | `400`     | `application/json; charset=utf-8` | {"code":"400","message": \<error message> } |

</details>

#### Get neccesary dropdown values for populating the Trap Visit form
 
<details>
 <summary><code>GET</code> <code><b>/trap-visit/dropdowns</b></code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response    |
> | --------- | -------------------------- | ----------- |
> | `200`     | `application/json; charset=utf-8` | JSON Object |
> | `400`     | `application/json; charset=utf-8` | {"code":"400","message": \<error message> } |

</details>

#### Get Trap Visit setup values (program, traps, crew, etc)
 
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

------------------------------------------------------------------------------------------

#### Editing a trap visit

<details>
 <summary><code>PUT</code> <code><b>/trap-visit/:trapVisitId</b></code></summary>

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

## Catch Requests

## Personnel Requests

## Program Requests
