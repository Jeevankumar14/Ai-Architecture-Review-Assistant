import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Layers, MailCheck, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Success
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await register({ name, email, password });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await verifyOtp(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 items-center">
          <div className="mb-1 flex justify-center -mt-2">
            {step === 1 ? <img src="/archreviewlogo.png" alt="ArchReview Logo" className="w-24 h-24 object-contain drop-shadow-sm" /> : 
             step === 2 ? <div className="bg-primary/10 p-3 rounded-full mt-2 mb-1"><MailCheck className="w-8 h-8 text-primary" /></div> :
             <div className="bg-primary/10 p-3 rounded-full mt-2 mb-1"><CheckCircle2 className="w-8 h-8 text-green-500" /></div>}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {step === 1 ? 'Create an account' : 
             step === 2 ? 'Verify your email' :
             'Account Verified!'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? 'Get started with AI software architecture reviews' : 
             step === 2 ? `We sent a 6-digit code to ${email}. It expires in 5 minutes.` :
             'Your email has been successfully verified.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {step === 1 && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input 
                  id="otp" 
                  placeholder="123456" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="text-center text-lg tracking-[0.5em]"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Didn't receive the code?{' '}
                <button 
                  type="button" 
                  onClick={handleRegisterSubmit}
                  className="text-primary hover:underline"
                  disabled={isLoading}
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link to="/login">Login Now</Link>
              </Button>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin}>
                <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
            </>
          )}

          {step !== 3 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
