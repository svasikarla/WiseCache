import axios from 'axios';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Fetch the content from the URL
    const { data: htmlContent } = await axios.get(url);

    // Simulate summarization and categorization (replace with real logic or API)
    const summary = `Summary of content from ${url}`;
    const category = 'General';

    res.status(200).json({ summary, category });
  } catch (error) {
    console.error('Error extracting content:', error);
    res.status(500).json({ error: 'Failed to extract content' });
  }
}
