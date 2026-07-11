const express = require('express');
const logger = require('./utils/logger');
const morgan = require('morgan');
const errorMiddleware = require('./middleware/errorMiddleware');
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Request Logging
app.use(
    morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
    })
);

// Route Not Found Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

// Global Error Handler
app.use(errorMiddleware);

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});