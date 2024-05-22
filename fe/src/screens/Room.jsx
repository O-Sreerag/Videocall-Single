import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { useSocket } from '../context/socketProvider'
import peer from '../services/peer'
import { Socket } from 'socket.io-client'

const RoomPage = () => {
    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)

    const getMediaStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);
            return stream;
        } catch (error) {
            console.log('Error accessing media devices.', error);
        }
    }, []);

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log("handleUserJoined :", email, id)
        console.log(`Email: ${email} joined room`)
        setRemoteSocketId(id)
    }, [])

    const handleCallUser = useCallback(async () => {
        if (!remoteSocketId) {
            console.warn('No remote user to call');
            return;
        }

        const stream = await getMediaStream();
        if (!stream) return;

        const offer = await peer.getOffer()
        console.log(remoteSocketId)
        socket.emit("user:call", { to: remoteSocketId, offer })
    }, [socket, remoteSocketId, getMediaStream])

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        console.log("handleIncomingCall :", from, offer)

        setRemoteSocketId(from)
        const stream = await getMediaStream();
        if (!stream) return;

        const ans = await peer.getAnswer(offer)
        socket.emit('call:accepted', { to: from, ans })
    }, [socket, getMediaStream])

    const sendStreams = () => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream)
        }
    }

    const handleCallAccepted = useCallback(async ({ from, ans }) => {
        console.log("handleCallAccepted :", from, ans)

        if (!myStream) {
            console.warn('No local stream available');
            return;
        }

        peer.setLocalDescription(ans)
        sendStreams()
    }, [myStream])

    const handleNegoNeeded = useCallback(async () => {
        console.log("handleNegoNeeded")
        if (!remoteSocketId) {
            console.warn('No remote user to call');
            return;
        }

        const offer = await peer.getOffer()
        socket.emit('peer:nego:needed', { to: remoteSocketId, offer })
    }, [remoteSocketId, socket])

    const handleNegoIncoming = useCallback(async ({ from, offer }) => {
        console.log("handleNegoIncoming :", from, offer)

        const ans = await peer.getAnswer(offer)
        socket.emit('peer:nego:done', { to: from, ans })
    }, [socket])

    const handleNegoFinal = useCallback(async ({ from, ans }) => {
        console.log("handleNegoFinal :", from, ans)
        await peer.setLocalDescription(ans)
    }, [])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded)

        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded)
        }
    }, [handleNegoNeeded])

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams[0]
            console.log("remoteStream: ", remoteStream)
            setRemoteStream(remoteStream)
        })
    }, [remoteStream])

    useEffect(() => {
        socket.on("user:joined", handleUserJoined)
        socket.on("incoming:call", handleIncomingCall)
        socket.on("call:accepted", handleCallAccepted)
        socket.on("peer:nego:needed", handleNegoIncoming)
        socket.on("peer:nego:final", handleNegoFinal)

        return () => {
            socket.off("user:joined", handleUserJoined)
            socket.off("incoming:call", handleIncomingCall)
            socket.off("call:accepted", handleCallAccepted)
            socket.off("peer:nego:needed", handleNegoIncoming)
            socket.off("peer:nego:final", handleNegoFinal)
        }
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoIncoming, handleNegoFinal])

    return (
        <div>
            <h1 className=''>Room</h1>
            <p>{remoteSocketId ? 'Connected' : 'No one in room'}</p>
            {
                remoteSocketId &&
                <button onClick={handleCallUser}>call</button>
            }
            {
                myStream &&
                <button onClick={sendStreams}>send Stream</button>
            }
            <br />
            my stream
            {
                myStream && <ReactPlayer height='300px' width='500px' playing muted url={myStream} />
            }
            <br />
            remote stream
            {
                remoteStream && <ReactPlayer height='300px' width='500px' playing muted url={remoteStream} />
            }
        </div>
    )
}

export default RoomPage