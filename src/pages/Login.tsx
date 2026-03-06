/**
 * Login Page – Premium split-screen design
 * Left hero panel matches landing-page branding (blue-to-orange gradient).
 * Right side houses the sign-in form with Phone / Student-ID tabs.
 * Fully responsive: stacks vertically on mobile.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    GraduationCap,
    Loader2,
    User as UserIcon,
    ArrowRight,
    Phone,
    IdCard,
    Shield,
    Microscope,
    Code2,
    Palette,
    Stethoscope,
    Sparkles,
    Compass,
    BookOpen,
    Rocket,
    BrainCircuit,
    FlaskConical,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { apiService, type User } from '@/lib/api';

/* ═══════════════════ Component ═══════════════════ */
const Login: React.FC = () => {
    const { lookup } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [phone, setPhone] = useState('');
    const [activeTab, setActiveTab] = useState<'phone' | 'student'>('phone');
    const [errors, setErrors] = useState({ phone: '', studentId: '' });
    const [profiles, setProfiles] = useState<User[]>([]);

    /* ──── validation ──── */
    const validatePhone = (value: string) => {
        if (value.length === 0) return '';
        if (!/^\d+$/.test(value)) return 'Phone number must contain only digits';
        if (value.length !== 10) return 'Phone number must be exactly 10 digits';
        return '';
    };

    const validateStudentId = (value: string) => {
        if (value.length === 0) return '';
        if (!/^[a-zA-Z0-9_\-]+$/.test(value)) return 'Student ID must contain only letters, numbers, underscores, or hyphens';
        if (value.length < 1) return 'Student ID is required';
        return '';
    };

    /* ──── handlers ──── */
    const handleLookup = async () => {
        if (activeTab === 'phone') {
            const phoneError = validatePhone(phone);
            if (phoneError) { setErrors(e => ({ ...e, phone: phoneError })); return; }
        } else {
            const studentIdError = validateStudentId(studentId);
            if (studentIdError) { setErrors(e => ({ ...e, studentId: studentIdError })); return; }
        }

        setLoading(true);
        setProfiles([]);
        try {
            const sid = activeTab === 'student' ? studentId : '';
            const mob = activeTab === 'phone' ? phone : '';
            const response = await lookup(sid, mob);

            if (response.token) {
                navigate('/');
            } else if (response.profiles?.length) {
                setProfiles(response.profiles);
            }
        } catch (error: any) {
            if (error.message.includes('User not found')) {
                const sid = activeTab === 'student' ? studentId : '';
                const mob = activeTab === 'phone' ? phone : '';
                navigate(`/register?studentID=${sid}&mobileNo=${mob}`);
            } else {
                toast({ title: 'An error occurred', description: error.message, variant: 'destructive' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSelect = async (selectedStudentId: string) => {
        if (!selectedStudentId) return;
        setLoading(true);
        try {
            const response = await lookup(selectedStudentId, '');
            if (response.token) navigate('/');
        } catch (error: any) {
            toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleLookup(); };

    /* ═══════════════════ Render ═══════════════════ */
    return (
        <div className="min-h-screen flex flex-col lg:flex-row animate-fade-in">

            {/* ────────── LEFT: branded hero panel ────────── */}
            <div
                className="relative overflow-hidden flex-shrink-0 lg:w-[55%] xl:w-[58%] px-6 py-10 sm:px-10 sm:py-12 lg:py-0 flex flex-col justify-center"
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

                {/* ──── Glowing particle dots (pushed to edges) ──── */}
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

                {/* ──── Floating career icons (scattered, evenly distributed) ──── */}
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

                {/* ──── Compass rose decoration (bottom-right) ──── */}
                <div
                    className="absolute pointer-events-none hidden lg:block"
                    style={{ bottom: '6%', right: '4%', animation: 'loginRingSpin 40s linear infinite' }}
                >
                    <Compass className="w-28 h-28 xl:w-36 xl:h-36 text-white/[0.08]" strokeWidth={0.8} />
                </div>
                {/* Small compass (top-left corner) */}
                <div
                    className="absolute pointer-events-none hidden lg:block"
                    style={{ top: '4%', left: '3%', animation: 'loginRingSpin 25s linear infinite reverse' }}
                >
                    <Compass className="w-16 h-16 text-white/[0.06]" strokeWidth={0.7} />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-md mx-auto lg:mx-0 lg:ml-auto lg:mr-16 xl:mr-24 text-center lg:text-left">
                    {/* Brand */}
                    <div
                        className="flex items-center gap-2.5 justify-center lg:justify-start mb-6 lg:mb-10 opacity-0"
                        style={{ animation: 'loginSlideUp 0.6s ease-out 0.1s forwards', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
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
                        className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed max-w-sm mx-auto lg:mx-0 mb-8 lg:mb-10 opacity-0"
                        style={{ animation: 'loginSlideUp 0.6s ease-out 0.5s forwards' }}
                    >
                        AI-Powered Career Guidance for Students
                    </p>

                    {/* Stats badges */}
                    <div
                        className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 opacity-0"
                        style={{ animation: 'loginSlideUp 0.6s ease-out 0.7s forwards' }}
                    >
                        <div className="text-center lg:text-left">
                            <div className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                120+
                            </div>
                            <div className="text-white/60 text-xs sm:text-sm">Colleges</div>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="text-center lg:text-left">
                            <div className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                20,000+
                            </div>
                            <div className="text-white/60 text-xs sm:text-sm">Students Guided</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ────────── RIGHT: sign-in form ────────── */}
            <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-8 sm:py-12 lg:py-0 bg-background">
                <div
                    className="w-full max-w-[420px] space-y-6 opacity-0"
                    style={{ animation: 'loginFadeInRight 0.7s ease-out 0.4s forwards' }}
                >

                    {/* Heading */}
                    <div className="space-y-1">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {profiles.length > 0 ? 'Select Your Profile' : 'Welcome Back'}
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            {profiles.length > 0 ? 'Multiple profiles found — please select yours.' : 'Sign in to access your career dashboard'}
                        </p>
                    </div>

                    {/* ── Profile selector ── */}
                    {profiles.length > 0 ? (
                        <div className="space-y-3">
                            {profiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    onClick={() => handleProfileSelect(profile.studentID || '')}
                                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md cursor-pointer transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                                            {profile.name?.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5" />}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base">
                                                {profile.fullName || profile.name}
                                            </h3>
                                            <div className="text-xs text-muted-foreground flex gap-2">
                                                {profile.studentID && <span>ID: {profile.studentID}</span>}
                                                {profile.grade && <span>• Grade {profile.grade}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            ))}

                            <Button variant="ghost" className="w-full mt-2 text-sm" onClick={() => setProfiles([])}>
                                ← Back to Login
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* ── Tab switcher ── */}
                            <div className="flex rounded-xl border border-border overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('phone')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-medium transition-all ${activeTab === 'phone'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-card text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Phone className="w-4 h-4" />
                                    Phone Number
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('student')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-medium transition-all ${activeTab === 'student'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-card text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    <IdCard className="w-4 h-4" />
                                    Student ID
                                </button>
                            </div>

                            {/* ── Form ── */}
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {activeTab === 'phone' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="Enter 10-digit phone number"
                                                value={phone}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length <= 10) {
                                                        setPhone(value);
                                                        setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
                                                    }
                                                }}
                                                className={`pl-10 h-12 text-sm sm:text-base rounded-xl ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                    </div>
                                )}

                                {activeTab === 'student' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="studentId" className="text-sm font-medium">Student ID</Label>
                                        <div className="relative">
                                            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="studentId"
                                                type="text"
                                                placeholder="Enter your Student ID"
                                                value={studentId}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setStudentId(value);
                                                    setErrors(prev => ({ ...prev, studentId: validateStudentId(value) }));
                                                }}
                                                className={`pl-10 h-12 text-sm sm:text-base rounded-xl ${errors.studentId ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.studentId && <p className="text-xs text-red-500">{errors.studentId}</p>}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl text-sm sm:text-base font-semibold gap-2 gradient-primary hover:opacity-90 transition-opacity shadow-primary"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Looking up…
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-3 text-muted-foreground">or</span>
                                </div>
                            </div>

                            {/* Create account */}
                            <Button
                                variant="outline"
                                className="w-full h-11 rounded-xl text-sm font-medium"
                                onClick={() => navigate('/register')}
                            >
                                Create a New Account
                            </Button>
                        </>
                    )}

                    {/* Security */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                            Your data is secure &amp; never shared with third parties
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;