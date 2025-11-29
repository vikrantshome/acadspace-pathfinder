/**
 * Sign Up Page - separate URL for full signup + Student ID / Phone OTP flow
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';

const maskPhone = (p?: string | null) => {
  if (!p) return '';
  const cleaned = p.replace(/\D/g, '');
  if (cleaned.length <= 4) return cleaned;
  const last = cleaned.slice(-4);
  return `****${last}`;
};

const SignUp: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [lookupPhone, setLookupPhone] = useState<string | null>(null);

  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [activeTab, setActiveTab] = useState<'student' | 'phone'>('student');
  const [stage, setStage] = useState<'input' | 'otp'>('input');

  const [resendTimer, setResendTimer] = useState<number>(0);
  const [resendVisible, setResendVisible] = useState<boolean>(false);

  const sendOtp = async (targetPhone?: string) => {
    const p = targetPhone ?? phone ?? lookupPhone;
    if (!p) {
      toast({ title: 'Enter phone', description: 'Please provide a phone number', variant: 'destructive' });
      return;
    }

    try {
      setResendVisible(false);
      setResendTimer(30);

      const data = await apiService.sendOtp({ phone: p });
      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to send OTP');
      }

      toast({ title: 'OTP sent', description: `OTP sent to ${maskPhone(p)}` });
    } catch (err: any) {
      setResendTimer(0);
      toast({ title: 'Send OTP failed', description: err?.message || String(err), variant: 'destructive' });
    }
  };

  const verifyOtp = async () => {
    const p = lookupPhone ?? phone;
    if (!p) return toast({ title: 'No phone', variant: 'destructive' });
    if (!otp) return toast({ title: 'Enter OTP', variant: 'destructive' });

    try {
      setVerifyingOtp(true);
      const data = await apiService.verifyOtp({ phone: p, otp });
      if (data?.success) {
        toast({ title: 'Phone verified' });
        await completeSignup();
      } else {
        toast({ title: 'Invalid OTP', description: data?.message || 'Invalid OTP', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Verify failed', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const lookupAndContinue = async () => {
    if (!studentId) return toast({ title: 'Enter Student ID', variant: 'destructive' });
    try {
      const res = await fetch('/api/student/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => 'lookup failed');
        throw new Error(txt || 'Lookup failed');
      }
      const data = await res.json();
      if (!data?.phone) throw new Error('No phone found for this Student ID');

      setLookupPhone(data.phone);
      setPhone(data.phone);

      await sendOtp(data.phone);
      setStage('otp');
    } catch (err: any) {
      toast({ title: 'Lookup failed', description: err?.message || String(err), variant: 'destructive' });
    }
  };

  const sendPhoneAndContinue = async () => {
    if (!phone) return toast({ title: 'Enter phone', variant: 'destructive' });
    await sendOtp(phone);
    setLookupPhone(phone);
    setStage('otp');
  };

  const completeSignup = async () => {
    setLoading(true);
    try {
      const nameValue = studentId || lookupPhone || phone || 'user';
      const generatedEmail = `${(nameValue as string).toString().replace(/[^a-zA-Z0-9]/g, '')}@naviksha.local`;
      const generatedPassword = Math.random().toString(36).slice(-12) + 'A1!';

      await signUp(generatedEmail, generatedPassword, nameValue);
      navigate('/');
    } catch (err: any) {
      console.error('signup error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!lookupPhone && !phone) return;
    setOtp('');
    await sendOtp(lookupPhone ?? phone ?? undefined);
  };

  useEffect(() => {
    let t: number | undefined;
    if (resendTimer > 0) {
      t = window.setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setResendVisible(true);
    }
    return () => { if (t) window.clearTimeout(t); };
  }, [resendTimer]);

  const tabsDisabled = stage === 'otp';

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-lg mx-auto flex items-center justify-center mb-3 md:mb-4">
            <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Sign Up</h1>
          <p className="text-sm md:text-base text-white/80 px-2">Navigate Your Future with AI-Powered Career Guidance</p>
        </div>

        <Card className="glass border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg md:text-xl text-center">Sign Up</CardTitle>

            {stage !== 'otp' && (
              <div className="flex justify-center mt-3">
                <div className="inline-flex bg-white/5 rounded-full p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => !tabsDisabled && setActiveTab('student')}
                    disabled={tabsDisabled}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'student' ? 'bg-white text-black' : 'bg-transparent text-black hover:bg-white/10'}`}
                  >
                    Student ID
                  </button>
                  <button
                    type="button"
                    onClick={() => !tabsDisabled && setActiveTab('phone')}
                    disabled={tabsDisabled}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'phone' ? 'bg-white text-black' : 'bg-transparent text-black hover:bg-white/10'}`}
                  >
                    Phone
                  </button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="px-4 md:px-6">
            {stage === 'input' && (
              <form className="space-y-3 md:space-y-4" onSubmit={(e) => e.preventDefault()}>
                {activeTab === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input id="studentId" type="text" placeholder="Enter student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={lookupAndContinue} className="w-full">Continue</Button>
                    </div>
                  </div>
                )}

                {activeTab === 'phone' && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+91xxxxxxxxxx" value={phone} onChange={(e) => { setPhone(e.target.value); setOtp(''); }} />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={sendPhoneAndContinue} className="w-full">Send OTP & Continue</Button>
                    </div>
                  </div>
                )}
              </form>
            )}

            {stage === 'otp' && (
              <div className="space-y-4">
                <p className="text-sm text-foreground">We sent an OTP to <strong className="font-semibold text-foreground">{maskPhone(lookupPhone ?? phone)}</strong></p>

                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={(v: string) => setOtp(v)} autoFocus>
                      <InputOTPGroup className="justify-center">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} className="w-10 h-10" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {resendVisible ? (
                      <Button variant="ghost" onClick={handleResend}>Resend OTP</Button>
                    ) : (
                      <p className="text-sm text-white/60">Resend available in {resendTimer}s</p>
                    )}
                  </div>
                  <div>
                    <Button onClick={verifyOtp} disabled={verifyingOtp}>
                      {verifyingOtp ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</>) : 'Submit'}
                    </Button>
                  </div>
                </div>

                {/* verification feedback shown via toast and redirect */}
              </div>
            )}

          </CardContent>
        </Card>

        <div className="text-center px-2">
          <p className="text-white/60 text-xs leading-relaxed">By creating an account, you agree to our privacy practices. Your data is secure and never shared with third parties.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
