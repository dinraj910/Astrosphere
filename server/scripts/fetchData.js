// filepath: server/scripts/fetchData.js
const mongoose = require('mongoose');
const dataFetcher = require('../services/dataFetcher');
require('dotenv').config();

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    console.log('Starting comprehensive data fetch...');
    await dataFetcher.fetchAllData();
    
    // Get final statistics
    const CosmicObject = require('../models/CosmicObject');
    const stats = await CosmicObject.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nFinal Database Statistics:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} objects`);
    });
    
    const total = await CosmicObject.countDocuments();
    console.log(`\nTotal objects in database: ${total}`);
    
    console.log('\nData fetching completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();