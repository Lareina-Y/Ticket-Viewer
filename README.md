# Ticket-Viewer


## setup database
docker exec -i gis-postgres psql -U postgres -d gisdb < database/init.sql

## into database
docker exec -it gis-postgres psql -U postgres -d gisdb

docker compose up -d

cd backend
npm run start:dev

cd frontend
npm run dev

http://localhost:5173

docker compose down -v