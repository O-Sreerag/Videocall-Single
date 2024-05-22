import './App.css';
import { Routes, Route } from 'react-router-dom'

import LobbyScreen from './screens/Lobby';
import RoomPage from './screens/Room';

import { ParticipantProvider } from './context/participantProvider';

function App() {
  return (
    <div className="App">
      <ParticipantProvider>
        <Routes>
          <Route path='/lobby' element={<LobbyScreen />} />
          <Route path='/room' element={<RoomPage />} />
        </Routes>
      </ParticipantProvider>
    </div>
  );
}

export default App;
