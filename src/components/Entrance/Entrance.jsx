import { useState } from 'react';
import { motion } from 'framer-motion';
import curtainTexture from '../../assets/curtain_texture.png';
import houseReveal from '../../assets/house_illustration.png';

const Entrance = ({ onEnter }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePull = () => {
    setIsOpen(true);
    // TODO: Add whoosh sound here
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* The Reveal Scene (Behind Curtains) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.8 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${houseReveal})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onEnter}
      >
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 30 }}
          transition={{ delay: 2, duration: 1 }}
          style={{ 
            background: 'rgba(0,0,0,0.6)', 
            padding: '20px 40px', 
            borderRadius: '10px',
            color: 'var(--color-light)',
            textAlign: 'center',
            border: '1px solid var(--color-gold)'
          }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--color-gold)' }}>Welcome Home</h2>
          <p>Click to Enter</p>
        </motion.div>
      </motion.div>

      {/* Left Curtain */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: isOpen ? '-100%' : 0 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }} // Custom bezier for "heavy" feel
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          backgroundImage: `url(${curtainTexture})`,
          backgroundSize: 'cover', // Or repeat if texture is tileable
          zIndex: 10,
          boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
        }}
      />

      {/* Right Curtain */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: isOpen ? '100%' : 0 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          backgroundImage: `url(${curtainTexture})`,
          backgroundSize: 'cover',
          zIndex: 10,
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
        }}
      />

      {/* Rope Trigger */}
      {!isOpen && (
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePull}
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            cursor: 'grab',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{ 
            width: '4px', 
            height: '200px', 
            background: 'var(--color-gold)',
            boxShadow: '0 0 10px var(--color-gold)'
          }} />
          <div style={{
            background: 'var(--color-gold)',
            padding: '10px 20px',
            borderRadius: '30px',
            color: 'var(--color-dark)',
            fontWeight: 'bold',
            marginTop: '-10px',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)'
          }}>
            PULL ME
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default Entrance;
