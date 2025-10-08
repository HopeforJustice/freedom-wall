import { neon } from '@neondatabase/serverless';

// Simple auth check - in production you'd verify JWT tokens from Stack Auth
function isAuthenticated(req) {
  // For development, allow access without strict auth
  // In production, uncomment the lines below for proper auth
  return true;
  
  // Production auth check:
  // const authHeader = req.headers?.authorization;
  // return authHeader && authHeader.startsWith('Bearer ');
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check authentication
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    switch (req.method) {
      case 'GET':
        // Get all locks with pagination
        const { page = 1, limit = 50, story: storyFilter } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let whereClause = '';
        if (storyFilter !== undefined) {
          whereClause = `WHERE story = ${storyFilter === 'true'}`;
        }
        
        const locks = await sql`
          SELECT l.*, s.title as story_title, s.body as story_body, s.author as story_author
          FROM locks l
          LEFT JOIN stories s ON l.lock_id = s.lock_id
          ${whereClause ? sql.unsafe(whereClause) : sql``}
          ORDER BY l.lock_id
          LIMIT ${parseInt(limit)} OFFSET ${offset}
        `;

        const total = await sql`SELECT COUNT(*) as count FROM locks ${whereClause ? sql.unsafe(whereClause) : sql``}`;
        
        return res.status(200).json({
          locks,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(total[0].count),
            pages: Math.ceil(parseInt(total[0].count) / parseInt(limit))
          }
        });

      case 'POST':
        // Create new lock
        const { lock_id, name, date, story: hasStory = false, position_x, position_y, position_z } = req.body;
        
        if (!lock_id || !name || !date) {
          return res.status(400).json({ error: 'lock_id, name, and date are required' });
        }

        const newLock = await sql`
          INSERT INTO locks (lock_id, name, date, story, position_x, position_y, position_z)
          VALUES (${lock_id}, ${name}, ${date}, ${hasStory}, ${position_x}, ${position_y}, ${position_z})
          RETURNING *
        `;

        return res.status(201).json({ lock: newLock[0] });

      case 'PUT':
        // Update existing lock
        const { id } = req.query;
        const updateData = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Lock ID is required' });
        }

        const updatedLock = await sql`
          UPDATE locks 
          SET 
            name = COALESCE(${updateData.name}, name),
            date = COALESCE(${updateData.date}, date),
            story = COALESCE(${updateData.story}, story),
            position_x = COALESCE(${updateData.position_x}, position_x),
            position_y = COALESCE(${updateData.position_y}, position_y),
            position_z = COALESCE(${updateData.position_z}, position_z),
            updated_at = CURRENT_TIMESTAMP
          WHERE lock_id = ${parseInt(id)}
          RETURNING *
        `;

        if (updatedLock.length === 0) {
          return res.status(404).json({ error: 'Lock not found' });
        }

        return res.status(200).json({ lock: updatedLock[0] });

      case 'DELETE':
        // Delete lock
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Lock ID is required' });
        }

        // Delete associated stories first
        await sql`DELETE FROM stories WHERE lock_id = ${parseInt(deleteId)}`;
        
        const deletedLock = await sql`
          DELETE FROM locks WHERE lock_id = ${parseInt(deleteId)}
          RETURNING *
        `;

        if (deletedLock.length === 0) {
          return res.status(404).json({ error: 'Lock not found' });
        }

        return res.status(200).json({ message: 'Lock deleted successfully', lock: deletedLock[0] });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin locks error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
