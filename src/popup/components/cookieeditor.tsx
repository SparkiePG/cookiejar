// CookieEditor.tsx
// SPDX-License-Identifier: GPL-3.0-only
// This file is part of Cookie Cabinet, a derivative work based on Cookie-Editor.
// Original project: https://github.com/Moustachauve/cookie-editor
// Copyright (C) 2023-present Cookie Cabinet contributors

import React, { useState, useEffect } from 'react';
import { Cookie } from '../../utils/cookieUtils';

interface CookieEditorProps {
  cookie: Cookie | null;
  onSave: (cookie: Cookie) => void;
  onClose: () => void;
}

const CookieEditor: React.FC<CookieEditorProps> = ({ cookie, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [domain, setDomain] = useState('');
  const [path, setPath] = useState('/');
  const [secure, setSecure] = useState(false);
  const [httpOnly, setHttpOnly] = useState(false);
  const [sameSite, setSameSite] = useState<'strict' | 'lax' | 'none' | undefined>('lax');
  const [expirationDate, setExpirationDate] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (cookie) {
      setName(cookie.name);
      setValue(cookie.value);
      setDomain(cookie.domain);
      setPath(cookie.path);
      setSecure(!!cookie.secure);
      setHttpOnly(!!cookie.httpOnly);
      setSameSite(cookie.sameSite || 'lax');
      setExpirationDate(cookie.expirationDate);
    } else {
      // Default values for a new cookie
      setName('');
      setValue('');
      setDomain(''); // Will be inferred from tab URL if empty
      setPath('/');
      setSecure(false);
      setHttpOnly(false);
      setSameSite('lax');
      setExpirationDate(undefined);
    }
  }, [cookie]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCookie: Cookie = {
      name,
      value,
      domain,
      path,
      secure,
      httpOnly,
      sameSite,
      expirationDate,
      url: '', // This will be set by the background script based on the active tab
    };
    onSave(newCookie);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">{cookie ? 'Edit Cookie' : 'Add Cookie'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Value *</label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., example.com (will use current tab's domain if empty)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Path</label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={secure}
                  onChange={(e) => setSecure(e.target.checked)}
                  className="mr-2"
                />
                Secure
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={httpOnly}
                  onChange={(e) => setHttpOnly(e.target.checked)}
                  className="mr-2"
                />
                HttpOnly
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SameSite</label>
              <select
                value={sameSite}
                onChange={(e) => setSameSite(e.target.value as 'strict' | 'lax' | 'none')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="strict">Strict</option>
                <option value="lax">Lax</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Expiration Date (Unix Timestamp)</label>
            <input
              type="number"
              value={expirationDate || ''}
              onChange={(e) => setExpirationDate(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Leave empty for session cookie"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Save Cookie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CookieEditor;