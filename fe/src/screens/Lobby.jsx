import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/socketProvider';
import { useNavigate } from 'react-router-dom';

const LobbyScreen = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const socket = useSocket()
    const navigate = useNavigate()

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        console.log("email :", email);
        console.log("room :", room);

        socket.emit("room:join", {email, room})
    }, [email, room]);

    const handleJoinRoom = useCallback((data) => {
        console.log(`Data from Be ${data}`)
        const { email, room } = data
        navigate(`/room?r=${room}`) 
    }, [])

    useEffect(() => {
        socket.on('room:join', handleJoinRoom)
        return () => {
            socket.off('room:join', handleJoinRoom)
        }
    }, [socket, handleJoinRoom])

    return (
        <div className='flex items-center justify-center'>
            <div className='max-w-[400px] h-screen flex-col flex justify-center items-center w-full'>
                <div className='bg-slate-300 p-5 rounded-md shadow-sm w-full'>
                    <h1 className='text-2xl mb-2 w-full text-center'>Lobby</h1>
                    <form action="" onSubmit={handleSubmitForm} className='space-y-2 flex flex-col justify-center'>
                        <div className='flex justify-between'>
                            <label htmlFor="email">Email ID</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='border-gray-400 border-2 rounded-lg focus:border-blue-500 outline-none'
                            />
                        </div>
                        <div className='flex justify-between'>
                            <label htmlFor="room">Room Number</label>
                            <input
                                type="text"
                                id="room"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                className='border-gray-400 border-2 rounded-lg focus:border-blue-500 outline-none'
                            />
                        </div>
                        <button type="submit"><p className='text-blue-500'>Join</p></button>
                    </form>
                </div>
            </div>
        </div >
    );
}

export default LobbyScreen;
