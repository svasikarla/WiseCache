import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';
import { Database } from '@/types/supabase';
import type { RequestCookies } from '@edge-runtime/cookies';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function fetchWithTimeout(url: string, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. The website might be too slow to respond.');
    }
    throw error;
  }
}

async function extractContent(url: string) {
  try {
    // Validate URL format
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.');
    }

    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error('URL does not point to a webpage. Only HTML pages are supported.');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, noscript, iframe, nav, footer, header, aside, [role="complementary"]').remove();

    // Get title
    let title = $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('title').text().trim() ||
                $('h1').first().text().trim() ||
                urlObj.hostname;

    // Get description
    let description = $('meta[name="description"]').attr('content') ||
                     $('meta[property="og:description"]').attr('content') ||
                     $('meta[name="twitter:description"]').attr('content');

    // If no meta description, try to get main content
    if (!description) {
      // Try to find main content area
      const mainContent = $('main, article, [role="main"], .content, #content, .main').first();
      if (mainContent.length) {
        description = mainContent.text();
      } else {
        // Fallback to paragraphs
        description = $('p').map((_, el) => $(el).text().trim()).get().join('\n');
      }
    }

    // Clean up text
    description = description
      ?.replace(/\s+/g, ' ')
      .trim() || '';

    // Ensure we have some content
    if (!description) {
      description = $('body').text().replace(/\s+/g, ' ').trim();
    }

    if (!description) {
      throw new Error('No readable content found on the page.');
    }

    // Limit content length but try to break at a sentence
    if (description.length > 5000) {
      const truncated = description.slice(0, 5000);
      const lastSentence = truncated.lastIndexOf('.');
      description = lastSentence > 0 ? truncated.slice(0, lastSentence + 1) : truncated;
    }

    return {
      title: title || urlObj.hostname,
      text: description
    };
  } catch (error) {
    console.error('Error extracting content:', error);
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        throw new Error('Could not find the website. Please check the URL and try again.');
      }
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Could not connect to the website. The server might be down.');
      }
      if (error.message.includes('certificate')) {
        throw new Error('The website has an invalid security certificate.');
      }
      throw new Error('Failed to extract content: ' + error.message);
    }
    throw new Error('Failed to extract content from the URL');
  }
}

async function summarizeContent(text: string) {
  try {
    const prompt = `Summarize the following content in 3-5 bullet points, focusing on the main ideas:\n\n${text.substring(0, 3000)}`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 250,
    });

    return completion.choices[0].message.content || 'No summary available';
  } catch (error) {
    console.error('Error summarizing content:', error);
    return 'Failed to generate summary';
  }
}

async function categorizeContent(text: string) {
  try {
    const prompt = `Categorize this content into 1-3 of these categories: Technology, Business, Science, Health, Education, Entertainment, News, Other. Return only the category names separated by commas:\n\n${text.substring(0, 1000)}`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 50,
    });

    const categories = completion.choices[0].message.content?.split(',').map(c => c.trim()) || ['Other'];
    return categories;
  } catch (error) {
    console.error('Error categorizing content:', error);
    return ['Other'];
  }
}

async function ensureLinksTable(supabase: any) {
  try {
    // First check if the table exists
    const { error: checkError } = await supabase
      .from('links')
      .select('id')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      // Try to create the table directly first
      const { error: createTableError } = await supabase.rpc('create_links_table');
      
      if (createTableError) {
        console.error('Error creating links table:', createTableError);
        
        // If RPC fails, try direct SQL (requires higher privileges)
        const { error: directSqlError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS public.links (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            title TEXT,
            summary TEXT,
            categories TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );

          -- Create indexes if they don't exist
          CREATE INDEX IF NOT EXISTS links_user_id_idx ON public.links(user_id);
          CREATE INDEX IF NOT EXISTS links_created_at_idx ON public.links(created_at);

          -- Enable RLS
          ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

          -- Create or replace policies
          DO $$ 
          BEGIN
            -- Drop existing policies if they exist
            DROP POLICY IF EXISTS "Users can view their own links" ON public.links;
            DROP POLICY IF EXISTS "Users can insert their own links" ON public.links;
            DROP POLICY IF EXISTS "Users can update their own links" ON public.links;
            DROP POLICY IF EXISTS "Users can delete their own links" ON public.links;

            -- Create new policies
            CREATE POLICY "Users can view their own links"
              ON public.links FOR SELECT
              USING (auth.uid() = user_id);

            CREATE POLICY "Users can insert their own links"
              ON public.links FOR INSERT
              WITH CHECK (auth.uid() = user_id);

            CREATE POLICY "Users can update their own links"
              ON public.links FOR UPDATE
              USING (auth.uid() = user_id)
              WITH CHECK (auth.uid() = user_id);

            CREATE POLICY "Users can delete their own links"
              ON public.links FOR DELETE
              USING (auth.uid() = user_id);
          END $$;
        `;

        if (directSqlError) {
          console.error('Error creating table directly:', directSqlError);
          throw new Error('Failed to create links table: ' + directSqlError.message);
        }
      }

      // Verify table was created
      const { error: verifyError } = await supabase
        .from('links')
        .select('id')
        .limit(1);

      if (verifyError) {
        throw new Error('Failed to verify links table creation');
      }
    } else if (checkError) {
      // If there's an error but it's not because the table doesn't exist
      throw new Error('Error checking links table: ' + checkError.message);
    }
  } catch (error) {
    console.error('Error ensuring links table:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies() as unknown as RequestCookies;
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });
    
    const { url, isGuestMode } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // If in guest mode, just process the content without saving to database
    if (isGuestMode) {
      const content = await extractContent(url);
      const summary = await summarizeContent(content.text);
      const categories = await categorizeContent(content.text);

      return NextResponse.json({
        url,
        title: content.title,
        summary,
        categories
      });
    }

    // Check authentication for non-guest mode
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract and process content
    const content = await extractContent(url);
    const summary = await summarizeContent(content.text);
    const categories = await categorizeContent(content.text);

    // Ensure links table exists
    await ensureLinksTable(supabase);

    // Save to database
    const { data, error: insertError } = await supabase
      .from('links')
      .insert({
        url,
        title: content.title,
        summary,
        categories,
        user_id: session.user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting link:', insertError);
      return NextResponse.json({ error: 'Failed to save link' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing link:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process the URL' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies() as unknown as RequestCookies;
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure links table exists
    await ensureLinksTable(supabase);

    const { data: links, error: fetchError } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching links:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
    }

    return NextResponse.json(links || []);
  } catch (error) {
    console.error('Error in GET /api/links:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch links' },
      { status: 500 }
    );
  }
} 