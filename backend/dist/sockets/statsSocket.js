"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.initializeStatsSocket = void 0;
let onlineUsers = 0;
let totalVisitors = 0;
const connectedUsers = new Set();
const initializeStatsSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        onlineUsers++;
        totalVisitors++;
        connectedUsers.add(socket.id);
        io.emit('userStats', {
            online: onlineUsers,
            total: totalVisitors
        });
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            if (connectedUsers.has(socket.id)) {
                onlineUsers--;
                connectedUsers.delete(socket.id);
                io.emit('userStats', {
                    online: onlineUsers,
                    total: totalVisitors
                });
            }
        });
        socket.on('ping', () => {
            socket.emit('pong');
        });
    });
};
exports.initializeStatsSocket = initializeStatsSocket;
const getStats = () => ({
    online: onlineUsers,
    total: totalVisitors
});
exports.getStats = getStats;
