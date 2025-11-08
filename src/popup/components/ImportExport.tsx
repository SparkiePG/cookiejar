// ImportExport.tsx
// SPDX-License-Identifier: GPL-3.0-only
// This file is part of Cookie Cabinet, a derivative work based on Cookie-Editor.
// Original project: https://github.com/Moustachauve/cookie-editor
// Copyright (C) 2023-present Cookie Cabinet contributors

import React, { useState, useEffect } from 'react';
import { Cookie, getCookieUrl } from '../../utils/cookieUtils';

interface ImportExportProps {
  onImport: (cookies: Cookie[]) => void; // Callback to update parent state after import
  cookies: Cookie[]; // Pass the current list of cookies to populate the dropdown
}

const ImportExport: React.FC<ImportExportProps> = ({ onImport, cookies }) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [selectedCookieForCopy, setSelectedCookieForCopy] = useState<Cookie | null>(null);

  // Update selected cookie when the list changes and a valid selection exists
  useEffect(() => {
      if (selectedCookieForCopy) {
          const updatedCookie = cookies.find(c => c.name === selectedCookieForCopy.name && c.domain === selectedCookieForCopy.domain && c.path === selectedCookieForCopy.path);
          if (updatedCookie) {
              setSelectedCookieForCopy(updatedCookie);
          } else {
              // If the previously selected cookie is no longer in the list, reset selection
              setSelectedCookieForCopy(null);
          }
      }
  }, [cookies]);

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportStatus("Processing file...");
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importedCookies: Cookie[] = JSON.parse(content);
          if (Array.isArray(importedCookies)) {
             // Basic validation could be added here (e.g., check required fields)
             onImport(importedCookies);
             setImportStatus(`Successfully imported ${importedCookies.length} cookies.`);
             setTimeout(() => setImportStatus(null), 5000); // Clear status after 5 seconds
          } else {
            setImportStatus('Error: Imported file does not contain an array of cookies.');
            setTimeout(() => setImportStatus(null), 5000);
          }
        } catch (error) {
          console.error('Error parsing imported JSON:', error);
          setImportStatus(`Error parsing JSON: ${(error as Error).message}`);
          setTimeout(() => setImportStatus(null), 5000);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportClick = (format: 'json') => {
    setExportStatus("Preparing export...");
     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab && currentTab.url) {
            chrome.cookies.getAll({url: currentTab.url}, (allCookies) => {
                if (chrome.runtime.lastError) {
                    setExportStatus(`Export failed: ${chrome.runtime.lastError.message}`);
                    setTimeout(() => setExportStatus(null), 5000);
                    return;
                }
                if (format === 'json') {
                    const dataStr = JSON.stringify(allCookies, null, 2);
                    const dataUri = 'application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

                    const exportFileDefaultName = `cookies_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;

                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                    setExportStatus("Export successful.");
                    setTimeout(() => setExportStatus(null), 3000);
                }
                // Future: Add Netscape format export here
            });
        } else {
            setExportStatus("No active tab found to export cookies from.");
            setTimeout(() => setExportStatus(null), 5000);
        }
    });
  };

  const handleCopyAsSetCookie = () => {
      if (!selectedCookieForCopy) {
           setExportStatus("Please select a cookie first.");
           setTimeout(() => setExportStatus(null), 3000);
           return;
      }
      // Format the cookie according to the Set-Cookie header specification
      // This is a simplified version; a full implementation might handle more fields.
      let setCookieHeader = `${selectedCookieForCopy.name}=${encodeURIComponent(selectedCookieForCopy.value)}`;
      if (selectedCookieForCopy.domain) setCookieHeader += `; Domain=${selectedCookieForCopy.domain}`;
      if (selectedCookieForCopy.path) setCookieHeader += `; Path=${selectedCookieForCopy.path}`;
      if (selectedCookieForCopy.secure) setCookieHeader += '; Secure';
      if (selectedCookieForCopy.httpOnly) setCookieHeader += '; HttpOnly';
      if (selectedCookieForCopy.sameSite) setCookieHeader += `; SameSite=${selectedCookieForCopy.sameSite.charAt(0).toUpperCase() + selectedCookieForCopy.sameSite.slice(1)}`; // Capitalize first letter
      if (selectedCookieForCopy.expirationDate) {
          const date = new Date(selectedCookieForCopy.expirationDate * 1000);
          setCookieHeader += `; Expires=${date.toUTCString()}`;
      }

      navigator.clipboard.writeText(setCookieHeader).then(() => {
          setExportStatus("Set-Cookie header copied to clipboard.");
          setTimeout(() => setExportStatus(null), 3000);
      }).catch(err => {
          console.error('Failed to copy Set-Cookie header: ', err);
          setExportStatus("Failed to copy to clipboard.");
          setTimeout(() => setExportStatus(null), 5000);
      });
  };

  return (
    <div className="mt-6 p-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium mb-2">Import/Export</h3>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Import Cookies (JSON)</label>
            <input
              type="file"
              accept=".json"
              onChange={handleImportChange}
              className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
            />
            {importStatus && <p className={`mt-1 text-sm ${importStatus.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{importStatus}</p>}
          </div>
          <div className="flex items-end">
            <button
              onClick={() => handleExportClick('json')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Export Cookies (JSON)
            </button>
          </div>
        </div>
         <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
             <div className="flex-1">
                 <label className="block text-sm font-medium mb-1">Copy Selected Cookie as Set-Cookie Header</label>
                 <select
                     value={selectedCookieForCopy ? `${selectedCookieForCopy.name}-${selectedCookieForCopy.domain}-${selectedCookieForCopy.path}` : ''}
                     onChange={(e) => {
                         const [name, domain, path] = e.target.value.split('-');
                         const foundCookie = cookies.find(c => c.name === name && c.domain === domain && c.path === path);
                         setSelectedCookieForCopy(foundCookie || null);
                     }}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                 >
                     <option value="">Select a cookie</option>
                     {cookies.map((cookie, index) => (
                         <option key={index} value={`${cookie.name}-${cookie.domain}-${cookie.path}`}>
                             {cookie.name} ({cookie.domain})
                         </option>
                     ))}
                 </select>
             </div>
             <div className="flex items-end">
                 <button
                     onClick={handleCopyAsSetCookie}
                     className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                 >
                     Copy as Set-Cookie
                 </button>
             </div>
         </div>
        {exportStatus && <p className={`mt-2 text-sm ${exportStatus.startsWith('Error') ? 'text-red-500' : exportStatus.startsWith('Failed') ? 'text-red-500' : 'text-green-500'}`}>{exportStatus}</p>}
      </div>
    </div>
  );
};

export default ImportExport;
