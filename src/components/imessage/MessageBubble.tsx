import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { withAlpha } from '../../imessage/brand';

type GroupPosition = 'single' | 'first' | 'middle' | 'last';

interface MessageBubbleProps {
    text?: string;
    image?: string;
    type: 'sent' | 'received';
    startFrame: number;
    groupPosition?: GroupPosition;
    sentBubbleColor: string;
    receivedBubbleColor: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    text,
    image,
    type,
    startFrame,
    groupPosition = 'single',
    sentBubbleColor,
    receivedBubbleColor,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const relativeFrame = frame - startFrame;
    const isSent = type === 'sent';

    // Animation config: sent messages fly from input bar, received pop in subtly
    const progress = spring({
        frame: relativeFrame,
        fps,
        config: isSent
            ? { stiffness: 420, damping: 34, mass: 0.55 }
            : { stiffness: 350, damping: 28, mass: 0.8 },
    });

    // Sent: fly from ~1200px below (input bar area); Received: subtle 40px pop-in
    const translateY = interpolate(progress, [0, 1], [isSent ? 1200 : 40, 0]);

    // Sent: text visible immediately (was already in input); Received: fade in
    const opacity = isSent
        ? interpolate(relativeFrame, [0, 1], [0.6, 1], { extrapolateRight: 'clamp' })
        : interpolate(relativeFrame, [0, 3], [0, 1], { extrapolateRight: 'clamp' });

    // Sent: starts slightly expanded; Received: starts slightly shrunk
    const scale = isSent
        ? interpolate(progress, [0, 1], [1.05, 1])
        : interpolate(progress, [0, 1], [0.92, 1]);

    // Bubble background materialization for sent messages
    // Frames 0-1: transparent (floating text, no bubble)
    // Frames 1-3: light green forming
    // Frames 3-8: becoming solid green
    const bubbleBgOpacity = isSent
        ? interpolate(relativeFrame, [0, 1, 3, 8], [0, 0, 0.5, 1], { extrapolateRight: 'clamp' })
        : 1;

    // Sent text color: dark → white as bubble forms
    const textWhiteness = isSent
        ? interpolate(relativeFrame, [1, 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        : 0;

    // iOS-style border radius based on grouping position
    const getBorderRadius = () => {
        const large = 22;
        const small = 6;

        if (isSent) {
            switch (groupPosition) {
                case 'first': return `${large}px ${large}px ${small}px ${large}px`;
                case 'middle': return `${large}px ${small}px ${small}px ${large}px`;
                case 'last': return `${large}px ${small}px ${large}px ${large}px`;
                case 'single':
                default: return `${large}px ${large}px ${large}px ${large}px`;
            }
        } else {
            switch (groupPosition) {
                case 'first': return `${large}px ${large}px ${large}px ${small}px`;
                case 'middle': return `${small}px ${large}px ${large}px ${small}px`;
                case 'last': return `${small}px ${large}px ${large}px ${large}px`;
                case 'single':
                default: return `${large}px ${large}px ${large}px ${large}px`;
            }
        }
    };

    return (
        <div
            style={{
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
                transformOrigin: isSent ? 'bottom right' : 'bottom left',
                willChange: 'transform',
                display: 'flex',
                width: '100%',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    paddingLeft: 22,
                    paddingRight: 22,
                    paddingTop: 14,
                    paddingBottom: 14,
                    fontSize: 30,
                    lineHeight: 1.35,
                    borderRadius: getBorderRadius(),
                    backgroundColor: isSent ? withAlpha(sentBubbleColor, bubbleBgOpacity) : receivedBubbleColor,
                    maxWidth: '72%',
                    color: isSent
                        ? `rgb(${Math.round(255 * textWhiteness)}, ${Math.round(255 * textWhiteness)}, ${Math.round(255 * textWhiteness)})`
                        : '#000',
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt="attachment"
                        style={{ borderRadius: 16, marginBottom: 4, maxWidth: '100%' }}
                    />
                ) : (
                    <span style={{ fontWeight: 400 }}>{text}</span>
                )}
            </div>
        </div>
    );
};
