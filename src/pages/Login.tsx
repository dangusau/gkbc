import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle,
  Shield, Smartphone, Building, CheckCircle, UserX, X
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface LoginFormData {
  email: string;
  password: string;
}

// LoginStatusModal – same as before (keep unchanged)
const LoginStatusModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  email: string;
  status: 'unverified' | 'banned' | 'no_account' | 'credentials_incorrect';
  onSignupClick: () => void;
  onTryAgain?: () => void;
  onForgotPassword?: () => void;
}> = ({ isOpen, onClose, email, status, onSignupClick, onTryAgain, onForgotPassword }) => {
  if (!isOpen) return null;
  // ... same as before (no changes needed)
  return <div>{/* ... */}</div>;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = (location.state as any)?.prefilledEmail || '';

  const [formData, setFormData] = useState<LoginFormData>({
    email: prefilledEmail,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Separate state for UI messages
  const [message, setMessage] = useState<string | null>((location.state as any)?.message || null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>((location.state as any)?.messageType || null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'unverified' | 'banned' | 'no_account' | 'credentials_incorrect'>('credentials_incorrect');

  // Clear message on input change
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  // Modal handlers (same as before)
  const handleModalClose = () => { /* ... */ };
  const handleSignupFromModal = () => { /* ... */ };
  const handleTryAgain = () => { /* ... */ };
  const handleForgotPassword = () => { /* ... */ };
  const handleResendVerification = async () => { /* ... */ };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      setMessage('Please enter both email and password');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const email = formData.email.trim();
      const password = formData.password.trim();

      // 1. Sign in with password (Supabase official pattern [citation:9])
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          // Check if email exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email.toLowerCase())
            .maybeSingle();

          if (!existingProfile) {
            setLoginStatus('no_account');
            setShowStatusModal(true);
          } else {
            setLoginStatus('credentials_incorrect');
            setShowStatusModal(true);
          }
        } else if (authError.message.includes('Email not confirmed')) {
          setLoginStatus('unverified');
          setShowStatusModal(true);
        } else {
          setMessage(authError.message);
          setMessageType('error');
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setMessage('Authentication failed. Please try again.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      // 2. Check email confirmation
      if (!authData.user.email_confirmed_at) {
        setLoginStatus('unverified');
        setShowStatusModal(true);
        setIsLoading(false);
        return;
      }

      // 3. Get profile to check user_status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_status')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        setMessage('Account error. Please contact support.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      if (profile?.user_status === 'banned') {
        setLoginStatus('banned');
        setShowStatusModal(true);
        setIsLoading(false);
        return;
      }

      // 4. Small delay for session propagation (fixes RLS issues)
      await new Promise(resolve => setTimeout(resolve, 100));

      // 5. Process any pending verification request (deferred upload)
      const pending = localStorage.getItem('pendingVerification');
      if (pending) {
        try {
          const { userId, receiptData, fileName, fileType } = JSON.parse(pending);
          if (userId === authData.user.id) {
            // Convert base64 to File
            const response = await fetch(receiptData);
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: fileType });

            // Upload to storage (policy now allows this)
            const fileExt = fileName.split('.').pop() || 'jpg';
            const newFileName = `receipt-${userId}-${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${newFileName}`;

            const { error: uploadError } = await supabase.storage
              .from('verification-receipts')
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from('verification-receipts')
              .getPublicUrl(filePath);
            const receiptUrl = urlData.publicUrl;

            const { error: insertError } = await supabase
              .from('verified_user_requests')
              .insert({
                user_id: userId,
                receipt_url: receiptUrl,
                status: 'pending',
                created_at: new Date().toISOString(),
              });

            if (insertError) throw insertError;

            localStorage.removeItem('pendingVerification');
            setMessage('Verification request submitted successfully!');
            setMessageType('success');
          } else {
            localStorage.removeItem('pendingVerification');
          }
        } catch (err: any) {
          console.error('Failed to process pending verification:', err);
          setMessage('Your verification request could not be submitted. Please contact support.');
          setMessageType('error');
        }
      }

      // 6. Trigger background tasks (RSVP reminders) – don't await
      supabase.rpc('check_rsvp_reminders').then(({ error }) => {
        if (error) console.error('RSVP reminder check failed:', error);
      });

      // 7. Navigate to home
      navigate('/Home');
    } catch (err: any) {
      console.error('Login error:', err);
      setMessage(err.message || 'Login failed. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoginStatusModal
        isOpen={showStatusModal}
        onClose={handleModalClose}
        email={formData.email}
        status={loginStatus}
        onSignupClick={handleSignupFromModal}
        onTryAgain={loginStatus === 'unverified' ? handleResendVerification : handleTryAgain}
        onForgotPassword={handleForgotPassword}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col justify-center items-center px-3 relative overflow-hidden safe-area">
        {/* Background elements – same as before */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-600/10 to-transparent" />
        <div className="absolute top-1/4 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-12 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10">
          {/* Header – same as before */}
          <div className="flex flex-col items-center mb-6">{/* ... */}</div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/80 overflow-hidden mb-4">
            <div className="p-4">
              {/* Dynamic message banner – success in blue, error in red */}
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  messageType === 'success'
                    ? 'bg-blue-50 border border-blue-100'
                    : 'bg-red-50 border border-red-100'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      {messageType === 'success' ? (
                        <CheckCircle className="text-blue-600" size={16} />
                      ) : (
                        <AlertCircle className="text-red-600" size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-xs ${
                        messageType === 'success' ? 'text-blue-800' : 'text-red-800'
                      }`}>
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email field – same */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700 pl-1">Email Address *</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center">
                      <Mail className="text-gray-400" size={16} />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password field – same */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between pl-1">
                    <label className="block text-xs font-medium text-gray-700">Password *</label>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center">
                      <Lock className="text-gray-400" size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center">
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-2.5 rounded-lg hover:shadow hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer links – same */}
              <div className="mt-4 space-y-2">
                <button onClick={() => navigate('/Signup')} className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-xs py-2 rounded-md hover:bg-blue-50 transition-colors">
                  Don't have an account? Sign Up
                </button>
                <button onClick={() => navigate('/forgot-password')} className="w-full text-center text-gray-500 hover:text-gray-700 text-xs py-2 rounded-md hover:bg-gray-50 transition-colors">
                  Forgot your password?
                </button>
              </div>
            </div>
          </div>

          {/* Security footer – same */}
          <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 p-3">
            <div className="flex items-center justify-center gap-4">{/* ... */}</div>
          </div>
          <div className="text-center mt-3">
            <p className="text-xs text-gray-400">GKBC Network v1.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
