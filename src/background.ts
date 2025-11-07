// background.ts
// SPDX-License-Identifier: GPL-3.0-only
// This file is part of Cookie Cabinet, a derivative work based on Cookie-Editor.
// Original project: https://github.com/Moustachauve/cookie-editor
// Copyright (C) 2023-present Cookie Cabinet contributors

import { Cookie } from './utils/cookieUtils';

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCookies') {
    const currentTabUrl = sender.tab?.url;
    if (currentTabUrl) {
      chrome.cookies.getAll({ url: currentTabUrl }, (cookies) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting cookies:', chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ cookies: cookies || [] });
        }
      });
    } else {
      sendResponse({ error: 'No active tab URL found' });
    }
    // Return true to indicate we will send a response asynchronously
    return true;
  }

  if (request.action === 'saveCookie') {
    const cookieData: Cookie = request.cookie;
    chrome.cookies.set(
      {
        url: cookieData.url,
        name: cookieData.name,
        value: cookieData.value,
        domain: cookieData.domain,
        path: cookieData.path,
        secure: cookieData.secure,
        httpOnly: cookieData.httpOnly,
        expirationDate: cookieData.expirationDate,
        sameSite: cookieData.sameSite,
      },
      (cookie) => {
        if (chrome.runtime.lastError) {
          console.error('Error saving cookie:', chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ cookie });
        }
      }
    );
    return true; // Asynchronous response
  }

  if (request.action === 'deleteCookie') {
    const { name, url } = request.cookie;
    chrome.cookies.remove(
      {
        url: url,
        name: name,
      },
      (details) => {
        if (chrome.runtime.lastError) {
          console.error('Error deleting cookie:', chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ details });
        }
      }
    );
    return true; // Asynchronous response
  }

  if (request.action === 'deleteAllCookies') {
    const currentTabUrl = sender.tab?.url;
    if (currentTabUrl) {
      chrome.cookies.getAll({ url: currentTabUrl }, (cookies) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting cookies for deletion:', chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }

        let completed = 0;
        const total = cookies.length;

        if (total === 0) {
          sendResponse({ message: 'No cookies to delete' });
          return;
        }

        cookies.forEach((cookie) => {
          chrome.cookies.remove(
            {
              url: `${cookie.secure ? 'https://' : 'http://'}${cookie.domain}${cookie.path}`,
              name: cookie.name,
            },
            (details) => {
              completed++;
              if (completed === total) {
                // All deletions attempted
                sendResponse({ message: `Deleted ${total} cookies` });
              }
            }
          );
        });
      });
    } else {
      sendResponse({ error: 'No active tab URL found' });
    }
    return true; // Asynchronous response
  }
});