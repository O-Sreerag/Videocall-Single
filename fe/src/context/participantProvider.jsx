// ParticipantContext.js
import React, { createContext, useContext, useState } from 'react';

const ParticipantContext = createContext();

export const ParticipantProvider = ({ children }) => {
    const [participants, setParticipants] = useState([]);

    const addParticipant = (participant) => {
        console.log("addParticipant")
        console.log("prevParticipant :", participants)
        console.log("participant :", participant)
        console.log(Array.isArray(participant))
        Array.isArray(participant) ?
        setParticipants(prevParticipants => {
            const mergedParticipants = [...prevParticipants, ...participant];
            const uniqueParticipants = Array.from(new Set(mergedParticipants));
            return uniqueParticipants;
        }) :
        setParticipants(prevParticipants => [...prevParticipants, participant]);
    };

    return (
        <ParticipantContext.Provider value={{ participants, addParticipant }}>
            {children}
        </ParticipantContext.Provider>
    );
};

export const useParticipant = () => {
    return useContext(ParticipantContext);
};
