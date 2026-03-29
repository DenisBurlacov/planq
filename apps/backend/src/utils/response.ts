import type { Response } from 'express';

export function ok<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json(data);
}

export function created<T>(res: Response, data: T): void {
  res.status(201).json(data);
}

export function noContent(res: Response): void {
  res.status(204).end();
}
