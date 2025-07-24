import React from 'react';
import { Box } from '@mui/material';

// We define the styles and animations directly in the component for encapsulation.
const styles = `
    .space-object {
        position: fixed;
        color: rgba(255, 255, 255, 0.7);
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        will-change: transform;
        z-index: -1;
    }

    @keyframes move-satellite {
        0% { transform: translateX(-10vw) translateY(0) rotate(-45deg); }
        100% { transform: translateX(110vw) translateY(20vh) rotate(-45deg); }
    }
    .satellite {
        font-size: 2rem;
        top: 10%;
        animation: move-satellite 60s linear infinite;
        animation-delay: -30s;
    }

    @keyframes shoot-rocket {
        0% { transform: translateY(110vh) rotate(45deg); opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translateY(-20vh) translateX(20vw) rotate(45deg); opacity: 0; }
    }
    .rocket {
        font-size: 1.5rem;
        left: 20%;
        animation: shoot-rocket 25s ease-in infinite;
    }
    
    @keyframes twinkle {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
    }
    .star {
        position: fixed;
        background-color: white;
        border-radius: 50%;
        will-change: transform, opacity;
        z-index: -1;
    }
`;

const CosmicBackground = () => {
    // Create an array of star properties
    const stars = Array.from({ length: 150 }).map((_, i) => ({
        id: `star-${i}`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 2 + 1}px`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 3}s`,
    }));

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
            overflow: 'hidden'
        }}>
            <style>{styles}</style>
            {stars.map(star => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        animation: `twinkle ${star.animationDuration} infinite`,
                        animationDelay: star.animationDelay,
                    }}
                />
            ))}
            <div className="space-object satellite">🛰️</div>
            <div className="space-object rocket">🚀</div>
        </Box>
    );
};

export default CosmicBackground;
