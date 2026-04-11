import { Response } from 'express';

export default function setResponseAuthHeaders(
  res: Response,
  payload: {
    refresh_token: string;
    access_token: string;
  },
): void {
  res.setHeader('x-access-token', payload.access_token);
  res.setHeader('x-refresh-token', payload.refresh_token);
}
