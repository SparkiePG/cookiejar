// App.tsx
// SPDX-License-Identifier: GPL-3.0-only
// This file is part of Cookie Cabinet, a derivative work based on Cookie-Editor.
// Original project: https://github.com/Moustachauve/cookie-editor
// Copyright (C) 2023-present Cookie Cabinet contributors

import React, { useState, useEffect, useRef } from 'react';
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to hold timeout ID

  useEffect(() => {
    // Check for saved theme preference
    chrome.storage.local.get(['darkMode'], (result) => {
      setDarkMode(!!result.darkMode);
    });

    // Load initial cookies
    loadCookies();
  }, []);

  useEffect(() => {
    // Clear previous timeout if status changes quickly
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }

    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    // Save theme preference
    chrome.storage.local.set({ darkMode });

    // Set a timeout to clear the status message after 5 seconds
    if (statusMessage) {
      statusTimeoutRef.current = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }

    // Cleanup timeout on unmount or when status changes
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, [darkMode, statusMessage]);

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
          setStatusMessage(`Error loading cookies: ${response.error}`);
        } else {
          setCookies(response.cookies || []);
          setStatusMessage(response.cookies ? `Loaded ${response.cookies.length} cookies.` : 'No cookies found.');
        }
      });
    } else {
        setStatusMessage('No active tab found.');
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
        { action: 'deleteCookie', cookie: { name: cookie.name, url: cookie.url! } }, // url should be present from loadCookies
        (response) => {
          if (response.error) {
            console.error('Failed to delete cookie:', response.error);
            setStatusMessage(`Error deleting cookie: ${response.error}`);
          } else {
            // Reload cookies after deletion
            loadCookies();
            setStatusMessage(`Deleted cookie "${cookie.name}".`);
          }
        }
      );
    }
  };

  const handleSaveCookie = (cookie: Cookie) => {
    chrome.runtime.sendMessage({ action: 'saveCookie', cookie }, (response) => {
      if (response.error) {
        console.error('Failed to save cookie:', response.error);
        setStatusMessage(`Error saving cookie: ${response.error}`);
      } else {
        // Reload cookies after save
        loadCookies();
        setStatusMessage(response.cookie ? `Saved cookie "${response.cookie.name}".` : 'Cookie saved.');
      }
      setIsEditing(false);
    });
  };

  const handleMassDelete = () => {
    if (window.confirm('Are you sure you want to delete ALL cookies for this site?')) {
      chrome.runtime.sendMessage({ action: 'deleteAllCookies' }, (response) => {
        if (response.error) {
          console.error('Failed to delete all cookies:', response.error);
          setStatusMessage(`Error deleting all cookies: ${response.error}`);
        } else {
          console.log(response.message); // Log success message from background
          setStatusMessage(response.message); // Display message from background script
          // Reload cookies after mass deletion
          loadCookies();
        }
      });
    }
  };

  const handleImportCookies = (cookiesToImport: Cookie[]) => {
    chrome.runtime.sendMessage({ action: 'importCookies', cookies: cookiesToImport }, (response) => {
        if (response.error) {
            console.error('Failed to import cookies:', response.error);
            setStatusMessage(`Error importing cookies: ${response.error}`);
        } else {
            console.log(response.message); // Log success/failure message from background
            setStatusMessage(response.message); // Display message from background script
            loadCookies(); // Reload the list to show imported cookies
        }
    });
  };

  // const handleExportCookies = (format: 'json' | 'netscape') => { // Example for future Netscape format
  //     // Export logic handled within ImportExport component now
  //     console.log('Exporting cookies in format:', format);
  //     setStatusMessage(`Exporting cookies as ${format.toUpperCase()}...`); // Placeholder
  // };

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
        {statusMessage && (
            <div className={`mb-2 p-2 rounded text-center text-sm ${
                statusMessage.startsWith('Error') || statusMessage.includes('failed')
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
            }`}>
              {statusMessage}
            </div>
        )}
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
          // onExport={handleExportCookies} // Pass if needed in ImportExport
          cookies={filteredCookies} // Pass cookies list for "Copy as Set-Cookie" feature
        />
      </main>
    </div>
  );
};

export default App;
