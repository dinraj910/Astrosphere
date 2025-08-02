const mongoose = require('mongoose');

const cosmicObjectSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: ['planet', 'moon', 'asteroid', 'comet', 'exoplanet', 'star', 'galaxy', 'nebula', 'cluster', 'black_hole', 'spacecraft', 'other']
  },
  description: { type: String, maxlength: 500 },
  
  // Single optimized image
  image: {
    url: String,
    alt: String
  },
  
  // Compressed essential data
  data: mongoose.Schema.Types.Mixed, // Flexible for different object types
  
  // External links
  links: {
    nasa: String,
    wikipedia: String,
    source: String
  },
  
  // SEO fields
  slug: { type: String, unique: true, index: true },
  keywords: [String],
  
  // Data tracking
  sources: [String],
  lastUpdated: { type: Date, default: Date.now }
}, {
  versionKey: false // Save space
});

// Text search index
cosmicObjectSchema.index({ 
  name: 'text', 
  description: 'text', 
  keywords: 'text' 
});

module.exports = mongoose.model('CosmicObject', cosmicObjectSchema);