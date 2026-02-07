import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const RoomContent = ({ type }) => {
    switch (type) {
        case 'LIVING_ROOM':
            return (
                <div style={{ padding: '40px', color: 'white' }}>
                    <h1>Milestone Timeline</h1>
                    <p>Memories on the wall...</p>
                    {/* Timeline Component would go here */}
                </div>
            );
        case 'BEDROOM':
            return (
                <div style={{ padding: '40px', color: 'white' }}>
                    <h1>Love Letters & Journal</h1>
                    <p>Read the notes...</p>
                    {/* Journal Component */}
                </div>
            );
        case 'KITCHEN':
            return (
                <div style={{ padding: '40px', color: 'white' }}>
                    <h1>Our Recipes & Magnets</h1>
                    <p>Stick a note on the fridge...</p>
                    {/* Fridge Component */}
                </div>
            );
        case 'GAMING_ROOM':
            return (
                <div style={{ padding: '40px', color: 'white' }}>
                    <h1>Interactive Quizzes</h1>
                    <p>How well do you know us?</p>
                    {/* Quiz Component */}
                </div>
            );
        case 'DANCE_ROOM':
            return (
                <div style={{ padding: '40px', color: 'white' }}>
                    <h1>The Soundtrack</h1>
                    <p>Dance with me...</p>
                    {/* Music Player Component */}
                </div>
            );
        case 'GARDEN':
            return (
                <div style={{ padding: '40px', color: 'white' }}>
                    <h1>Future Bucket List</h1>
                    <p>Planting seeds for tomorrow...</p>
                    {/* Bucket List Component */}
                </div>
            );
        default:
            return <div>Unknown Room</div>;
    }
};

const Room = ({ type, onBack }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }} // Zoom in effect from hallway door
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.8 }}
            style={{
                width: '100%',
                height: '100%',
                background: '#2a2a2a', // Placeholder for room bg
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <button
                onClick={onBack}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    color: 'white',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    zIndex: 100
                }}
            >
                <ArrowLeft size={20} /> Back to Hallway
            </button>

            {/* Window Effect should go here (Global Component maybe?) */}

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RoomContent type={type} />
            </div>
        </motion.div>
    );
};

export default Room;
