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

#### Creating a catch record

<details>
 <summary><code>POST</code> <code><b>/catch-raw</b></code></summary>

##### Body

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | None      |  required | object (JSON)   | N/A  |
Example:
```
{
  "trapVisitId": <id created by database from associated trap visit>,
  "programId": <id from program table>,
  "taxonCode": <species id from taxon table>,
  "captureRunClass": <id from run table> | NULL,
  "captureRunClassMethod": <id from run_code_method table> | NULL,
  "adiposeClipped": <boolean> | NULL,
  "dead": <boolean> | NULL,
  "lifeStage": <id from life_stage table> | NULL
  "forkLength": <integer>,
  "weight": <integer> | NULL,
  "numFishCaught": <integer>,
  "plusCount": <boolean> | NULL,
  "plusCountMethodology": <id from plus_count_methodology table> | NULL,
  "isRandom": <boolean> | NULL,
  "releaseId": <id created by database from associated release record>,
  "comments": <string> | NULL,
  "createdBy": <personnel ID> | NULL,
  "qcCompleted": <boolean> | NULL,
  "qcCompletedBy": <personnel ID> | NULL,
  "qcTime": <timestamp> | NULL,
  "qcComments": <string> | NULL,
  "existingMarks": [
    {
      "releaseId": <id created by database from associated release record> | NULL,
      "markType": <id from mark_type table> ,
      "markColor": <id from mark_color table>,
      "markPosition": <id from body_part table> | NULL,
      "crewMember": <crew member personnelId>
    }
  ],
  "geneticSamplingData": [
    {
      "sampleId": <string>,
      "mucusSwab": <boolean>,
      "finClip": <boolean>,
      "commments": <string> | NULL,
      "crewMember": <crew member personnelId>
    }
  ],
  "appliedMarks": [
    { 
      "markType": <id from mark_type table> ,
      "markColor": <id from mark_color table>,
      "markPosition": <id from body_part table> | NULL,
    }
  ]
}
```

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`     | `application/json; charset=utf-8` | JSON Object |
> | `400`     | `application/json; charset=utf-8` | {"code":"400","message": \<error message> } |

</details>

------------------------------------------------------------------------------------------

#### Get a Catch Record object

<details>
 <summary><code>GET</code> <code><b>/catch-raw/:catchRawId</b></code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response    |
> | --------- | -------------------------- | ----------- |
> | `200`     | `application/json; charset=utf-8` | JSON Object |
> | `400`     | `application/json; charset=utf-8` | {"code":"400","message": \<error message> } |

</details>

#### Get all Catch Records for a Trap Visit

<details>
 <summary><code>GET</code> <code><b>/catch-raw/trap-visit/:trapVisitId</b></code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response    |
> | --------- | -------------------------- | ----------- |
> | `200`     | `application/json; charset=utf-8` | JSON Object |
> | `400`     | `application/json; charset=utf-8` | {"code":"400","message": \<error message> } |

</details>

#### Get all Catch Records for a Program

<details>
 <summary><code>GET</code> <code><b>/catch-raw/program/:programId</b></code></summary>

##### Parameters

> None

##### Responses

> | http code | content-type               | response    |
> | --------- | -------------------------- | ----------- |
> | `200`     | `application/json; charset=utf-8` | JSON Object |
> | `400`     | `application/json; charset=utf-8` | {"code":"400","message": \<error message> } |

</details>

------------------------------------------------------------------------------------------

#### Editing a catch record

<details>
 <summary><code>PUT</code> <code><b>/catch-raw/:catchRawId</b></code></summary>

##### Body

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | None      |  required | object (JSON)   | N/A  |
Example:
```
{
  "trapVisitId": <id created by database from associated trap visit>,
  "programId": <id from program table>,
  "taxonCode": <species id from taxon table>,
  "captureRunClass": <id from run table> | NULL,
  "captureRunClassMethod": <id from run_code_method table> | NULL,
  "adiposeClipped": <boolean> | NULL,
  "dead": <boolean> | NULL,
  "lifeStage": <id from life_stage table> | NULL
  "forkLength": <integer>,
  "weight": <integer> | NULL,
  "numFishCaught": <integer>,
  "plusCount": <boolean> | NULL,
  "plusCountMethodology": <id from plus_count_methodology table> | NULL,
  "isRandom": <boolean> | NULL,
  "releaseId": <id created by database from associated release record>,
  "comments": <string> | NULL,
  "createdBy": <personnel ID> | NULL,
  "qcCompleted": <boolean> | NULL,
  "qcCompletedBy": <personnel ID> | NULL,
  "qcTime": <timestamp> | NULL,
  "qcComments": <string> | NULL,
  "existingMarks": [
    {
      "releaseId": <id created by database from associated release record> | NULL,
      "markType": <id from mark_type table> ,
      "markColor": <id from mark_color table>,
      "markPosition": <id from body_part table> | NULL,
      "crewMember": <crew member personnelId>
    }
  ],
  "geneticSamplingData": [
    {
      "sampleId": <string>,
      "mucusSwab": <boolean>,
      "finClip": <boolean>,
      "commments": <string> | NULL,
      "crewMember": <crew member personnelId>
    }
  ],
  "appliedMarks": [
    { 
      "markType": <id from mark_type table> ,
      "markColor": <id from mark_color table>,
      "markPosition": <id from body_part table> | NULL,
    }
  ]
}
```

## Personnel Requests

## Program Requests
