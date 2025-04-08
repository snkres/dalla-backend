import { Response } from 'express';

export default function setResponseCookies(
  res: Response,
  payload: {
    refresh_token: string;
    access_token: string;
  },
): void {
  res.cookie('refresh_token', payload.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    domain:
      process.env.NODE_ENV !== 'development' ? process.env.domain : 'localhost',
  });

  res.cookie('access_token', payload.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    domain:
      process.env.NODE_ENV !== 'development' ? process.env.domain : 'localhost',
  });

  return;
}
