// SearchBar.tsx
// SPDX-License-Identifier: GPL-3.0-only
// This file is part of Cookie Cabinet, a derivative work based on Cookie-Editor.
// Original project: https://github.com/Moustachauve/cookie-editor
// Copyright (C) 2023-present Cookie Cabinet contributors

import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <input
      type="text"
      placeholder="Search cookies..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
    />
  );
};

export default SearchBar;