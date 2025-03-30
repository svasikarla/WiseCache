import { extractContent } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { supabase } from '../../lib/supabase';

async function summarizeContent(text) {
  // Simple summarization: Take first 200 characters and add ellipsis
  const summary = text.slice(0, 200) + (text.length > 200 ? '...' : '');
  return summary;
}

async function categorizeContent(text) {
  // Simple categorization based on keywords
  const keywords = {
    Technology: ['technology', 'software', 'computer', 'ai', 'digital'],
    Finance: ['finance', 'money', 'investment', 'market', 'stock'],
    Health: ['health', 'medical', 'wellness', 'fitness'],
    Education: ['education', 'learning', 'school', 'study'],
    Science: ['science', 'research', 'discovery'],
    Lifestyle: ['lifestyle', 'food', 'travel', 'fashion']
  };

  const textLower = text.toLowerCase();
  const categories = Object.entries(keywords)
    .filter(([_, words]) => words.some(word => textLower.includes(word)))
    .map(([category]) => category);

  return categories.length > 0 ? categories : ["General"];
}

async function saveToDb(entry) {
  const { data, error } = await supabase
    .from('links')
    .insert([{
      id: uuidv4(),
      ...entry,
      timestamp: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }

  return data;
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const contentData = await extractContent(url);
    const summary = await summarizeContent(contentData.text);
    const categories = await categorizeContent(contentData.text);

    const savedEntry = await saveToDb({
      url,
      title: contentData.title,
      summary,
      categories,
      userId: session.user.id, // Add user ID to the entry
    });

    return res.status(200).json({ message: 'Link processed and saved', entry: savedEntry });
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
