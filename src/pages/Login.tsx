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
interface LoginProps {
    onSwitchMode?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchMode }) => {
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
                if (onSwitchMode) {
                    onSwitchMode();
                } else {
                    navigate(`/register?studentID=${sid}&mobileNo=${mob}`);
                }
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
        <div className="w-full flex items-center justify-center px-4 py-5 sm:p-6 md:p-8 h-full bg-background animate-fade-in">
            <div className="w-full max-w-[420px] space-y-4 sm:space-y-6">

                {/* Heading */}
                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
                                            className={`pl-10 h-10 sm:h-12 text-sm sm:text-base rounded-xl ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                                            className={`pl-10 h-10 sm:h-12 text-sm sm:text-base rounded-xl ${errors.studentId ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.studentId && <p className="text-xs text-red-500">{errors.studentId}</p>}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-10 sm:h-12 rounded-xl text-sm sm:text-base font-semibold gap-2 gradient-primary hover:opacity-90 transition-opacity shadow-primary"
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
                            type="button"
                            onClick={() => {
                                if (onSwitchMode) onSwitchMode();
                                else navigate('/register');
                            }}
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
    );
};

export default Login;