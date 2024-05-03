export type DbType =
  | 'postgres'
  | 'mariadb'
  | 'mysql'
  | 'cockroachdb'
  | 'sqlite';

export type Profile = {
  name: string;
  lastname: string;
  email: string;
  createdAt: Date;
};

export type Payload = {
  user: {
    id: number;
    name: string;
    lastname: string;
    email: string;
  };
};
