// Pagination utility

const paginate = (model, populate = []) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Build query
    const query = { ...req.query };
    
    // Remove pagination fields from query
    const removeFields = ['page', 'limit', 'sort', 'select'];
    removeFields.forEach(param => delete query[param]);

    // Create query string
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Parse back to object
    const parsedQuery = JSON.parse(queryStr);

    try {
      // Count total documents
      const total = await model.countDocuments(parsedQuery);
      
      // Build query
      let dbQuery = model.find(parsedQuery);

      // Select fields
      if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        dbQuery = dbQuery.select(fields);
      }

      // Sort
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        dbQuery = dbQuery.sort(sortBy);
      } else {
        dbQuery = dbQuery.sort('-createdAt');
      }

      // Populate
      if (populate.length > 0) {
        populate.forEach(field => {
          dbQuery = dbQuery.populate(field);
        });
      }

      // Pagination
      dbQuery = dbQuery.skip(startIndex).limit(limit);

      // Execute query
      const results = await dbQuery;

      // Pagination result
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        limit,
        hasNextPage: endIndex < total,
        hasPrevPage: startIndex > 0
      };

      if (endIndex < total) {
        pagination.nextPage = page + 1;
      }

      if (startIndex > 0) {
        pagination.prevPage = page - 1;
      }

      res.paginatedResults = {
        success: true,
        pagination,
        data: results
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = paginate;