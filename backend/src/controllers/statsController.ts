import { Request, Response } from 'express';
import { getStats } from '../sockets/statsSocket';

export const getStatsController = (req: Request, res: Response) => {
  res.json(getStats());
};