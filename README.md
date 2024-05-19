<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>



## Installation

```bash
$ pnpm install
```
``` ENV VARS
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
