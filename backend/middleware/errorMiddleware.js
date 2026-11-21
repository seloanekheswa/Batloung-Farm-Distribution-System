
const errorMiddleware = (err, req, res, next) => {
    console.error('Application Error:', err.message);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorMiddleware;
