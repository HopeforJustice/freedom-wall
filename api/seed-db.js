import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Clear existing data
    await sql`DELETE FROM stories`;
    await sql`DELETE FROM locks`;

    // Load the extracted lock data
    const lockDataPath = path.join(__dirname, '../extracted-lock-data.json');
    const lockData = JSON.parse(fs.readFileSync(lockDataPath, 'utf8'));

    // Sample story content for the story locks
    const storyContents = [
      {
        title: "A Journey of Courage",
        body: "Every step forward was a victory against fear. Through the darkest nights and longest days, courage became not just a choice, but a way of life. This is a story of resilience, of finding light in the most unexpected places.\n\nThe path wasn't easy, but it was worth every moment of struggle. Each challenge became a stepping stone, each setback a lesson in perseverance."
      },
      {
        title: "Breaking Barriers",
        body: "When the world said 'impossible,' determination whispered 'try anyway.' This is the story of breaking through limitations that seemed insurmountable, of proving that the human spirit knows no bounds.\n\nWhat started as a dream became a mission, and what began as hope transformed into reality. The barriers that once seemed so solid proved to be nothing more than illusions waiting to be shattered."
      },
      {
        title: "Finding Home",
        body: "Home isn't always a place – sometimes it's a feeling, a community, a moment of belonging. This story traces the journey of finding that sense of home after years of searching.\n\nThrough kindness from strangers and support from unexpected places, a new definition of family and belonging emerged. Home became not where you came from, but where you chose to build your future."
      },
      {
        title: "The Power of Education",
        body: "Knowledge became the key that unlocked doors that seemed permanently closed. This is a story about the transformative power of education and the dedicated teachers who refuse to give up on their students.\n\nIn classrooms filled with possibility, futures were shaped and dreams were nurtured. Every lesson taught was a seed of hope planted for tomorrow."
      },
      {
        title: "Healing Hearts",
        body: "Mental health is not a destination but a journey of understanding, acceptance, and growth. This story illuminates the path from struggle to strength, from isolation to connection.\n\nThrough therapy, community, and self-compassion, healing became possible. The scars remained, but they became symbols of survival rather than shame."
      },
      {
        title: "Second Chances",
        body: "Recovery is not a straight line, but every step forward counts. This is a story of redemption, of choosing hope over despair, and of the people who believed in second chances.\n\nThe journey from addiction to recovery was paved with setbacks and victories, tears and laughter. Each day sober was a day reclaimed, a future rebuilt."
      },
      {
        title: "United We Stand",
        body: "In the face of injustice, one voice became many. This story celebrates the power of community activism and the change that happens when people unite for a common cause.\n\nWhat began as individual struggles became a collective movement. Together, they found strength they never knew they possessed."
      },
      {
        title: "Innovation for Tomorrow",
        body: "The future belongs to those who dare to imagine it differently. This is a story of innovation, of turning dreams of sustainability into reality through determination and creativity.\n\nEvery breakthrough was built on the foundation of countless failed experiments and late-night revelations. The vision of a cleaner, greener world drove every discovery."
      },
      {
        title: "Honor and Service",
        body: "The transition from military service to civilian life is a journey of its own. This story honors those who served and the communities that welcome them home.\n\nService doesn't end with uniform removal; it transforms into new ways of giving back, of using military skills to build rather than defend."
      },
      {
        title: "Colors of Community",
        body: "Art has the power to transform not just spaces, but hearts and minds. This is a story of how creativity brought a neighborhood together, one mural at a time.\n\nEvery brushstroke was a conversation, every color a bridge between different worlds. The walls became canvases for hope, unity, and shared dreams."
      }
    ];

    // Insert locks in batches
    let inserted = 0;
    const batchSize = 50;

    for (let i = 0; i < lockData.length; i += batchSize) {
      const batch = lockData.slice(i, i + batchSize);
      
      for (const lock of batch) {
        await sql`
          INSERT INTO locks (lock_id, name, date, story)
          VALUES (${lock.id}, ${lock.name}, ${lock.date}, ${lock.story})
        `;
        inserted++;
      }
    }

    // Insert story content for story locks
    const storyLocks = lockData.filter(lock => lock.story);
    let storyIndex = 0;
    
    for (const lock of storyLocks) {
      const story = storyContents[storyIndex % storyContents.length];
      await sql`
        INSERT INTO stories (lock_id, title, body, featured)
        VALUES (${lock.id}, ${story.title}, ${story.body}, true)
      `;
      storyIndex++;
    }

    res.status(200).json({ 
      message: 'Database seeded successfully',
      total_locks: inserted,
      story_locks: storyLocks.length,
      stories_added: storyLocks.length
    });

  } catch (error) {
    console.error('Database seed error:', error);
    res.status(500).json({ 
      error: 'Failed to seed database',
      details: error.message 
    });
  }
}
