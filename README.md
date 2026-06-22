# Ticket Viewer

A GIS-enabled ticket search application built with React, NestJS, PostgreSQL, and PostGIS.

## Tech Stack

### Frontend
- React + TypeScript
- Material UI
- Leaflet

### Backend
- NestJS
- TypeORM

### Database
- PostgreSQL
- PostGIS

## Features Overview
Core:
- Create a simple page for ticket search.
- Add filters for status, station code, and utility type.
- Add a Search button.
- Call the backend endpoint using the selected filters.
- Show total ticket count in the summary card.
- Show tickets in a table/list.
- Show coordinates for each ticket.
- Handle loading and error states.

Bonus:
- Show ticket markers on a Leaflet map.
- Use current map bounds as bbox. （no automatic search triggered）
- Add debounce when map bounds change.
- Add pagination or limit handling.

## Run Locally

### 1. Start PostgreSQL + PostGIS

```bash
docker-compose up -d
```

### 2. Initialize Database
```bash
docker exec -i gis-postgres psql -U postgres -d gisdb < database/01_schema.sql
docker exec -i gis-postgres psql -U postgres -d gisdb < database/02_seed.sql
```

### 3. Start Backend
```bash
cd backend
npm install
npm run start:dev
```
Backend runs on: http://localhost:3000

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

## API Endpoints

### GET /api/tickets/search

Search tickets within a bounding box and apply optional filters.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| bbox | Yes | Bounding box in format: `minLng,minLat,maxLng,maxLat` |
| status | No | Filter by ticket status |
| stationCode | No | Filter by station code |
| utilityType | No | Filter by utility type |

#### Example Request

```bash
curl "http://localhost:3000/api/tickets/search?bbox=-80,43,-79,44&status=PRE_COMPLETED"
```
Example Response：

```bash
{
  "tickets": [
    {
      "id": 1,
      "ticketNo": "20261318930",
      "status": "PRE_COMPLETED",
      "priority": "STANDARD",
      "stationCode": "HLTNW02",
      "utilityType": "WATER",
      "longitude": -79.8711,
      "latitude": 43.2557
    }
  ],
  "summary": {
    "total": 1,
    "byStatus": {
      "PRE_COMPLETED": 1
    }
  }
}
```

### GET /api/tickets/meta

Returns available filter values for the frontend dropdowns.

#### Example Request
```bash
GET "http://localhost:3000/api/tickets/meta"
```

Example Response:
```bash
{
  "status": [
    "PRE_COMPLETED",
    "OFFICE_CLEAR",
    "COMPLETED"
  ],
  "stationCodes": [
    "HLTNW02",
    "HLTST01",
    "HLDT01"
  ],
  "utilityTypes": [
    "WATER",
    "SANITARY",
    "TELECOM"
  ]
}
```