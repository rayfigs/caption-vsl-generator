import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Sequence, staticFile } from 'remotion';
import { ChevronLeft, User } from 'lucide-react';
import type { BrandProps, Message } from '../../imessage/types';
import { resolveBrandProps, withAlpha } from '../../imessage/brand';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { IPhoneFrame } from './IPhoneFrame';
import { ThreeDWrapper } from './ThreeDWrapper';
import { LogoOverlay } from './LogoOverlay';

const HEADER_HEIGHT = 290;
const INPUT_HEIGHT = 130;

type GroupPosition = 'single' | 'first' | 'middle' | 'last';

function getGroupPosition(conversation: Message[], index: number): GroupPosition {
    const msg = conversation[index];
    const prev = index > 0 ? conversation[index - 1] : null;
    const next = index < conversation.length - 1 ? conversation[index + 1] : null;
    const samePrev = prev?.type === msg.type;
    const sameNext = next?.type === msg.type;

    if (samePrev && sameNext) return 'middle';
    if (samePrev && !sameNext) return 'last';
    if (!samePrev && sameNext) return 'first';
    return 'single';
}

interface ChatScreenProps {
    conversation: Message[];
    contactName?: string;
    subtitle?: string;
    is3D?: boolean;
    brand?: BrandProps;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ conversation, contactName = 'GymBeam', subtitle, is3D = true, brand }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const resolvedBrand = useMemo(() => resolveBrandProps(brand), [brand]);

    const { messagesWithTiming, currentInputText, inputDepartureProgress } = useMemo(() => {
        let currentStartFrame = 0;
        let inputText = '';

        const timedMessages = conversation.map((msg) => {
            const typingDur = msg.type === 'received' ? (msg.typingDuration || 0) : 0;
            const preSendDelay = msg.type === 'sent' ? Math.min(msg.duration, msg.text?.length ? msg.text.length * 2 + 10 : 30) : 0;

            const startOfActivity = currentStartFrame;
            const messageAppearFrame = startOfActivity + (msg.type === 'received' ? typingDur : preSendDelay);
            const endOfMessageDuration = messageAppearFrame + msg.duration;

            const timing = {
                ...msg,
                startOfActivity,
                messageAppearFrame,
                endFrame: endOfMessageDuration,
            };

            currentStartFrame = endOfMessageDuration;
            return timing;
        });

        const activeSentMessage = timedMessages.find(m =>
            m.type === 'sent' &&
            frame >= m.startOfActivity &&
            frame < m.messageAppearFrame
        );

        let departureProgress = 0;

        if (activeSentMessage && activeSentMessage.text) {
            const progress = frame - activeSentMessage.startOfActivity;
            const totalChars = activeSentMessage.text.length;
            const duration = activeSentMessage.messageAppearFrame - activeSentMessage.startOfActivity;
            const charCount = Math.floor((progress / duration) * totalChars);
            inputText = activeSentMessage.text.substring(0, charCount);

            // Last 3 frames before send: text lifts out of input field
            const framesUntilSend = activeSentMessage.messageAppearFrame - frame;
            if (framesUntilSend <= 3) {
                departureProgress = 1 - (framesUntilSend / 3);
            }
        }

        return { messagesWithTiming: timedMessages, currentInputText: inputText, inputDepartureProgress: departureProgress };
    }, [conversation, frame]);

    // Camera logic
    const currentMessageIndex = useMemo(() => {
        let lastIndex = -1;
        messagesWithTiming.forEach((msg, i) => {
            if (frame >= msg.messageAppearFrame) {
                lastIndex = i;
            }
        });
        return lastIndex;
    }, [messagesWithTiming, frame]);

    const { finalRotateY, activeZoom } = useMemo(() => {
        if (currentMessageIndex < 0) {
            return { finalRotateY: 0, activeZoom: 0.95 };
        }

        const currentMsg = messagesWithTiming[currentMessageIndex];
        const isSent = currentMsg.type === 'sent';
        const targetTilt = isSent ? -8 : 8;
        const relativeFrame = frame - currentMsg.messageAppearFrame;

        const snapProgress = spring({
            frame: relativeFrame,
            fps,
            config: { stiffness: 300, damping: 18, mass: 0.8 },
        });

        let previousTilt = 0;
        if (currentMessageIndex > 0) {
            const prevMsg = messagesWithTiming[currentMessageIndex - 1];
            previousTilt = prevMsg.type === 'sent' ? -8 : 8;
        }

        const rotateY = interpolate(snapProgress, [0, 1], [previousTilt, targetTilt]);
        const zoom = interpolate(snapProgress, [0, 1], [0.95, 0.98]);

        return { finalRotateY: rotateY, activeZoom: zoom };
    }, [currentMessageIndex, messagesWithTiming, frame, fps]);

    const finalRotateX = 0;
    const finalTranslateY = -100;

    // Estimate message height for scroll calculation.
    // Calibrated to current MessageBubble: fontSize 30, lineHeight 1.35,
    // paddingTop+Bottom = 28, maxWidth 72% of ~870px usable = ~626px,
    // average char width ~16px at 30px font => ~38 chars/line.
    const estimateMessageHeight = (msg: Message, index: number) => {
        if (msg.image) return 360;
        if (!msg.text) return 70;

        const charsPerLine = 38;
        const lines = Math.max(1, Math.ceil(msg.text.length / charsPerLine));
        const lineHeight = 41;
        const paddingY = 28;
        const groupPos = getGroupPosition(conversation, index);
        const marginBottom = (groupPos === 'first' || groupPos === 'middle') ? 8 : 22;

        return paddingY + (lines * lineHeight) + marginBottom;
    };

    // Scroll logic — keep newest messages visible
    const globalLayoutShift = useMemo(() => {
        if (messagesWithTiming.length === 0) return 0;

        let totalContentHeight = 0;
        let lastMessageIndex = -1;

        messagesWithTiming.forEach((msg, index) => {
            if (frame >= msg.messageAppearFrame) {
                totalContentHeight += estimateMessageHeight(msg, index);
                lastMessageIndex = index;
            }
        });

        if (lastMessageIndex === -1) return 0;

        const screenHeight = 1850 - HEADER_HEIGHT - INPUT_HEIGHT;
        const requiredScroll = Math.max(0, totalContentHeight - screenHeight);

        const lastMessage = messagesWithTiming[lastMessageIndex];
        // Pre-scroll: start animating 8 frames BEFORE message lands so the room is ready when it arrives
        const PRE_SCROLL_LEAD = 8;
        const scrollAnchor = lastMessage.messageAppearFrame - PRE_SCROLL_LEAD;
        const timeSinceAppear = frame - scrollAnchor;
        if (timeSinceAppear < 0) return 0;

        // Stiffer spring so scroll catches up before the bubble finishes rising
        const scrollProgress = spring({
            frame: timeSinceAppear,
            fps,
            config: { stiffness: 380, damping: 36, mass: 0.7 },
        });

        let previousContentHeight = 0;
        for (let i = 0; i < lastMessageIndex; i++) {
            if (frame >= messagesWithTiming[i].messageAppearFrame) {
                previousContentHeight += estimateMessageHeight(messagesWithTiming[i], i);
            }
        }
        const previousScroll = Math.max(0, previousContentHeight - screenHeight);

        const currentScroll = interpolate(scrollProgress, [0, 1], [previousScroll, requiredScroll], {
            extrapolateRight: 'clamp',
        });

        return -currentScroll;
    }, [messagesWithTiming, frame, fps]);

    const content = (
        <IPhoneFrame>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: resolvedBrand.backgroundColor }} />

            {/* Status Bar — black text on white */}
            <div style={{ position: 'absolute', top: 38, width: '100%', height: 54, zIndex: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 40, paddingRight: 40, color: '#000' }}>
                <div style={{ fontWeight: 600, fontSize: 21, letterSpacing: '-0.025em', marginLeft: 16, fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>1:41</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginRight: 16 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 14h2v6H4v-6zm5-4h2v10H9V10zm5-5h2v15h-2V5zm5-4h2v19h-2V1z" /></svg>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.2 0-8 1.7-10.8 4.3l1.4 1.4C4.9 6.5 8.2 5 12 5s7.1 1.5 9.4 3.7l1.4-1.4C20 4.7 16.2 3 12 3zm0 4c-2.7 0-5.2.9-7.1 2.5l1.5 1.5C7.8 9.7 9.8 9 12 9s4.2.7 5.6 1.9l1.5-1.5C17.2 7.9 14.7 7 12 7zm0 4c-1.4 0-2.7.4-3.8 1.1l3.8 3.8 3.8-3.8C14.7 11.4 13.4 11 12 11z" /></svg>
                    <div style={{ width: 32, height: 16, border: '1.5px solid rgba(0,0,0,0.3)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 2, paddingRight: 2, position: 'relative', marginLeft: 4 }}>
                        <div style={{ width: 20, height: 10, background: '#000', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)', width: 2, height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: '0 2px 2px 0' }} />
                    </div>
                </div>
            </div>

            {/* iOS Messages Header — light mode */}
            <div
                style={{
                    position: 'absolute', top: 0, width: '100%', zIndex: 30,
                    display: 'flex', flexDirection: 'column',
                    height: `${HEADER_HEIGHT}px`,
                    backgroundColor: 'rgba(249,249,249,0.94)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                }}
            >
                {/* Nav bar row — starts below the Dynamic Island */}
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 24, paddingRight: 24, paddingTop: 150, paddingBottom: 12, position: 'relative' }}>
                    {/* Back button (left) */}
                    <div style={{ display: 'flex', alignItems: 'center', color: '#007AFF', position: 'absolute', left: 24, top: 150 }}>
                        <ChevronLeft size={40} strokeWidth={2.5} />
                    </div>

                    {/* Camera/FaceTime icon (right) */}
                    <div style={{ position: 'absolute', right: 36, top: 154, color: '#007AFF' }}>
                        <svg width="44" height="32" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.75" y="0.75" width="18.5" height="18.5" rx="4" stroke="#007AFF" strokeWidth="1.5" fill="none" />
                            <path d="M20 7 L27 4 L27 16 L20 13 Z" fill="#007AFF" />
                        </svg>
                    </div>

                    {/* Center: avatar + name */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
                        <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#B0B0B5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 500, fontSize: 38 }}>
                            {conversation[0]?.avatar ? (
                                <img src={conversation[0].avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span>{contactName.split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || <User size={48} color="#fff" />}</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 30, fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', color: '#000' }}>{contactName}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages area — white background */}
            <div
                style={{
                    position: 'absolute', inset: 0,
                    paddingLeft: 20, paddingRight: 20,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                    zIndex: 10, overflow: 'hidden',
                    paddingTop: `${HEADER_HEIGHT}px`,
                    paddingBottom: `${INPUT_HEIGHT}px`,
                    transform: `translateY(${globalLayoutShift}px)`,
                }}
            >
                {/* Conversation timestamp divider — scrolls with messages */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18, marginTop: 4 }}>
                    <span style={{ fontSize: 22, color: '#8E8E93', fontWeight: 500, marginBottom: 2 }}>{subtitle || 'iMessage'}</span>
                    <span style={{ fontSize: 22, color: '#8E8E93' }}>
                        Today <span style={{ fontWeight: 600 }}>1:41 PM</span>
                    </span>
                </div>
                {messagesWithTiming.map((msg, index) => {
                    const isTypingIndicatorVisible = msg.type === 'received' && frame >= msg.startOfActivity && frame < msg.messageAppearFrame;
                    // Sent messages start rising 4 frames early (behind the input bar)
                    const SEND_EARLY_FRAMES = msg.type === 'sent' ? 4 : 0;
                    const isMessageVisible = frame >= (msg.messageAppearFrame - SEND_EARLY_FRAMES);
                    const groupPos = getGroupPosition(conversation, index);
                    const isGrouped = groupPos === 'first' || groupPos === 'middle';

                    return (
                        <React.Fragment key={msg.id}>
                            {isTypingIndicatorVisible && (
                                <TypingIndicator startFrame={msg.startOfActivity} />
                            )}
                            {isMessageVisible && (
                                <div
                                    style={{
                                        marginBottom: isGrouped ? 8 : 22,
                                        display: 'block',
                                        width: '100%',
                                        overflow: 'visible',
                                    }}
                                >
                                    <MessageBubble
                                        startFrame={msg.messageAppearFrame - SEND_EARLY_FRAMES}
                                        text={msg.text}
                                        image={msg.image}
                                        type={msg.type}
                                        groupPosition={groupPos}
                                        sentBubbleColor={resolvedBrand.sentBubbleColor}
                                        receivedBubbleColor={resolvedBrand.receivedBubbleColor}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Input Area — white background matching iOS Messages */}
            <div
                style={{
                    position: 'absolute', left: 0, right: 0, zIndex: 20,
                    display: 'flex', alignItems: 'center',
                    bottom: '34px',
                    height: `${INPUT_HEIGHT}px`,
                    backgroundColor: '#FFFFFF',
                    paddingLeft: '30px',
                    paddingRight: '30px',
                }}
            >
                {/* Plus button — gray circle */}
                <div
                    style={{ borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', backgroundColor: resolvedBrand.receivedBubbleColor, color: '#8E8E93', marginRight: '18px' }}
                >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>

                {/* Text input — white with border, mic or send button inside */}
                <div
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
                        height: '80px',
                        borderRadius: '40px',
                        paddingLeft: '36px',
                        paddingRight: currentInputText ? '8px' : '28px',
                        fontSize: '34px',
                        border: '2px solid #C7C7CC',
                        backgroundColor: '#FFFFFF',
                        fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                >
                    {currentInputText ? (
                        <span style={{
                            color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            transform: `translateY(${-inputDepartureProgress * 30}px)`,
                            opacity: 1 - inputDepartureProgress * 0.5,
                            display: 'inline-block',
                            flex: 1,
                            minWidth: 0,
                        }}>
                            {currentInputText}
                            <span style={{ borderRight: '3px solid #007AFF', marginLeft: '2px', height: '1.2em', display: 'inline-block', verticalAlign: 'middle', animation: 'pulse 1s infinite' }} />
                        </span>
                    ) : (
                        <span style={{ color: '#8E8E93', fontWeight: 400 }}>Text Message  &bull;  SMS</span>
                    )}
                    {currentInputText ? (
                        <div style={{
                            flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '62px',
                            height: '62px',
                            backgroundColor: resolvedBrand.sentBubbleColor,
                            marginLeft: '10px',
                            transform: `scale(${1 - inputDepartureProgress * 0.3})`,
                            opacity: 1 - inputDepartureProgress * 0.6,
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '32px', height: '32px', color: 'white' }}>
                                <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06l-6.22-6.22V21a.75.75 0 01-1.5 0V4.81l-6.22 6.22a.75.75 0 11-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
                            </svg>
                        </div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#C7C7CC" style={{ width: '42px', height: '42px', flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Home indicator — black on white background */}
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', borderRadius: 9999, zIndex: 30, bottom: '10px', width: '280px', height: '10px', backgroundColor: 'rgba(0,0,0,0.8)' }} />
            <LogoOverlay brand={resolvedBrand} contactName={contactName} />
        </IPhoneFrame>
    );

    // Sound effects intentionally stripped — silent video so post-production
    // can layer in real iMessage sounds, voiceover, or music without conflict.
    const audioElements: React.ReactElement[] = [];

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {/* Sound effects */}
            {audioElements}
            <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #111827 0%, #000 100%)', opacity: 0.9 }} />
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: 500, background: 'linear-gradient(to top, rgba(31,41,55,0.2), transparent)' }} />
            </div>
            {is3D ? (
                <ThreeDWrapper
                    scale={activeZoom}
                    rotateY={finalRotateY}
                    rotateX={finalRotateX}
                    translateY={finalTranslateY}
                >
                    {content}
                </ThreeDWrapper>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', transform: 'scale(0.9)' }}>
                    {content}
                </div>
            )}
        </AbsoluteFill>
    );
};
