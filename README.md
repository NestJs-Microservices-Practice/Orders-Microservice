<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Orders Microservice

## Dev

1. Clonar el repositorio
2. Instalar dependencias
3. Crear un archivo `.env` basado en el [.env.template](.env.template)
4. Ejecutar la migracion de prisma `npx prisma migrate dev`
5. Levantar el servidor NATS si no esta levantado
```
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```
6. Levantar el microservicio
```
npm run start:dev
pnpm run start:dev
yarn start:dev
```

## Nats
```
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```
