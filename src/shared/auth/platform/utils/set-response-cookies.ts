import { CookieOptions, Response } from 'express';

export default function setResponseCookies(
  res: Response,
  payload: {
    refresh_token: string;
    access_token: string;
  },
  options?: CookieOptions,
): void {
  res.cookie('refresh_token', payload.refresh_token, {
    httpOnly: true,
    domain: '.dalla.app',
    ...options,
  });

  res.cookie('access_token', payload.access_token, {
    httpOnly: true,
    domain: '.dalla.app'
    ...options,
  });

  return;
}