/**
 * Database Indexes Creation Script
 * 
 * This script creates all necessary indexes for optimal query performance.
 * Run this script after setting up a new database or when deploying to production.
 * 
 * Usage:
 *   node scripts/create-indexes.js
 * 
 * Or with custom MongoDB URI:
 *   MONGODB_URI=mongodb://localhost:27017/gravitas node scripts/create-indexes.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gravitas';

// Index definitions
const indexes = {
  communities: [
    { keys: { handle: 1 }, options: { unique: true, name: 'handle_unique' } },
    { keys: { status: 1 }, options: { name: 'status_idx' } },
    { keys: { members: 1 }, options: { name: 'members_idx' } },
    { keys: { admins: 1 }, options: { name: 'admins_idx' } },
    { keys: { createdAt: -1 }, options: { name: 'created_at_desc' } },
    { keys: { name: 'text', description: 'text', handle: 'text' }, options: { name: 'text_search' } },
  ],
  
  events: [
    { keys: { communityId: 1, date: 1 }, options: { name: 'community_date_idx' } },
    { keys: { date: 1 }, options: { name: 'date_idx' } },
    { keys: { createdAt: -1 }, options: { name: 'created_at_desc' } },
    { keys: { title: 'text', description: 'text' }, options: { name: 'text_search' } },
  ],
  
  follows: [
    { keys: { userId: 1, communityId: 1 }, options: { unique: true, name: 'user_community_unique' } },
    { keys: { communityId: 1 }, options: { name: 'community_idx' } },
    { keys: { userId: 1 }, options: { name: 'user_idx' } },
  ],
  
  updates: [
    { keys: { communityId: 1, createdAt: -1 }, options: { name: 'community_created_desc' } },
    { keys: { eventId: 1 }, options: { name: 'event_idx' } },
    { keys: { visibility: 1 }, options: { name: 'visibility_idx' } },
    { keys: { createdAt: -1 }, options: { name: 'created_at_desc' } },
  ],
  
  users: [
    { keys: { email: 1 }, options: { unique: true, name: 'email_unique' } },
    { keys: { createdAt: -1 }, options: { name: 'created_at_desc' } },
  ],
  
  eventRegistrations: [
    { keys: { eventId: 1, userId: 1 }, options: { unique: true, name: 'event_user_unique' } },
    { keys: { userId: 1 }, options: { name: 'user_idx' } },
    { keys: { eventId: 1 }, options: { name: 'event_idx' } },
  ],
  
  formResponses: [
    { keys: { formId: 1, userId: 1 }, options: { unique: true, name: 'form_user_unique' } },
    { keys: { formId: 1 }, options: { name: 'form_idx' } },
    { keys: { userId: 1 }, options: { name: 'user_idx' } },
    { keys: { shortlisted: 1 }, options: { name: 'shortlisted_idx' } },
  ],
  
  notifications: [
    { keys: { userId: 1, createdAt: -1 }, options: { name: 'user_created_desc' } },
    { keys: { read: 1 }, options: { name: 'read_idx' } },
  ],
};

async function createIndexes() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}\n`);
    
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    
    console.log('✅ Connected to database:', db.databaseName);
    console.log('📊 Creating indexes...\n');
    
    let totalCreated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    
    for (const [collectionName, collectionIndexes] of Object.entries(indexes)) {
      console.log(`📁 Collection: ${collectionName}`);
      const collection = db.collection(collectionName);
      
      // Get existing indexes
      const existingIndexes = await collection.indexes();
      const existingIndexNames = existingIndexes.map(idx => idx.name);
      
      for (const { keys, options } of collectionIndexes) {
        const indexName = options.name;
        
        try {
          if (existingIndexNames.includes(indexName)) {
            console.log(`   ⏭️  ${indexName} - Already exists`);
            totalSkipped++;
          } else {
            await collection.createIndex(keys, options);
            console.log(`   ✅ ${indexName} - Created`);
            totalCreated++;
          }
        } catch (error) {
          console.error(`   ❌ ${indexName} - Error: ${error.message}`);
          totalErrors++;
        }
      }
      
      console.log('');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   ✅ Created: ${totalCreated}`);
    console.log(`   ⏭️  Skipped: ${totalSkipped}`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (totalErrors === 0) {
      console.log('✨ All indexes created successfully!');
    } else {
      console.log('⚠️  Some indexes failed to create. Please review the errors above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Verify indexes function
async function verifyIndexes() {
  let client;
  
  try {
    console.log('🔍 Verifying indexes...\n');
    
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    
    for (const [collectionName, collectionIndexes] of Object.entries(indexes)) {
      console.log(`📁 ${collectionName}:`);
      const collection = db.collection(collectionName);
      const existingIndexes = await collection.indexes();
      
      console.log(`   Total indexes: ${existingIndexes.length}`);
      existingIndexes.forEach(idx => {
        const keysStr = Object.entries(idx.key)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        console.log(`   - ${idx.name}: { ${keysStr} }`);
      });
      console.log('');
    }
    
    console.log('✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Drop all indexes (use with caution!)
async function dropAllIndexes() {
  let client;
  
  try {
    console.log('⚠️  WARNING: This will drop all indexes except _id!');
    console.log('   Press Ctrl+C to cancel...\n');
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    
    for (const collectionName of Object.keys(indexes)) {
      console.log(`📁 ${collectionName}:`);
      const collection = db.collection(collectionName);
      
      try {
        await collection.dropIndexes();
        console.log('   ✅ All indexes dropped\n');
      } catch (error) {
        console.log(`   ⚠️  ${error.message}\n`);
      }
    }
    
    console.log('✅ All indexes dropped!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'verify':
    verifyIndexes();
    break;
  case 'drop':
    dropAllIndexes();
    break;
  case 'create':
  default:
    createIndexes();
    break;
}
