const express = require("express")
const app = express()
const port = process.env.PORT || 5000
var socket = require('socket.io')

//allow cors
var cors = require('cors')
app.use(cors())

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
    "mongodb+srv://guestuser:guestuser@cluster0.gxqox.gcp.mongodb.net/fitogether?retryWrites=true&w=majority",
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

let server = app.listen(port, () => console.log("listening at port", port))


// chat
const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
};

const io = socket(server)
io.on('connection', (socket) => {
    console.log('socket connected', socket.id)

    // interval = setInterval(() => {
    //     getApiAndEmit(socket),
    //     1000
    // });

    socket.on('chat', (data) => {
        console.log('prickly pear')
        io.sockets.emit('chat', data)
    })

    socket.on('typing', (data) => {
        console.log('Quince')
        socket.broadcast.emit('typing', data)
    })
})
