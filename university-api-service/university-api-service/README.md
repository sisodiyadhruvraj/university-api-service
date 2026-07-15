# University API Service

A REST API on top of the [Hipolabs Universities API](http://universities.hipolabs.com) — search universities by country/name, save favourites to SQLite, and it tracks your search history too. Node + Express under the hood.

## Stack

Node/Express, SQLite (`better-sqlite3`) for favourites and search history, axios for calling the external API, Jest + Supertest for tests, Swagger for the API docs. Helmet/cors/express-rate-limit handle the basic security/rate-limit stuff, winston + morgan handle logging.

## What's here

- `GET /api/universities?country=India&name=engineering` — country required, name optional
- `GET /api/universities/:name` — exact match lookup
- `POST /api/favourites`, `GET /api/favourites`, `DELETE /api/favourites/:id` — save, list, remove
- `GET /api/search-history` — log of past searches (bonus requirement)
- `GET /health` — liveness check

Also added response caching (5 min TTL by default), pagination + sorting on the favourites list, and basic per-IP rate limiting.

## Running it

```bash
npm install
cp .env.example .env
npm run dev
```

Runs on port 3000. The SQLite file is created automatically the first time it runs, nothing to migrate by hand. Once it's up, Swagger docs are at `/api-docs`.

Or with Docker:

```bash
docker compose up --build
```

## Tests

```bash
npm test
```

Unit tests cover the validators and services, integration tests hit the real endpoints through supertest. Axios is mocked everywhere so tests never actually call the real Hipolabs API, and `NODE_ENV=test` switches the DB to in-memory automatically.

## Structure

```
src/
├── app.js, server.js     
├── config/               
├── controllers/           
├── services/              
├── routes/                  
├── middleware/               
├── utils/                    
└── db/schema.sql               
tests/
├── unit/
└── integration/
postman/                       
```

## Notes

- Errors go through a few custom classes (`ValidationError`, `NotFoundError`, `ConflictError`, `ServiceUnavailableError`) that map to the right status codes, so the client never sees a raw stack trace.
- Favourites are unique per name+country — checked in the service layer and backed by a DB constraint.
- Cache is just a plain in-memory Map with a TTL. Fine for one instance, would move to Redis if this ever needed to run on more than one.

Postman collection's in `/postman` if you'd rather test manually instead of through Swagger.
