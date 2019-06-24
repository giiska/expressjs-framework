declare namespace Express {
  export interface Request {
    payload: any;
    file: any;
    files: any;
  }
}