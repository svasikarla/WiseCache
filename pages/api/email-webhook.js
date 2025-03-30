import { supabase } from '../../lib/supabase';
import { extractContent } from '../../lib/utils';

// Email processing function
async function processEmailContent(emailData) {
  const { from, subject, text } = emailData;
  
  // Extract URLs from email body using regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];

  // Get user from email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', from)
    .single();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  // Process each URL found in the email
  const results = await Promise.all(urls.map(async (url) => {
    try {
      const contentData = await extractContent(url);
      const summary = contentData.text.slice(0, 200) + '...';
      
      const { data, error } = await supabase
        .from('links')
        .insert([{
          url,
          title: contentData.title,
          summary,
          user_id: userData.id,
          source: 'email',
          email_subject: subject
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, url, data };
    } catch (error) {
      return { success: false, url, error: error.message };
    }
  }));

  return results;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook secret if needed
  const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET;
  if (webhookSecret && req.headers['x-webhook-secret'] !== webhookSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const emailData = req.body;
    const results = await processEmailContent(emailData);
    
    return res.status(200).json({
      message: 'Email processed successfully',
      results
    });
  } catch (error) {
    console.error('Error processing email:', error);
    return res.status(500).json({
      error: 'Failed to process email',
      details: error.message
    });
  }
}