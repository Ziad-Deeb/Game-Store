let io;
let users = [];

const addUser = (userId, socketId) => {
    if (!users.some((user) => user.userId === userId)) {
        users.push({ userId, socketId });
    }
};

const removeUser = (socketId) => {
    const index = users.findIndex((user) => user.socketId === socketId);
    if (index !== -1) {
        users.splice(index, 1);
    }
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

module.exports = {
    init: httpServer => {
        io = require("socket.io")(httpServer, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST", "PUT", "DELETE"]
            }
        });
        io.on("connection", (socket) => {
            console.log('User connected:', socket.id);

            socket.on("add-user", (userId) => {
                addUser(userId, socket.id);
                io.emit("get-users", users);
            });

            socket.on("send-message", (senderId, receiverId, text) => {
                const user = getUser(receiverId);
                console.log(senderId);
                io.to(user.socketId).emit("receive-message", {
                    senderId,
                    text
                });
            });

            socket.on("disconnect", () => {
                console.log('User disconnected:', socket.id);
                removeUser(socket.id);
                io.emit("get-users", users);
            });
        });
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
}