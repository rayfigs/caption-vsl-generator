const width = 950;
const height = 1850;
const depth = 40;
const cornerRadius = 130;

const sideGradient = 'linear-gradient(to bottom, #7e7e7e, #4a4a4a, #7e7e7e)';
const topBottomGradient = 'linear-gradient(to right, #7e7e7e, #4a4a4a, #7e7e7e)';

const fill = { position: 'absolute' as const, inset: 0 };

// Helper to generate curved corner segments
const Corner: React.FC<{
    cx: number;
    cy: number;
    startAngle: number; // in degrees
    segments?: number;
}> = ({ cx, cy, startAngle, segments = 6 }) => {
    const angleStep = 90 / segments;
    const segmentWidth = 2 * cornerRadius * Math.tan((angleStep * Math.PI / 180) / 2) + 1;

    return (
        <>
            {Array.from({ length: segments }).map((_, i) => {
                const angle = startAngle + i * angleStep + (angleStep / 2);
                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: `${segmentWidth}px`,
                            height: `${depth}px`,
                            background: sideGradient,
                            left: cx,
                            top: cy,
                            transform: `translate(-50%, -50%) rotateZ(${angle}deg) translateY(-${cornerRadius}px) rotateX(90deg)`,
                            transformOrigin: 'center center'
                        }}
                    />
                );
            })}
        </>
    );
};

export const IPhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div
            style={{
                width: `${width}px`,
                height: `${height}px`,
                position: 'relative',
                transformStyle: 'preserve-3d',
            }}
        >
            {/* --- BACK FACE --- */}
            <div
                style={{
                    ...fill,
                    borderRadius: 130,
                    border: '2px solid #333',
                    transform: `translateZ(-${depth / 2}px) rotateY(180deg)`,
                    background: 'linear-gradient(135deg, #2c2c2e 0%, #151516 100%)',
                    boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                    backfaceVisibility: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: 128, height: 128,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    filter: 'blur(24px)',
                    transform: 'translate(-50%, -50%)',
                }} />
            </div>

            {/* --- STRAIGHT SIDES --- */}
            {/* Right */}
            <div
                style={{
                    position: 'absolute',
                    width: `${depth}px`,
                    height: `${height - (2 * cornerRadius)}px`,
                    background: sideGradient,
                    top: cornerRadius,
                    right: -depth / 2,
                    transform: 'rotateY(90deg) translateZ(0)',
                }}
            >
                <div style={{
                    position: 'absolute', top: 270, left: '50%',
                    width: 4, height: 100,
                    background: '#3a3a3a',
                    borderRadius: 2,
                    transform: 'translateX(-50%)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }} />
            </div>
            {/* Left */}
            <div
                style={{
                    position: 'absolute',
                    width: `${depth}px`,
                    height: `${height - (2 * cornerRadius)}px`,
                    background: sideGradient,
                    top: cornerRadius,
                    left: -depth / 2,
                    transform: 'rotateY(-90deg) translateZ(0)',
                }}
            >
                <div style={{
                    position: 'absolute', top: 270, left: '50%',
                    width: 4, height: 70,
                    background: '#3a3a3a', borderRadius: 2,
                    transform: 'translateX(-50%)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }} />
                <div style={{
                    position: 'absolute', top: 370, left: '50%',
                    width: 4, height: 70,
                    background: '#3a3a3a', borderRadius: 2,
                    transform: 'translateX(-50%)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }} />
                <div style={{
                    position: 'absolute', top: 150, left: '50%',
                    width: 4, height: 40,
                    background: '#3a3a3a', borderRadius: 2,
                    transform: 'translateX(-50%)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }} />
            </div>
            {/* Top */}
            <div
                style={{
                    position: 'absolute',
                    width: `${width - (2 * cornerRadius)}px`,
                    height: `${depth}px`,
                    background: topBottomGradient,
                    top: -depth / 2,
                    left: cornerRadius,
                    transform: 'rotateX(90deg) translateZ(0)',
                }}
            />
            {/* Bottom */}
            <div
                style={{
                    position: 'absolute',
                    width: `${width - (2 * cornerRadius)}px`,
                    height: `${depth}px`,
                    background: topBottomGradient,
                    bottom: -depth / 2,
                    left: cornerRadius,
                    transform: 'rotateX(-90deg) translateZ(0)',
                }}
            >
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 100, height: 15,
                    background: '#000',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                }} />
            </div>

            {/* --- CURVED CORNERS --- */}
            <Corner cx={width - cornerRadius} cy={cornerRadius} startAngle={0} />
            <Corner cx={width - cornerRadius} cy={height - cornerRadius} startAngle={90} />
            <Corner cx={cornerRadius} cy={height - cornerRadius} startAngle={180} />
            <Corner cx={cornerRadius} cy={cornerRadius} startAngle={270} />

            {/* --- FRONT FACE --- */}
            <div
                style={{
                    ...fill,
                    background: '#1d1d1f',
                    borderRadius: 130,
                    border: '6px solid #4b4b4b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    transform: `translateZ(${depth / 2}px)`,
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                    backfaceVisibility: 'hidden'
                }}
            >
                <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', transform: 'translateZ(1px)' }}>
                    {children}
                    {/* Dynamic Island */}
                    <div style={{
                        position: 'absolute', top: 35, left: '50%',
                        width: 340, height: 100,
                        background: '#000',
                        borderRadius: 50,
                        zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transform: 'translateX(-50%)',
                    }}>
                        <div style={{
                            width: '30%', height: '30%',
                            background: '#1a1a1a', borderRadius: '50%',
                            marginRight: 48, opacity: 0.4, filter: 'blur(1px)',
                        }} />
                        <div style={{
                            width: '20%', height: '20%',
                            background: '#0f0f0f', borderRadius: '50%',
                            marginLeft: 8, opacity: 0.5, filter: 'blur(0.5px)',
                        }} />
                    </div>
                </div>
                <div style={{
                    ...fill,
                    borderRadius: 120,
                    background: 'linear-gradient(to top right, rgba(255,255,255,0.05), transparent)',
                    pointerEvents: 'none',
                    zIndex: 60,
                    transform: 'translateZ(2px)',
                }} />
            </div>
        </div>
    );
};
