import { HttpHeaders } from "@angular/common/http";

export interface ConfigModel{
  api:string;
  env:string
}


export enum Env{
  DEV = 'dev',
  PROD = 'prod'
}

export enum API{
  DEV = 'http://localhost:8080',
  PROD = 'http://localhost:80810'
}

export class Config {
 public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',

    }),
  };
}

