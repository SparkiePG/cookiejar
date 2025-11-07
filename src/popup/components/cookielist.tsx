// CookieList.tsx
// SPDX-License-Identifier: GPL-3.0-only
// This file is part of Cookie Cabinet, a derivative work based on Cookie-Editor.
// Original project: https://github.com/Moustachauve/cookie-editor
// Copyright (C) 2023-present Cookie Cabinet contributors

import React from 'react';
import { Cookie } from '../../utils/cookieUtils';

interface CookieListProps {
  cookies: Cookie[];
  onEdit: (cookie: Cookie) => void;
  onDelete: (cookie: Cookie) => void;
}

const CookieList: React.FC<CookieListProps> = ({ cookies, onEdit, onDelete }) => {
  if (cookies.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No cookies found.</p>;
  }

  return (
    <div className="overflow-y-auto max-h-96">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Domain</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Path</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {cookies.map((cookie) => (
            <tr key={`${cookie.domain}-${cookie.path}-${cookie.name}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-2 whitespace-nowrap text-sm">{cookie.name}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm truncate max-w-xs">{cookie.value}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{cookie.domain}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{cookie.path}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <button
                  onClick={() => onEdit(cookie)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(cookie)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CookieList;