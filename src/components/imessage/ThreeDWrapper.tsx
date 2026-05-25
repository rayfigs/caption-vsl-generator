import React from 'react';
import { AbsoluteFill } from 'remotion';

interface ThreeDWrapperProps {
    children: React.ReactNode;
    rotateX?: number;
    rotateY?: number;
    scale?: number;
    translateY?: number;
}

export const ThreeDWrapper: React.FC<ThreeDWrapperProps> = ({
    children,
    rotateX = 0,
    rotateY = 0,
    scale = 1,
    translateY = 0
}) => {
    return (
        <AbsoluteFill
            style={{
                perspective: '1500px', // Closer perspective for more dramatic 3D
                backgroundColor: '#000',
                overflow: 'hidden'
            }}
        >
            {/* Dynamic Background Gradient */}
            <div
                style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle at center, #2a2a2a 0%, #000000 80%)',
                    transform: `translate(${rotateY * 0.5}px, ${rotateX * 0.5}px) scale(1.1)`, // Parallax
                }}
            />

            <div
                style={{
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transform: `
                        translateY(${translateY}px)
                        rotateX(${rotateX}deg) 
                        rotateY(${rotateY}deg) 
                        scale(${scale})
                    `,
                }}
                className="flex items-center justify-center"
            >
                {/* 3D Model/Frame Container */}
                <div style={{ transformStyle: 'preserve-3d' }}>
                    {children}
                </div>
            </div>

            {/* Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-radial-gradient-vignette opacity-50"></div>
        </AbsoluteFill>
    );
};
