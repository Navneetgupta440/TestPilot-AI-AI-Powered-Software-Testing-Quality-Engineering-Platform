import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
}

/**
 * Compact Icon-only emblem for TestPilot AI
 */
export const TestPilotIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-8 h-8',
  size,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-sm select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="tpIconBgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="tpIconRing" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="35%" stopColor="#2563EB" />
            <stop offset="70%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>

          <linearGradient id="tpIconPlane" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="tpIconRobot" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <linearGradient id="tpIconVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="tpIconShield" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          <filter id="tpIconCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Circular Ambient Glow */}
        <circle cx="250" cy="240" r="210" fill="url(#tpIconBgGlow)" />

        {/* Outer Orbit Swoosh Ring */}
        <path
          d="M 110,340 A 185,185 0 1,1 425,190"
          fill="none"
          stroke="url(#tpIconRing)"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Flight Trajectory Trail */}
        <path
          d="M 270,270 C 330,240 390,190 435,115"
          fill="none"
          stroke="#60A5FA"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="4 8"
        />

        {/* Launching Paper Airplane */}
        <g transform="translate(370, 75) rotate(8)">
          <polygon points="0,40 90,0 35,68" fill="url(#tpIconPlane)" />
          <polygon points="35,68 90,0 80,62" fill="#1E40AF" />
          <polygon points="35,68 90,0 50,54" fill="#2563EB" />
        </g>

        {/* Code Tag Symbol </ > */}
        <g transform="translate(135, 100)">
          <path
            d="M 18,12 L 6,24 L 18,36"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 32,8 L 22,40"
            fill="none"
            stroke="#818CF8"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M 36,12 L 48,24 L 36,36"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Mini Feature Badges */}
        <circle cx="390" cy="205" r="15" fill="#22C55E" />
        <path
          d="M 384,205 L 388,209 L 396,201"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="390" cy="255" r="15" fill="#3B82F6" />
        <circle cx="390" cy="255" r="5" fill="#FFFFFF" />
        <path
          d="M 383,253 L 380,251 M 397,253 L 400,251 M 383,257 L 380,257 M 397,257 L 400,257"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle cx="390" cy="305" r="15" fill="#A855F7" />
        <circle cx="388" cy="303" r="5" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M 392,307 L 396,311" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

        {/* ROBOT PILOT FIGURE */}
        {/* Shoulders / Torso */}
        <path
          d="M 160,370 C 160,300 215,275 250,275 C 285,275 340,300 340,370 Z"
          fill="#0F172A"
        />
        <path
          d="M 180,325 C 215,350 285,350 320,325 L 330,370 C 280,390 220,390 170,370 Z"
          fill="#1E40AF"
        />

        {/* Robot Head Outer Shell */}
        <ellipse cx="250" cy="225" rx="80" ry="76" fill="url(#tpIconRobot)" />

        {/* Antenna */}
        <rect x="247" y="135" width="6" height="22" rx="3" fill="#94A3B8" />
        <circle cx="250" cy="132" r="8" fill="#38BDF8" />
        <circle cx="250" cy="132" r="3.5" fill="#FFFFFF" />

        {/* Visor Area */}
        <rect x="180" y="180" width="140" height="82" rx="30" fill="url(#tpIconVisor)" />
        <rect
          x="182"
          y="182"
          width="136"
          height="78"
          rx="28"
          fill="none"
          stroke="#1E293B"
          strokeWidth="2"
        />

        {/* Smiling Cyan Curved Eyes */}
        <g filter="url(#tpIconCyanGlow)">
          <path
            d="M 210,225 Q 224,210 238,225"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 262,225 Q 276,210 290,225"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>

        {/* Chest Shield Badge */}
        <g transform="translate(222, 295)">
          <path
            d="M 28,0 L 54,14 C 54,42 36,66 28,74 C 20,66 2,42 2,14 Z"
            fill="url(#tpIconShield)"
          />
          <path
            d="M 18,32 L 25,40 L 39,22"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * Standard horizontal Brand Lockup for Header / Navigation
 */
export const TestPilotLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl',
  };

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <TestPilotIcon className={iconSizes[size]} />

      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center space-x-1.5 leading-none">
            <span
              className={`font-black tracking-tight text-[#F0F6FC] ${textSizes[size]} font-sans flex items-center`}
            >
              <span>Test</span>
              <span className="text-[#38BDF8] ml-0.5">Pilot</span>
            </span>

            {/* AI Gradient Pill Badge with Sparkle */}
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold font-mono bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#C026D3] text-white shadow-sm flex items-center space-x-0.5">
              <span>AI</span>
            </span>

            <span className="text-[10px] px-1 py-0.2 rounded font-mono font-bold bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30">
              v1.0
            </span>
          </div>

          {showSubtitle && (
            <p className="text-[10px] text-[#8B949E] font-medium tracking-tight mt-0.5 truncate">
              AI-Powered Testing. Smarter Quality.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Hero Brand Card showcasing full artwork with value proposition badges
 */
export const TestPilotHeroBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      id="testpilot-brand-hero-card"
      className={`rounded-xl bg-[#161B22] border border-[#30363D] p-5 shadow-lg flex flex-col items-center text-center relative overflow-hidden ${className}`}
    >
      {/* Background Decorative Radial Grid */}
      <div className="absolute inset-0 bg-radial from-[#1F6FEB]/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Logo Emblem */}
      <div className="relative mb-3">
        <TestPilotIcon className="w-36 h-36 mx-auto hover:scale-105 transition-transform duration-300" />
      </div>

      {/* Typography Lockup */}
      <div className="space-y-1 z-10">
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F0F6FC] font-sans">
            Test<span className="text-[#38BDF8]">Pilot</span>
          </h1>
          <span className="px-2.5 py-0.5 rounded-lg text-sm font-extrabold font-mono bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#C026D3] text-white shadow-md flex items-center space-x-1">
            <span>AI</span>
            <span className="text-[10px]">✨</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm font-semibold text-[#8B949E] font-mono tracking-wide">
          AI-Powered Testing. Smarter Quality.
        </p>
      </div>

      {/* 5 Core Feature Capability Chips matching user image */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full max-w-xl mt-5 z-10 pt-4 border-t border-[#30363D]">
        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#30363D] flex flex-col items-center text-center space-y-1 hover:border-[#58A6FF] transition">
          <span className="text-xs font-mono font-bold text-[#58A6FF]">&lt;/&gt;</span>
          <span className="text-[10px] font-bold text-[#C9D1D9] uppercase tracking-wider">
            GENERATE TESTS
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#30363D] flex flex-col items-center text-center space-y-1 hover:border-[#3FB950] transition">
          <span className="text-xs font-mono font-bold text-[#3FB950]">🐞</span>
          <span className="text-[10px] font-bold text-[#C9D1D9] uppercase tracking-wider">
            ANALYZE CODE
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#30363D] flex flex-col items-center text-center space-y-1 hover:border-[#E3B341] transition">
          <span className="text-xs font-mono font-bold text-[#E3B341]">🛡️</span>
          <span className="text-[10px] font-bold text-[#C9D1D9] uppercase tracking-wider">
            DETECT ISSUES
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#30363D] flex flex-col items-center text-center space-y-1 hover:border-[#A371F7] transition">
          <span className="text-xs font-mono font-bold text-[#A371F7]">🌐</span>
          <span className="text-[10px] font-bold text-[#C9D1D9] uppercase tracking-wider">
            TEST APIS
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#30363D] flex flex-col items-center text-center space-y-1 hover:border-[#58A6FF] transition">
          <span className="text-xs font-mono font-bold text-[#58A6FF]">📊</span>
          <span className="text-[10px] font-bold text-[#C9D1D9] uppercase tracking-wider">
            QUALITY REPORTS
          </span>
        </div>
      </div>
    </div>
  );
};
