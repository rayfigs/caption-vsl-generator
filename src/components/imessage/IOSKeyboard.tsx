import React from 'react';

const KEY_BG = '#FCFCFE';
const SPECIAL_KEY_BG = '#ADB3BC';
const KEYBOARD_BG = '#D1D4D9';
const KEY_TEXT = '#000000';
const KEY_SHADOW = 'rgba(0,0,0,0.3)';

const Key: React.FC<{
    label: string;
    width?: number;
    bg?: string;
    fontSize?: number;
    isIcon?: boolean;
}> = ({ label, width = 78, bg = KEY_BG, fontSize = 28, isIcon = false }) => (
    <div
        style={{
            width: `${width}px`,
            height: '52px',
            backgroundColor: bg,
            borderRadius: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 1px 0 ${KEY_SHADOW}`,
            flexShrink: 0,
        }}
    >
        {isIcon ? (
            <span style={{ fontSize: `${fontSize}px`, color: KEY_TEXT, lineHeight: 1 }}>{label}</span>
        ) : (
            <span
                style={{
                    fontSize: `${fontSize}px`,
                    color: KEY_TEXT,
                    fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    fontWeight: 400,
                }}
            >
                {label}
            </span>
        )}
    </div>
);

export const IOSKeyboard: React.FC = () => {
    const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

    return (
        <div
            style={{
                backgroundColor: KEYBOARD_BG,
                width: '100%',
                padding: '10px 4px 8px 4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}
        >
            {/* Suggestion bar */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '0 8px 6px 8px',
                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                }}
            >
                {['Nu', 'Și', 'Da'].map((suggestion) => (
                    <div
                        key={suggestion}
                        style={{
                            flex: 1,
                            textAlign: 'center',
                            fontSize: '20px',
                            color: KEY_TEXT,
                            fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                            padding: '4px 0',
                        }}
                    >
                        {suggestion}
                    </div>
                ))}
            </div>

            {/* Row 1: Q-P */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '7px' }}>
                {row1.map((k) => (
                    <Key key={k} label={k} />
                ))}
            </div>

            {/* Row 2: A-L */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '7px' }}>
                {row2.map((k) => (
                    <Key key={k} label={k} />
                ))}
            </div>

            {/* Row 3: Shift + Z-M + Backspace */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', alignItems: 'center' }}>
                <Key label="⇧" width={100} bg={SPECIAL_KEY_BG} fontSize={24} />
                {row3.map((k) => (
                    <Key key={k} label={k} />
                ))}
                <Key label="⌫" width={100} bg={SPECIAL_KEY_BG} fontSize={24} />
            </div>

            {/* Row 4: 123, emoji, space, return */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', alignItems: 'center' }}>
                <Key label="123" width={100} bg={SPECIAL_KEY_BG} fontSize={20} />
                <Key label="😊" width={52} bg={SPECIAL_KEY_BG} fontSize={24} />
                <div
                    style={{
                        flex: 1,
                        height: '52px',
                        backgroundColor: KEY_BG,
                        borderRadius: '7px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 1px 0 ${KEY_SHADOW}`,
                        position: 'relative',
                    }}
                >
                    <span
                        style={{
                            position: 'absolute',
                            right: '12px',
                            bottom: '6px',
                            fontSize: '14px',
                            color: 'rgba(0,0,0,0.3)',
                            fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                    >
                        EN RO
                    </span>
                </div>
                <Key label="return" width={120} bg={SPECIAL_KEY_BG} fontSize={19} />
            </div>

            {/* Bottom row: globe + mic */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', marginTop: '-2px' }}>
                <span style={{ fontSize: '26px', color: KEY_TEXT }}>🌐</span>
                <span style={{ fontSize: '26px', color: KEY_TEXT }}>🎙️</span>
            </div>
        </div>
    );
};
