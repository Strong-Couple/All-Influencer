// Express Session 타입 확장
declare global {
  namespace Express {
    interface Request {
      session?: {
        linkingUserId?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
