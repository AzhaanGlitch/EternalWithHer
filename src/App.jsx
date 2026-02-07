import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Entrance from './components/Entrance/Entrance';
import Hallway from './components/Hallway/Hallway';
import Room from './components/Room/Room';
import { TimeProvider } from './contexts/TimeContext';
import { SoundProvider } from './contexts/SoundContext';
import './index.css';

function App() {
  const [view, setView] = useState('ENTRANCE'); // Views: ENTRANCE, HALLWAY, Room Types

  const getComponent = () => {
    switch (view) {
      case 'ENTRANCE':
        return (
          <motion.div
            key="entrance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 2, transition: { duration: 1.5, ease: "easeInOut" } }}
            style={{ width: '100%', height: '100%' }}
          >
            <Entrance onEnter={() => setView('HALLWAY')} />
          </motion.div>
        );
      case 'HALLWAY':
        return (
          <motion.div
            key="hallway"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.8 } }}
            style={{ width: '100%', height: '100%' }}
          >
            <Hallway onNavigate={setView} />
          </motion.div>
        );
      default:
        // Must be a ROOM view (e.g. LIVING_ROOM)
        return (
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Room type={view} onBack={() => setView('HALLWAY')} />
          </motion.div>
        );
    }
  };

  return (
    <TimeProvider>
      <SoundProvider view={view}>
        <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
          <AnimatePresence mode="wait">
            {getComponent()}
          </AnimatePresence>
        </div>
      </SoundProvider>
    </TimeProvider>
  );
}

export default App;
