import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession, signIn, signOut } from 'next-auth/react';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch links from the server
  const fetchLinks = async () => {
    if (!session) return;
    try {
      const { data } = await axios.get('/api/get_links');
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchLinks();
    }
  }, [session]);

  const handleAddLink = async () => {
    if (!session) {
      alert('Please sign in to add links');
      return;
    }

    if (!url.trim()) return alert('Please enter a valid URL.');

    setLoading(true);
    try {
      await axios.post('/api/add_link', { url });
      await fetchLinks();
      setUrl('');
      alert('Link added successfully!');
    } catch (error) {
      console.error('Error adding the link:', error.response?.data || error.message);
      alert('Failed to add the link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Welcome to WiseCache</h2>
        <p>Please sign in to manage your links</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => signIn('google')}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {session.user.name}</h2>
        </div>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>

      {/* Input and Button for Adding Links */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 p-2 border rounded"
          disabled={loading}
        />
        <button
          onClick={handleAddLink}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Adding...' : 'Add Link'}
        </button>
      </div>

      {/* Display the Links */}
      <div className="grid gap-4">
        {links.map((link) => (
          <div key={link.id} className="p-4 border rounded shadow">
            <h3 className="font-bold text-lg mb-2">{link.title}</h3>
            <a href={link.url} target="_blank" rel="noopener noreferrer" 
               className="text-blue-500 hover:underline mb-2 block">
              {link.url}
            </a>
            <p className="mb-2"><strong>Summary:</strong> {link.summary}</p>
            <p><strong>Categories:</strong> {link.categories.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
