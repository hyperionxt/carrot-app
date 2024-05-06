import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { backupDatabaseFormat } from '../backups/backups-generator';



@Injectable()
export class DatabaseBackupAutoTask {
  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    backupDatabaseFormat();
    console.log('----Database backup in progress----');
  }
}
