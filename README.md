 
## Description

This API REST serves to offer recipes based on ingredients as search parameters. You can not search using specific names of recipes, the only way to search for recipes is by ingredients. Why build this? Offer a quick way to find something to cook for users in times when we have less free time and quick solutions to simple problems are needed... and because I like to cook :)

## Features

SQL database.  
TypeORM.  
JWT.  
Users profiles.  
Users can save or delete recipes from their favorites list.  
Order recipes by countries.  
User roles.  
Trend recipes.  
Pagination.  
Validations.  
Swagger documentation.  
E2e tests.  
Automatic backup database generator.  
Event-based cache invalidation with Redis.  
Cloud storage for images.  
Email JWT system to recover passwords.  

## Installation

```bash
$ pnpm install
$ docker-compose up
```
```.env
APP_PORT=XXXX
DB_TYPE= postgres || mariadb ||myslq || sql3, etc
DB_HOST= XXXXXXX
DB_PORT= XXXX
DB_USERNAME= XXXXXXXXXX
DB_PASSWORD= XXXXXXXXXX
DB_NAME= XXXXXX
DB_NAME_TEST= db for testing
JWT_SECRET_KEY= XXXXXXXXXXXXXXXXXXXXX
DUMP_PATH= path of backup.bat
BACKUP_PATH= path to save the backups
REDIS_CONTAINER_NAME=XXXXXXX
REDIS_LOCAL_PORT=XXXX
REDIS_HOST=XXXXXXXX
MAIL_HOST=smtp.XXXXXX.XXXX
MAIL_PORT=XXX
MAIL_USERNAME=XXXXXXXXXXXX
MAIL_PASSWORD=XXXXXXXXXXX 
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash

# e2e tests
$ pnpm run test:e2e
```

## Swagger Documentation
{your_url_here}/api/doc

_________________________________________________________________________

<div align="center">
  <span>Made with the framework with the icon cat. I mean NestJS.</span>
  <br>
  <img src="https://nestjs.com/img/logo-small.svg" width="50" alt="Nest Logo" />
</div>


 

