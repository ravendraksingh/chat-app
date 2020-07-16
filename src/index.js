const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

// server (emits) => client(receive) - countUpdated
// client (emits) => server(receive) - increment


io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.emit('message', 'Welcome!')
    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')                
        }

        io.emit('message', message)
        //callback('Delivered!')
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        //io.emit('message', `Location: ${coords.latitude}, ${coords.longitude}`)
        io.emit('message' ,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    socket.on('disconnect', () => {
        //io.emit('A user has left')
        socket.broadcast.emit('message', 'A user has left')
    })

})



//app.use(express.json())

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})

