import express from 'express';
import { Router } from './routes/router.js'
import serverMiddleware from './middlewares/server.js';
import 'dotenv/config';

// DB
import { connectDB } from './db/db.js'

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware
app.use((req, res, next) => {
    const allowedOrigins = [process.env.MAIN_WEB_URL, process.env.ADMIN_WEB_URL];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    // Allow credentials (cookies, authentication headers, etc.)
    res.header("Access-Control-Allow-Credentials", true);

    // Allow all HTTP methods
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    next();
});

// Handle OPTIONS requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    res.sendStatus(200);
});

// Other middleware
app.use(serverMiddleware);

// Routes
app.use(Router);

// Server
connectDB().then(() => app.listen(PORT, () => {
  console.log('Server running at port: ' + PORT );
}));