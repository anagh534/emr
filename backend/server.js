const express = require('express');
const logger = require('./utils/logger');
const morgan = require('morgan');
const errorMiddleware = require('./middleware/errorMiddleware');
const connectDB = require("./config/db");
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

const app = express();
app.use(helmet());
app.use(compression());

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));

// Initialize HTTP server and socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        logger.info(`Socket client disconnected: ${socket.id}`);
    });
});

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use(
    morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
    })
);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/audit-logs', require('./routes/auditLogRoutes'));

// Route Not Found Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

// Global Error Handler
app.use(errorMiddleware);

server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});