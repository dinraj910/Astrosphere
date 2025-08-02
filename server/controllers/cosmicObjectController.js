const CosmicObject = require('../models/CosmicObject');

const cosmicObjectController = {
  // Search objects (API endpoint)
  async searchObjects(req, res) {
    try {
      const { 
        q: query, 
        type, 
        limit = 20, 
        page = 1,
        format = 'json'
      } = req.query;
      
      const skip = (page - 1) * limit;
      let searchFilter = {};
      
      // Build search filter
      if (query) {
        searchFilter.$text = { $search: query };
      }
      
      if (type && type !== 'all') {
        searchFilter.type = type;
      }
      
      const objects = await CosmicObject.find(searchFilter)
        .select('name type slug description image data keywords')
        .limit(parseInt(limit))
        .skip(skip)
        .lean();
      
      const total = await CosmicObject.countDocuments(searchFilter);
      
      const result = {
        objects,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

      // Return JSON for API calls or data for SSR
      if (format === 'ssr') {
        return result;
      }
      
      res.json(result);
    } catch (error) {
      if (req.query.format === 'ssr') {
        throw error;
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Get object by slug (SSR compatible)
  async getObjectBySlug(req, res) {
    try {
      const { slug } = req.params;
      const { format = 'json' } = req.query;
      
      const object = await CosmicObject.findOne({ slug }).lean();
      
      if (!object) {
        if (format === 'ssr') {
          return null;
        }
        return res.status(404).json({ error: 'Object not found' });
      }

      if (format === 'ssr') {
        return object;
      }
      
      res.json(object);
    } catch (error) {
      if (req.query.format === 'ssr') {
        throw error;
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Get all types
  async getTypes(req, res) {
    try {
      const types = await CosmicObject.distinct('type');
      res.json(types.sort());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get featured objects
  async getFeaturedObjects(req, res) {
    try {
      const { limit = 12 } = req.query;
      
      // Get a mix of different types
      const featured = await CosmicObject.aggregate([
        { $sample: { size: parseInt(limit) } },
        { $project: { name: 1, type: 1, slug: 1, description: 1, image: 1 } }
      ]);
      
      res.json(featured);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = cosmicObjectController;