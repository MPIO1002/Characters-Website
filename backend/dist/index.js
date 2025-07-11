"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const redis_client_1 = __importDefault(require("./redis-client"));
const auth_1 = __importDefault(require("./auth"));
const heroRoutes_1 = __importDefault(require("./routes/heroRoutes"));
const artifactRoutes_1 = __importDefault(require("./routes/artifactRoutes"));
const petRoutes_1 = __importDefault(require("./routes/petRoutes"));
const statsSocket_1 = require("./sockets/statsSocket");
const statsController_1 = require("./controllers/statsController");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
const host = "0.0.0.0";
// CORS configuration
app.use((0, cors_1.default)({
    origin: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(',')) || [
        'http://localhost:3001',
        'https://mhgh.ggo.vn'
    ],
    credentials: true
}));
// Create HTTP server and Socket.IO
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    path: '/thuvientuong/socket.io',
    cors: {
        origin: ((_b = process.env.CORS_ORIGIN) === null || _b === void 0 ? void 0 : _b.split(',')) || [
            'http://localhost:3001',
            'https://mhgh.ggo.vn'
        ],
        credentials: true
    }
});
// Middleware
app.use(body_parser_1.default.json({ limit: '20mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '20mb' }));
// Connect to Redis
redis_client_1.default.connect();
// Routes
app.use('/heroes', heroRoutes_1.default);
app.use('/artifact_private', artifactRoutes_1.default);
app.use('/pet_private', petRoutes_1.default);
app.use('/auth', auth_1.default);
app.get('/stats', statsController_1.getStatsController);
// Initialize Socket.IO
(0, statsSocket_1.initializeStatsSocket)(io);
// Start server
server.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`);
});
