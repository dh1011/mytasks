export function LogoIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            style={{ overflow: 'visible' }}
            aria-label="MyTasks logo"
        >
            {/* Top face — accent colour */}
            <polygon className="logo-face logo-top" points="50,15 85,35 50,55 15,35" />
            {/* Left face — darkest */}
            <polygon className="logo-face logo-left" points="15,35 50,55 50,95 15,75" />
            {/* Right face — clock face */}
            <polygon className="logo-face logo-right" points="50,55 85,35 85,75 50,95" />

            {/* Clock ticks (12, 3, 6, 9 on the isometric face) */}
            <circle className="logo-clock-dot" cx="67.5" cy="53" r="1.2" />
            <circle className="logo-clock-dot" cx="78"   cy="59" r="1.2" />
            <circle className="logo-clock-dot" cx="67.5" cy="77" r="1.2" />
            <circle className="logo-clock-dot" cx="57"   cy="71" r="1.2" />

            {/* Centre pivot */}
            <circle className="logo-clock-dot" cx="67.5" cy="65" r="1.8" />

            {/* Hour hand — slow */}
            <line className="logo-hour-hand"   x1="67.5" y1="65" x2="72"   y2="61" />
            {/* Minute hand — fast */}
            <line className="logo-minute-hand" x1="67.5" y1="65" x2="67.5" y2="55" />
        </svg>
    );
}
