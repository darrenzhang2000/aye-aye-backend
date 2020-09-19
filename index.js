const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const app = express();

const PORT = process.env.PORT || 5000;
app.use(cors())

const server = http.createServer(app);
const io = socketio(server);


// parse application/x-www-form-encoded and application/json
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: true
})); app.use(bodyParser.json())

//routes
const user = require('./routes/user')

//connect to mongoose
const mongoose = require('mongoose')
mongoose.connect(
    "mongodb+srv://testuser:testuser@cluster0.7t5ar.mongodb.net/iprofile?retryWrites=true&w=majority",
    { useNewUrlParser: true }
)

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("connected to db")
})

app.get('/', (req, res) => {
    res.send("hello")
})

app.use('/user', user)

//let server = app.listen(port, () => console.log("listening at port", port))


// chat
// const getApiAndEmit = socket => {
//     const response = new Date();
//     // Emitting a new message. Will be consumed by the client
//     socket.emit("FromAPI", response);
// };

// const io = socket(server)
// io.on('connection', (socket) => {
//     console.log('socket connected', socket.id)

//     // interval = setInterval(() => {
//     //     getApiAndEmit(socket),
//     //     1000
//     // });

//     socket.on('chat', (data) => {
//         console.log('prickly pear')
//         io.sockets.emit('chat', data)
//     })

//     socket.on('typing', (data) => {
//         console.log('Quince')
//         socket.broadcast.emit('typing', data)
//     })
// })





io.on('connection', (socket) => {

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });
        if (error)
            return callback(error);

        socket.emit('message', { user: 'Admin', text: `Welcome ${user.name} to ${user.room}` })
        socket.broadcast.to(user.room).emit('message', { user: 'Admin', text: `Attention everybody, ${user.name} has joined .` })
        socket.join(user.room);

        callback();

    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        if (user)
            io.to(user.room).emit('message', { user: user.name, text: message });
        callback();

    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: 'Admin', text: `Byeee ${user.name}` })
        }
    });
})


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
