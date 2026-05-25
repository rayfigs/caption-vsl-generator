import React from 'react';
import { useCurrentFrame } from 'remotion';

interface TypingIndicatorProps {
    startFrame: number;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ startFrame }) => {
    const frame = useCurrentFrame();
    const relativeFrame = frame - startFrame;

    return (
        <div style={{ display: 'flex', width: '100%', marginBottom: 6, justifyContent: 'flex-start' }}>
            <div
                style={{
                    backgroundColor: '#E9E9EB',
                    borderRadius: 24,
                    paddingLeft: 22,
                    paddingRight: 22,
                    paddingTop: 16,
                    paddingBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 56,
                    minWidth: 90,
                }}
            >
                {[0, 1, 2].map((i) => {
                    // Wave: each dot offset by 8 frames, opacity + Y sine
                    const offset = i * 8;
                    const t = Math.max(0, relativeFrame - offset);
                    const phase = (t / 18) * Math.PI * 2;
                    const y = Math.sin(phase) * 4;
                    const op = 0.45 + (Math.sin(phase) + 1) / 2 * 0.55;
                    return (
                        <div
                            key={i}
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                backgroundColor: '#8E8E93',
                                opacity: op,
                                transform: `translateY(${y}px)`,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};
