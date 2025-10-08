import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    const storyLocks = await sql`
      SELECT l.lock_id, l.name, l.date, l.position_x, l.position_y, l.position_z,
             s.title, s.body, s.author, s.featured
      FROM locks l
      INNER JOIN stories s ON l.lock_id = s.lock_id
      WHERE l.story = true
      ORDER BY l.lock_id
    `;

    res.status(200).json({ 
      stories: storyLocks,
      count: storyLocks.length 
    });

  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stories',
      details: error.message 
    });
  }
}
