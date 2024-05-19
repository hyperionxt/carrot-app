import { exec } from 'child_process';
import { BACKUP_PATH, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME, DUMP_PATH } from '../../config/vars.config';


export const backupDatabaseFormat = () => {
  const format = 'backup';
  const date = new Date();
  const currentDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
  const backupFilePath = `${BACKUP_PATH}${DB_NAME}-${currentDate}.${format}`;

  exec(
    `start cmd /c ${DUMP_PATH} ${DB_PASSWORD} ${DB_HOST} ${DB_USERNAME} ${DB_PORT} ${DB_NAME} ${backupFilePath}`,
    (error, stdout, stderr) => {
      if (error) {
        return console.error(`exec error: ${error}`);
      }
      if (stderr) {
        return console.error(`stderr: ${stderr}`);
      }
      console.log(
        `Created a backup of ${DB_NAME} at ${date.toLocaleString()} successfully: ${stdout}`,
      );
    },
  );
};
