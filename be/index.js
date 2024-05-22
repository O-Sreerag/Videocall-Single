const { Server } = require('socket.io');

const io = new Server(8000, {
    cors: true
});

const emailToSocketIdMap = new Map()
const socketIdToEmailMap = new Map()

io.on("connection", (socket) => {
    console.log("Socket connected :", socket.id)

    socket.on('room:join', data => {
        console.log(data)
        const {email, room} = data

        emailToSocketIdMap.set(email, socket.id)
        socketIdToEmailMap.set(socket.id, email)

        io.to(room).emit("user:joined", {email, id: socket.id})
        socket.join(room)
        io.to(socket.id).emit("room:join", {email, room})
    })

    socket.on('user:call', ({to, offer}) => {
        console.log('user:call')
        console.log(to, offer)
        io.to(to).emit('incoming:call', {from: socket.id, offer})
    })
    
    socket.on('call:accepted', ({to, ans}) => {
        console.log('call:accepted')
        console.log(to, ans)
        io.to(to).emit('call:accepted', {from: socket.id, ans})
    })
    
    socket.on('peer:nego:needed', ({to, offer}) => {
        console.log('peer:nego:needed')
        console.log(to, offer)
        io.to(to).emit('peer:nego:needed', {from: socket.id, offer})
    })

    socket.on('peer:nego:done', ({to, ans}) => {
        console.log('peer:nego:done')
        console.log(to, ans)
        io.to(to).emit('peer:nego:final', {from: socket.id, ans})
    })

})