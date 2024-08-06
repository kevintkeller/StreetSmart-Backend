import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';

@Injectable()
export class CookieMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {

    cookieParser()(req, res, (err) => {
      if (err) {
        console.log(err);
      }

      const cookieValue = req.cookies['jwt'];

      if (cookieValue) {
        req.headers['authorization'] = `Bearer ${cookieValue}`;
      }
      next();
    });
  }
}