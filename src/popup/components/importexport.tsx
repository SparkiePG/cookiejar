// ImportExport.tsx
// SPDX-License-Identifier: GPL-3.0-only
// This file is part of Cookie Cabinet, a derivative work based on Cookie-Editor.
// Original project: https://github.com/Moustachauve/cookie-editor
// Copyright (C) 2023-present Cookie Cabinet contributors

import React from 'react';
import { Cookie } from '../../utils/cookieUtils';

interface ImportExportProps {
  onImport: (cookies: Cookie[]) => void;
  onExport: (format: 'json') => void;
}

const ImportExport: React.FC<ImportExportProps> = ({ onImport, onExport }) => {
  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importedCookies: Cookie[] = JSON.parse(content);
          if (Array.isArray(importedCookies)) {
            onImport(importedCookies);
          } else {
            console.error('Imported file does not contain an array of cookies.');
          }
        } catch (error) {
          console.error('Error parsing imported JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportClick = () => {
    // Example: Export as JSON
    // In a real scenario, you'd fetch the current cookies list from the app state
    // and trigger a download.
    console.log('Triggering JSON export...');
    onExport('json');
  };

  return (
    <div className="mt-6 p-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium mb-2">Import/Export</h3>
      <div className="flex space-x-4">
        <div>
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
        </div>
        <div className="flex items-end">
          <button
            onClick={handleExportClick}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Export Cookies (JSON)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;