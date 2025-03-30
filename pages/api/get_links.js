import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('userId', session.user.id)
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching links:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
