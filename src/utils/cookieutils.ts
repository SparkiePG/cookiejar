// cookieUtils.ts
// SPDX-License-Identifier: GPL-3.0-only
// This file is part of Cookie Cabinet, a derivative work based on Cookie-Editor.
// Original project: https://github.com/Moustachauve/cookie-editor
// Copyright (C) 2023-present Cookie Cabinet contributors

// Define the Cookie interface matching chrome.cookies.Cookie
export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  expirationDate?: number;
  url?: string; // Used for communication, not stored by chrome.cookies
  // hostOnly?: boolean; // These are read-only properties from chrome.cookies
  // session?: boolean;
  //storeId?: string;
}

// Utility function to get the URL for a cookie based on its properties
export const getCookieUrl = (cookie: Cookie): string => {
  const protocol = cookie.secure ? 'https://' : 'http://';
  // Ensure domain starts with a dot if it's not host-only, though chrome API usually handles this
  const domain = cookie.domain.startsWith('.') ? cookie.domain : `.${cookie.domain}`;
  return `${protocol}${domain}${cookie.path}`;
};

// Utility function to format expiration date for display
export const formatExpirationDate = (timestamp?: number): string => {
  if (timestamp === undefined) {
    return 'Session';
  }
  return new Date(timestamp * 1000).toISOString();
};