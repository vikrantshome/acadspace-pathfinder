/**
 * Sign Up Page - simplified without OTP flow
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';

const Login: React.FC = () => {
    const { lookup } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [phone, setPhone] = useState('');
    const [activeTab, setActiveTab] = useState<'student' | 'phone'>('phone');
    const [errors, setErrors] = useState({ phone: '', studentId: '' });

    const validatePhone = (value: string) => {
        if (value.length === 0) {
            return '';
        }
        if (!/^\d+$/.test(value)) {
            return 'Phone number must contain only digits';
        }
        if (value.length !== 10) {
            return 'Phone number must be exactly 10 digits';
        }
        return '';
    };

    const validateStudentId = (value: string) => {
        if (value.length === 0) {
            return '';
        }
        if (!/^[a-zA-Z0-9]+$/.test(value)) {
            return 'Student ID must contain only letters and numbers';
        }
        if (value.length !== 6) {
            return 'Student ID must be exactly 6 characters';
        }
        return '';
    };

    const handleLookup = async () => {
        // Validate based on active tab
        if (activeTab === 'phone') {
            const phoneError = validatePhone(phone);
            if (phoneError) {
                setErrors({ ...errors, phone: phoneError });
                return;
            }
        } else {
            const studentIdError = validateStudentId(studentId);
            if (studentIdError) {
                setErrors({ ...errors, studentId: studentIdError });
                return;
            }
        }

        setLoading(true);
        try {
            const studentID = activeTab === 'student' ? studentId : '';
            const mobileNo = activeTab === 'phone' ? phone : '';
            await lookup(studentID, mobileNo);
            navigate('/');
        } catch (error: any) {
            if (error.message.includes('User not found')) {
                const studentID = activeTab === 'student' ? studentId : '';
                const mobileNo = activeTab === 'phone' ? phone : '';
                navigate(`/register?studentID=${studentID}&mobileNo=${mobileNo}`);
            } else {
                toast({
                    title: 'An error occurred',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLookup();
    };

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-lg mx-auto flex items-center justify-center mb-3 md:mb-4">
                        <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Sign In</h1>
                    <p className="text-sm md:text-base text-white/80 px-2">Navigate Your Future with AI-Powered Career Guidance</p>
                </div>

                <Card className="glass border-0 shadow-2xl">

                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-lg md:text-xl text-center">Sign In</CardTitle>

                        <div className="flex justify-center mt-3">
                            <div className="inline-flex bg-white/5 rounded-full p-1 gap-1 flex-nowrap">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('phone')}
                                    className={`px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border-2 whitespace-nowrap ${activeTab === 'phone' ? 'bg-white text-black border-primary' : 'bg-transparent text-black border-white/20 hover:bg-white/10 hover:border-white/40'}`}
                                >
                                    Login using phone number
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('student')}
                                    className={`px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border-2 whitespace-nowrap ${activeTab === 'student' ? 'bg-white text-black border-primary' : 'bg-transparent text-black border-white/20 hover:bg-white/10 hover:border-white/40'}`}
                                >
                                    Login using 6-char code
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-4 md:px-6">
                        <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
                            {activeTab === 'phone' && (
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="text"
                                        placeholder="Enter 10-digit phone number"
                                        value={phone}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length <= 10) {
                                                setPhone(value);
                                                const error = validatePhone(value);
                                                setErrors({ ...errors, phone: error });
                                            }
                                        }}
                                        className={errors.phone ? 'border-red-500' : ''}
                                    />
                                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                </div>
                            )}

                            {activeTab === 'student' && (
                                <div className="space-y-2">
                                    <Label htmlFor="studentId">Student ID (6-character code)</Label>
                                    <Input
                                        id="studentId"
                                        type="text"
                                        placeholder="Enter your 6-character student ID"
                                        value={studentId}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length <= 6) {
                                                setStudentId(value);
                                                const error = validateStudentId(value);
                                                setErrors({ ...errors, studentId: error });
                                            }
                                        }}
                                        className={errors.studentId ? 'border-red-500' : ''}
                                    />
                                    {errors.studentId && <p className="text-xs text-red-500">{errors.studentId}</p>}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full mt-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Looking up...
                                    </>
                                ) : (
                                    'Continue'
                                )}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Button
                                    variant="link"
                                    onClick={() => navigate('/register')}
                                    className="p-0 text-primary font-semibold"
                                >
                                    Create Account
                                </Button>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center px-2">
                    <p className="text-white/60 text-xs leading-relaxed">
                        By creating an account, you agree to our privacy practices. Your data is secure and never shared with third parties.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;