import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import {
  GraduationCap, Compass, Microscope, Rocket, Palette, Sparkles,
  Code2, Stethoscope, BrainCircuit, FlaskConical, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Auth = () => {
  const location = useLocation();

  const [isLoginMode, setIsLoginMode] = useState(
    location.pathname === '/login' || location.pathname === '/auth'
  );

  useEffect(() => {
    setIsLoginMode(location.pathname === '/login' || location.pathname === '/auth');
  }, [location.pathname]);

  const toggleMode = () => {
    setIsLoginMode((prev) => !prev);
    window.history.pushState({}, '', isLoginMode ? '/register' : '/login');
  };

  /* ═══════════════════ Shared Hero Panel (original Login.tsx hero content) ═══════════════════ */
  const HeroPanel = ({ showCta = false }: { showCta?: boolean }) => (
    <div
      className="relative overflow-hidden w-full h-full flex flex-col justify-center"
      style={{
        background: 'linear-gradient(135deg, hsl(221 83% 53%) 0%, hsl(244 60% 45%) 50%, hsl(24 80% 55%) 100%)',
      }}
    >
      {/* ──── Animated gradient orbs ──── */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-25 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, hsl(221 90% 70%), transparent 70%)',
          top: '-30%', left: '-25%',
          animation: 'loginOrbDrift 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-[90px]"
        style={{
          background: 'radial-gradient(circle, hsl(280 70% 60%), transparent 70%)',
          top: '15%', right: '-30%',
          animation: 'loginOrbDrift 15s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none opacity-20 blur-[80px]"
        style={{
          background: 'radial-gradient(circle, hsl(24 90% 60%), transparent 70%)',
          bottom: '-25%', right: '-10%',
          animation: 'loginOrbDrift 10s ease-in-out 2s infinite',
        }}
      />

      {/* ──── Geometric grid overlay ──── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ──── Glowing particle dots ──── */}
      {[
        { top: '5%', left: '8%', size: 4, delay: '0s', dur: '4s' },
        { top: '8%', left: '80%', size: 3, delay: '1s', dur: '5s' },
        { top: '88%', left: '5%', size: 5, delay: '0.5s', dur: '6s' },
        { top: '92%', left: '75%', size: 3, delay: '2s', dur: '4.5s' },
        { top: '3%', left: '50%', size: 4, delay: '1.5s', dur: '5.5s' },
        { top: '50%', left: '3%', size: 3, delay: '0.8s', dur: '4s' },
        { top: '50%', left: '92%', size: 2, delay: '2.5s', dur: '3.5s' },
        { top: '95%', left: '45%', size: 3, delay: '1.2s', dur: '5s' },
        { top: '20%', left: '30%', size: 3, delay: '3s', dur: '4.8s' },
        { top: '40%', left: '60%', size: 2, delay: '0.6s', dur: '5.2s' },
        { top: '70%', left: '25%', size: 4, delay: '1.8s', dur: '3.8s' },
        { top: '30%', left: '88%', size: 3, delay: '2.2s', dur: '4.3s' },
      ].map(({ top, left, size, delay, dur }, i) => (
        <div
          key={`dot-${i}`}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            top, left,
            width: size, height: size,
            animation: `loginPulseGlow ${dur} ease-in-out ${delay} infinite`,
          }}
        />
      ))}

      {/* ──── Floating career icons ──── */}
      {[
        { Icon: Microscope, top: '12%', left: '14%', delay: '0s', size: 'w-7 h-7 sm:w-8 sm:h-8', dur: '7s' },
        { Icon: Palette, top: '14%', left: '40%', delay: '3.2s', size: 'w-6 h-6 sm:w-8 sm:h-8', dur: '6.5s' },
        { Icon: Rocket, top: '5%', left: '72%', delay: '1.2s', size: 'w-5 h-5 sm:w-7 sm:h-7', dur: '9s' },
        { Icon: FlaskConical, top: '35%', left: '12%', delay: '0.3s', size: 'w-5 h-5 sm:w-6 sm:h-6', dur: '9.5s' },
        { Icon: Sparkles, top: '48%', left: '85%', delay: '2s', size: 'w-5 h-5 sm:w-6 sm:h-6', dur: '6s' },
        { Icon: Code2, top: '62%', left: '16%', delay: '0.5s', size: 'w-6 h-6 sm:w-8 sm:h-8', dur: '8s' },
        { Icon: BookOpen, top: '75%', left: '72%', delay: '0.8s', size: 'w-6 h-6 sm:w-7 sm:h-7', dur: '10s' },
        { Icon: Stethoscope, top: '85%', left: '38%', delay: '1.6s', size: 'w-6 h-6 sm:w-7 sm:h-7', dur: '7.5s' },
        { Icon: BrainCircuit, top: '85%', left: '12%', delay: '2.8s', size: 'w-5 h-5 sm:w-7 sm:h-7', dur: '8.5s' },
      ].map(({ Icon, top, left, delay, size, dur }, i) => (
        <div
          key={`icon-${i}`}
          className="absolute pointer-events-none hidden sm:block"
          style={{
            top, left,
            animation: `loginIconFloat ${dur} ease-in-out ${delay} infinite`,
          }}
        >
          <div className="p-2.5 rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/[0.08]">
            <Icon className={`${size} text-white/30`} strokeWidth={1.4} />
          </div>
        </div>
      ))}

      {/* ──── Compass decorations ──── */}
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{ bottom: '6%', right: '4%', animation: 'loginRingSpin 40s linear infinite' }}
      >
        <Compass className="w-28 h-28 xl:w-36 xl:h-36 text-white/[0.08]" strokeWidth={0.8} />
      </div>
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{ top: '4%', left: '3%', animation: 'loginRingSpin 25s linear infinite reverse' }}
      >
        <Compass className="w-16 h-16 text-white/[0.06]" strokeWidth={0.7} />
      </div>

      {/* ──── Content ──── */}
      <div className="relative z-10 max-w-md mx-auto text-center px-6">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 justify-center mb-6 lg:mb-10 opacity-0"
          style={{ animation: 'loginSlideUp 0.6s ease-out 0.1s forwards', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <img src="/logo.png" alt="Naviksha AI" className="w-7 h-7 sm:w-8 sm:h-8 rounded-md" />
          </div>
          <span className="text-white text-lg sm:text-xl font-bold tracking-tight">
            Naviksha AI
          </span>
        </div>

        {/* Tagline */}
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold text-white leading-tight tracking-tight mb-4 opacity-0"
          style={{ animation: 'loginSlideUp 0.6s ease-out 0.3s forwards', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Navigate <br className="hidden sm:block" /> Your Future
        </h1>

        <p
          className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed max-w-sm mx-auto mb-8 lg:mb-10 opacity-0"
          style={{ animation: 'loginSlideUp 0.6s ease-out 0.5s forwards' }}
        >
          AI-Powered Career Guidance for Students
        </p>

        {/* Stats badges */}
        <div
          className="flex items-center justify-center gap-6 sm:gap-8 opacity-0"
          style={{ animation: 'loginSlideUp 0.6s ease-out 0.7s forwards' }}
        >
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              120+
            </div>
            <div className="text-white/60 text-xs sm:text-sm">Colleges</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              20,000+
            </div>
            <div className="text-white/60 text-xs sm:text-sm">Students Guided</div>
          </div>
        </div>

        {/* CTA button to switch mode (only in sliding overlay, not mobile) */}
        {showCta && (
          <div className="mt-10 opacity-0" style={{ animation: 'loginSlideUp 0.6s ease-out 0.9s forwards' }}>
            <div className="w-16 mx-auto mb-6 border-t border-white/20" />
            <p className="text-white/70 text-sm mb-4">
              {isLoginMode
                ? "Don't have an account yet?"
                : "Already have an account?"}
            </p>
            <Button
              onClick={toggleMode}
              variant="outline"
              className="h-12 px-10 rounded-full border-2 border-white text-white font-bold bg-transparent hover:bg-white hover:text-primary transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
            >
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <>
      {/* ────────── DESKTOP LAYOUT ────────── */}
      <div className="hidden lg:flex relative min-h-screen w-full overflow-hidden bg-background animate-fade-in">

        {/* LEFT SIDE: Sign In Form */}
        <div className="absolute top-0 left-0 w-1/2 h-full z-10 flex items-center justify-center p-8">
          <div className={`transition-all duration-500 delay-200 transform w-full ${isLoginMode ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0 pointer-events-none'}`}>
            <Login onSwitchMode={toggleMode} />
          </div>
        </div>

        {/* RIGHT SIDE: Sign Up Form */}
        <div className="absolute top-0 left-1/2 w-1/2 h-full z-10 flex items-start justify-center overflow-y-auto">
          <div className={`transition-all duration-500 delay-200 transform w-full ${!isLoginMode ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0 pointer-events-none'}`}>
            <SignUp onSwitchMode={toggleMode} />
          </div>
        </div>

        {/* SLIDING OVERLAY — the original hero panel */}
        <div
          className="absolute top-0 left-0 w-1/2 h-full z-30 transition-transform duration-700 ease-in-out shadow-2xl"
          style={{ transform: `translateX(${isLoginMode ? '100%' : '0%'})` }}
        >
          <HeroPanel showCta />
        </div>
      </div>

      {/* ────────── MOBILE LAYOUT ────────── */}
      <div className="flex lg:hidden flex-col min-h-screen w-full bg-background animate-fade-in relative z-0">
        {/* Mobile hero header (compact version) */}
        <div className="shrink-0" style={{ minHeight: '28vh' }}>
          <HeroPanel showCta={false} />
        </div>

        {/* Form area below hero */}
        <div className="flex-1 w-full bg-background relative -mt-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10 overflow-hidden">
          <div className={`transition-all duration-300 ${isLoginMode ? 'block' : 'hidden'}`}>
            <Login onSwitchMode={toggleMode} />
          </div>
          <div className={`transition-all duration-300 h-full ${!isLoginMode ? 'block' : 'hidden'}`}>
            <SignUp onSwitchMode={toggleMode} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
