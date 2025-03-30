'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession, signIn, signOut } from 'next-auth/react';

const Dashboard = () => {
  const { data: session } = useSession();
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of items per page
  const [selectedTag, setSelectedTag] = useState(''); // State for selected tag
  const [availableTags, setAvailableTags] = useState([]); // State for available tags

  useEffect(() => {
    if (!session) return;

    const fetchEntries = async () => {
      try {
        const { data } = await axios.get('/api/get_links');
        setEntries(data);

        // Extract unique tags from entries
        const tags = new Set();
        data.forEach((entry) => {
          entry.categories.forEach((category) => tags.add(category));
        });
        setAvailableTags([...tags]);
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    };

    fetchEntries();
  }, [session]);

  if (!session) {
    return (
      <div>
        <h1>Welcome to WiseCache</h1>
        <button onClick={() => signIn()}>Sign In</button>
      </div>
    );
  }

  // Filter entries based on the search term and selected tag
  const filteredEntries = entries.filter(
    (entry) =>
      (entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.categories.some((category) =>
          category.toLowerCase().includes(searchTerm.toLowerCase())
        )) &&
      (selectedTag === '' || entry.categories.includes(selectedTag))
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredEntries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exported_links.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => signOut()}>Sign Out</button>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search by title or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tags Filter */}
      <div>
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">All Categories</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Export Button */}
      <div>
        <button onClick={handleExport}>Export as JSON</button>
      </div>

      {/* Display Entries */}
      {currentEntries.map((entry) => (
        <div key={entry.id} className="card">
          <h3>{entry.title}</h3>
          <p>
            <b>URL:</b>{' '}
            <a href={entry.url} target="_blank" rel="noopener noreferrer">
              {entry.url}
            </a>
          </p>
          <p>
            <b>Categories:</b> {entry.categories.join(', ')}
          </p>
          <p>
            <b>Summary:</b>
          </p>
          <p>{entry.summary}</p>
        </div>
      ))}

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

