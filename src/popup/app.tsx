// App.tsx
// SPDX-License-Identifier: GPL-3.0-only
// This file is part of Cookie Cabinet, a derivative work based on Cookie-Editor.
// Original project: https://github.com/Moustachauve/cookie-editor
// Copyright (C) 2023-present Cookie Cabinet contributors

import React, { useState, useEffect } from 'react';
import CookieList from './components/CookieList';
import CookieEditor from './components/CookieEditor';
import ImportExport from './components/ImportExport';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import { Cookie } from '../utils/cookieUtils';

const App: React.FC = () => {
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [filteredCookies, setFilteredCookies] = useState<Cookie[]>([]);
  const [selectedCookie, setSelectedCookie] = useState<Cookie | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    chrome.storage.local.get(['darkMode'], (result) => {
      setDarkMode(!!result.darkMode);
    });

    // Load initial cookies
    loadCookies();
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    // Save theme preference
    chrome.storage.local.set({ darkMode });
  }, [darkMode]);

  useEffect(() => {
    // Filter cookies based on search term
    if (!searchTerm) {
      setFilteredCookies(cookies);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredCookies(
        cookies.filter(
          (cookie) =>
            cookie.name.toLowerCase().includes(term) ||
            cookie.value.toLowerCase().includes(term) ||
            cookie.domain.toLowerCase().includes(term)
        )
      );
    }
  }, [cookies, searchTerm]);

  const loadCookies = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      chrome.runtime.sendMessage({ action: 'getCookies' }, (response) => {
        if (response.error) {
          console.error('Failed to load cookies:', response.error);
        } else {
          setCookies(response.cookies);
        }
      });
    }
  };

  const handleAddCookie = () => {
    setIsAdding(true);
    setSelectedCookie(null);
    setIsEditing(true); // Open editor for new cookie
  };

  const handleEditCookie = (cookie: Cookie) => {
    setSelectedCookie(cookie);
    setIsEditing(true);
  };

  const handleDeleteCookie = (cookie: Cookie) => {
    if (window.confirm(`Are you sure you want to delete the cookie "${cookie.name}"?`)) {
      chrome.runtime.sendMessage(
        { action: 'deleteCookie', cookie: { name: cookie.name, url: cookie.url } },
        (response) => {
          if (response.error) {
            console.error('Failed to delete cookie:', response.error);
          } else {
            // Reload cookies after deletion
            loadCookies();
          }
        }
      );
    }
  };

  const handleSaveCookie = (cookie: Cookie) => {
    chrome.runtime.sendMessage({ action: 'saveCookie', cookie }, (response) => {
      if (response.error) {
        console.error('Failed to save cookie:', response.error);
      } else {
        // Reload cookies after save
        loadCookies();
      }
      setIsEditing(false);
    });
  };

  const handleMassDelete = () => {
    if (window.confirm('Are you sure you want to delete ALL cookies for this site?')) {
      chrome.runtime.sendMessage({ action: 'deleteAllCookies' }, (response) => {
        if (response.error) {
          console.error('Failed to delete all cookies:', response.error);
        } else {
          console.log(response.message); // Log success message
          // Reload cookies after mass deletion
          loadCookies();
        }
      });
    }
  };

  const handleImportCookies = (cookies: Cookie[]) => {
    // Logic to import cookies would go here, potentially sending messages to background
    // For now, just reload to show the imported state if it happened externally
    loadCookies();
  };

  const handleExportCookies = (format: 'json') => {
    // Logic to export cookies would go here
    console.log('Exporting cookies in format:', format);
  };

  return (
    <div className={`min-h-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold">Cookie Cabinet</h1>
        <div className="flex items-center space-x-2">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 flex justify-between">
          <button
            onClick={handleAddCookie}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Cookie
          </button>
          <button
            onClick={handleMassDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete All
          </button>
        </div>
        <CookieList
          cookies={filteredCookies}
          onEdit={handleEditCookie}
          onDelete={handleDeleteCookie}
        />
        {isEditing && (
          <CookieEditor
            cookie={selectedCookie}
            onSave={handleSaveCookie}
            onClose={() => setIsEditing(false)}
          />
        )}
        <ImportExport
          onImport={handleImportCookies}
          onExport={handleExportCookies}
        />
      </main>
    </div>
  );
};

export default App;