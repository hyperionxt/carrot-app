import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { backupDatabaseFormat } from '../backups/backups-generator';



@Injectable()
export class DatabaseBackupAutoTask {
  @Cron('59 23 * * *')
  handleCron() {
    backupDatabaseFormat();
    console.log('----Database backup in progress----');
  }
}
