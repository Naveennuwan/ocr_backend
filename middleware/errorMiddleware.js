export const errorHandler = (err, req, res, next) => {
    console.error('Global error handler:', err);
  
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size is too large. Maximum size is 10MB'
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  };