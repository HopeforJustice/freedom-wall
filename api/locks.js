import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    const locks = await sql`
      SELECT lock_id, name, date, story, position_x, position_y, position_z
      FROM locks 
      ORDER BY lock_id
    `;

    res.status(200).json({ 
      locks: locks,
      count: locks.length 
    });

  } catch (error) {
    console.error('Error fetching locks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch locks',
      details: error.message 
    });
  }
}
