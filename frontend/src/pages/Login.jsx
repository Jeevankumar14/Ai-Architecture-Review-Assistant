import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Layers, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [view, setView] = useState('login'); // 'login' | 'forgot_password' | 'reset_password'
  
  // Shared state
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Login state
  const [password, setPassword] = useState('');
  
  // Reset state
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setSuccess('OTP has been sent to your email.');
      setView('reset_password');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Password reset successfully. You can now log in.');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setView('login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
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
        <CardHeader className="space-y-1 items-center relative">
          {view !== 'login' && (
            <button 
              onClick={() => {
                setView('login');
                setError('');
                setSuccess('');
              }}
              className="absolute left-6 top-6 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="mb-1 flex justify-center -mt-2">
            <img src="/archreviewlogo.png" alt="ArchReview Logo" className="w-24 h-24 object-contain drop-shadow-sm" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {view === 'login' ? 'ArchReview' : view === 'forgot_password' ? 'Forgot Password' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {view === 'login' ? 'Sign in to your account' : view === 'forgot_password' ? 'Enter your email to receive an OTP' : 'Enter your OTP and new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4 border border-green-200">
              {success}
            </div>
          )}

          {view === 'login' && (
            <>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setError('');
                        setSuccess('');
                        setView('forgot_password');
                      }} 
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      defaultChecked
                    />
                    <label htmlFor="remember" className="text-xs font-semibold text-slate-500 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

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

          {view === 'forgot_password' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input 
                  id="reset-email" 
                  type="email" 
                  placeholder="m@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {view === 'reset_password' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit OTP Code</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          )}
          
        </CardContent>
      </Card>
    </div>
  );
}
