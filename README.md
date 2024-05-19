<p align="center">
  <a target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo"" /></a>
</p>

## Description

This app serves to offer recipes based on ingredients that users have available. You can not search using specific names of recipes, the only way to search for recipes is by ingredients.

## Features

JWT.  
Users profiles.  
Trend recipes.  
Pagination.  
Validations.  
Swagger documentation.  
E2e tests.  

## Features(in comming)

Redis as cache db.  
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

