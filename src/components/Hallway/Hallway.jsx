import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music, Gamepad2, Heart, Utensils, Home } from 'lucide-react';
import hallwayBg from '../../assets/hallway_bg.png';

const RoomDoor = ({ x, y, width, height, label, icon: Icon, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
                position: 'absolute',
                top: y,
                left: x,
                width: width,
                height: height,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                // background: 'rgba(255, 255, 255, 0.1)', // Debug visibility
                borderRadius: '10px'
            }}
            onClick={onClick}
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                style={{
                    background: 'rgba(0,0,0,0.8)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    color: 'var(--color-gold)',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    border: '1px solid var(--color-gold)',
                    marginTop: 'auto',
                    marginBottom: '20px'
                }}
            >
                <Icon size={18} />
                <span style={{ fontWeight: 'bold' }}>{label}</span>
            </motion.div>

            {/* Light glow effect */}
            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.6 }}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '10%',
                    width: '80%',
                    height: '20px',
                    background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.8) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(10px)',
                    zIndex: -1
                }}
            />
        </motion.div>
    );
};

const Hallway = ({ onNavigate }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5 }}
            style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${hallwayBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
            }}
        >
            {/* Overlay for darker mood if night - handled by global context later */}

            {/* Doors - positioned relatively to fit the generated image perspective approximately */}

            {/* Living Room - Left */}
            <RoomDoor
                x="10%" y="30%" width="15%" height="50%"
                label="Living Room"
                icon={Home}
                onClick={() => onNavigate('LIVING_ROOM')}
            />

            {/* Bedroom - Right */}
            <RoomDoor
                x="75%" y="30%" width="15%" height="50%"
                label="Bedroom"
                icon={Heart}
                onClick={() => onNavigate('BEDROOM')}
            />

            {/* Kitchen - Far Left */}
            <RoomDoor
                x="2%" y="40%" width="8%" height="40%"
                label="Kitchen"
                icon={Utensils}
                onClick={() => onNavigate('KITCHEN')}
            />

            {/* Gaming Room - Far Right */}
            <RoomDoor
                x="90%" y="40%" width="8%" height="40%"
                label="Gaming Room"
                icon={Gamepad2}
                onClick={() => onNavigate('GAMING_ROOM')}
            />

            {/* Dance Room - Maybe Top Center or "Upstairs" */}
            <RoomDoor
                x="40%" y="10%" width="20%" height="20%"
                label="Dance Room"
                icon={Music}
                onClick={() => onNavigate('DANCE_ROOM')}
            />

            {/* Garden - Center End */}
            <RoomDoor
                x="42%" y="40%" width="16%" height="45%"
                label="Garden"
                icon={Sparkles}
                onClick={() => onNavigate('GARDEN')}
            />

        </motion.div>
    );
};

export default Hallway;
