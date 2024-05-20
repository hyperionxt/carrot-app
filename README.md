 
## Description

This API REST serves to offer recipes based on ingredients as search parameters. You can not search using specific names of recipes, the only way to search for recipes is by ingredients. Why build this? Offer a quick way to find something to cook for users in times when we have less free time and quick solutions to simple problems are needed... and because I like to cook :)

## Features

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

## Features(in comming)

Redis as cache database.  
Cloud storage for images.  
Transactional emails to recover passwords.  

## Installation

```bash
$ pnpm install
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

<div align="center">
  <span>Made with the framework with a cat as icon. I Mean NestJS.</span>
  <br>
  <img src="https://nestjs.com/img/logo-small.svg" width="50" alt="Nest Logo" />
</div>


 

