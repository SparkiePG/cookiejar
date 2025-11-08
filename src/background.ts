// background.ts
// SPDX-License-Identifier: GPL-3.0-only
// This file is part of Cookie Cabinet, a derivative work based on Cookie-Editor.
// Original project: https://github.com/Moustachauve/cookie-editor
// Copyright (C) 2023-present Cookie Cabinet contributors

import { Cookie, getCookieUrl } from './utils/cookieUtils';

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
          // Add the inferred URL to each cookie object for consistency
          const cookiesWithUrl = (cookies || []).map(cookie => ({
            ...cookie,
            url: getCookieUrl(cookie)
          }));
          sendResponse({ cookies: cookiesWithUrl });
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
    // Infer URL from domain, path, and secure flag if not provided explicitly by the popup
    const inferredUrl = cookieData.url || getCookieUrl(cookieData);
    chrome.cookies.set(
      {
        url: inferredUrl,
        name: cookieData.name,
        value: cookieData.value,
        domain: cookieData.domain || undefined, // Chrome API might infer domain from URL if not explicitly set
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
          // Add the inferred URL to the returned cookie object
          const cookieWithUrl = cookie ? { ...cookie, url: getCookieUrl(cookie) } : null;
          sendResponse({ cookie: cookieWithUrl });
        }
      }
    );
    return true; // Asynchronous response
  }

  if (request.action === 'deleteCookie') {
    const { name, url } = request.cookie; // Use the URL provided by the popup
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

        const total = cookies.length;
        if (total === 0) {
          sendResponse({ message: 'No cookies to delete' });
          return;
        }

        let completed = 0;
        const results: { success: boolean; name?: string; error?: string }[] = [];

        cookies.forEach((cookie) => {
          const cookieUrl = getCookieUrl(cookie);
          chrome.cookies.remove(
            {
              url: cookieUrl,
              name: cookie.name,
            },
            (details) => {
              completed++;
              if (details) {
                 results.push({ success: true, name: cookie.name });
              } else {
                 // If details is null, deletion likely failed silently or was not found
                 results.push({ success: false, name: cookie.name, error: 'Not found or could not delete' });
              }
              if (completed === total) {
                const successfulDeletes = results.filter(r => r.success).length;
                const failedDeletes = results.filter(r => !r.success).length;
                let message = `Successfully deleted ${successfulDeletes} of ${total} cookies.`;
                if (failedDeletes > 0) {
                    message += ` ${failedDeletes} failed.`;
                }
                sendResponse({ message, results });
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

  if (request.action === 'importCookies') {
      const cookiesToImport: Cookie[] = request.cookies;
      const currentTabUrl = sender.tab?.url;
      if (!currentTabUrl) {
          sendResponse({ error: 'No active tab URL found for import' });
          return true; // Asynchronous response
      }

      let completed = 0;
      const total = cookiesToImport.length;
      const results: { success: boolean; name?: string; error?: string }[] = [];

      if (total === 0) {
          sendResponse({ message: 'No cookies provided for import' });
          return true;
      }

      cookiesToImport.forEach((cookie) => {
          // Ensure the URL is correctly inferred or set for the import context (current tab)
          const inferredUrl = getCookieUrl({ ...cookie, domain: cookie.domain || new URL(currentTabUrl).hostname.replace(/^www\./, '') }); // Fallback domain if missing
          chrome.cookies.set(
              {
                url: inferredUrl,
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain || undefined,
                path: cookie.path || '/',
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                expirationDate: cookie.expirationDate,
                sameSite: cookie.sameSite,
              },
              (newCookie) => {
                  completed++;
                  if (newCookie) {
                      results.push({ success: true, name: cookie.name });
                  } else {
                      results.push({ success: false, name: cookie.name, error: chrome.runtime.lastError?.message || 'Unknown error' });
                  }
                  if (completed === total) {
                      const successfulImports = results.filter(r => r.success).length;
                      const failedImports = results.filter(r => !r.success).length;
                      let message = `Successfully imported ${successfulImports} of ${total} cookies.`;
                      if (failedImports > 0) {
                          message += ` ${failedImports} failed.`;
                      }
                      sendResponse({ message, results });
                  }
              }
          );
      });
      return true; // Asynchronous response
  }

  // Default response if action doesn't match
  sendResponse({ error: 'Unknown action' });
  return true; // Asynchronous response
});
