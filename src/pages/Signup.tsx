import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Phone, User,
  CheckCircle, AlertCircle, Loader2, Shield, Building,
  Smartphone, X, UserCheck, Upload
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// Status Modal Component (unchanged – keep as is)
const StatusModal: React.FC<{ isOpen: boolean; onClose: () => void; email: string; type: 'already_registered' | 'new_user_success'; redirectSeconds: number; }> = ({ isOpen, onClose, email, type, redirectSeconds }) => {
  if (!isOpen) return null;
  const isAlreadyRegistered = type === 'already_registered';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-center mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isAlreadyRegistered ? 'bg-blue-100 border-blue-200' : 'bg-green-100 border-green-200'}`}>
              {isAlreadyRegistered ? <UserCheck className="text-blue-600" size={24} /> : <CheckCircle className="text-green-600" size={24} />}
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center">
            {isAlreadyRegistered ? 'Account Already Registered' : 'Check Your Email!'}
          </h3>
        </div>
        <div className="p-4">
          <div className="text-center mb-4">
            {isAlreadyRegistered ? (
              <>
                <p className="text-gray-600 mb-2 text-sm">An account with email <span className="font-semibold text-blue-600">{email}</span> already exists.</p>
                <p className="text-gray-600 text-sm">Redirecting you to login...</p>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-2 text-sm">A verification link has been sent to:</p>
                <p className="font-semibold text-blue-600 text-base mb-3">{email}</p>
                <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-700 mb-1"><span className="font-semibold">📧 Check your inbox or spam folder</span> for an email titled <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">"Greater Kano Business Council Registeration"</span></p>
                  <p className="text-xs text-gray-700 mb-1"><span className="font-semibold">🔗 Click the link</span> to verify your email. You'll be redirected to login.</p>
                  <p className="text-xs text-gray-700 mb-1"><span className="font-semibold">⏱️ Link expires in 10 minutes.</span> Sometimes emails take a little longer to arrive.</p>
                  <p className="text-xs text-gray-700"><span className="font-semibold">⚠️ Be patient</span> before trying to sign up again.</p>
                  <p className="text-xs text-gray-700"><span className="font-semibold">Verified User?</span> After verification, you will be prompted to complete your application.</p>
                </div>
              </>
            )}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">{isAlreadyRegistered ? 'Redirecting to login...' : 'Redirecting in...'}</span>
              <span className="text-xs font-medium text-blue-600">{redirectSeconds}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${isAlreadyRegistered ? 'bg-blue-500' : 'bg-green-500'}`} style={{ width: `${100 - (redirectSeconds / (isAlreadyRegistered ? 4 : 10) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', agreeToTerms: false,
  });
  const [userType, setUserType] = useState<'regular' | 'verified'>('regular');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isStoringReceipt, setIsStoringReceipt] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalType, setModalType] = useState<'already_registered' | 'new_user_success'>('new_user_success');
  const [redirectSeconds, setRedirectSeconds] = useState(10);
  const [modalEmail, setModalEmail] = useState('');

  // Validation helpers (unchanged – keep from your original)
  const validateNigerianPhone = (phone: string): boolean => { /* ... */ return true; };
  const validateForm = (): boolean => { /* ... */ return true; };
  const checkUserExists = async (email: string): Promise<boolean> => { /* ... */ return false; };
  const createNewUser = async (): Promise<{ user: any; session: any }> => { /* ... */ return { user: null, session: null }; };
  const handleInputChange = (field: keyof FormData, value: string | boolean) => { /* ... */ };

  // Store receipt in localStorage for later processing
  const storePendingVerification = (userId: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64data = reader.result as string;
          localStorage.setItem('pendingVerification', JSON.stringify({
            userId,
            receiptData: base64data,
            fileName: file.name,
            fileType: file.type,
          }));
          resolve();
        } catch (err) {
          reject(new Error('Failed to store receipt locally.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read receipt file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (userType === 'verified' && !receiptFile) {
      setValidationErrors(prev => ({ ...prev, receipt: 'Please upload your payment receipt' }));
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const email = formData.email.trim();
      const userExists = await checkUserExists(email);

      if (userExists) {
        setModalEmail(email);
        setModalType('already_registered');
        setRedirectSeconds(3);
        setShowStatusModal(true);
        const countdown = setInterval(() => {
          setRedirectSeconds(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              navigate('/login', { state: { prefilledEmail: email } });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        const { user } = await createNewUser();

        if (userType === 'verified' && user && receiptFile) {
          setIsStoringReceipt(true);
          try {
            await storePendingVerification(user.id, receiptFile);
          } catch (storageError: any) {
            setServerError(storageError.message || 'Failed to store receipt. Your account was created, but please contact support.');
          } finally {
            setIsStoringReceipt(false);
          }
        }

        setModalEmail(email);
        setModalType('new_user_success');
        setRedirectSeconds(10);
        setShowStatusModal(true);

        const countdown = setInterval(() => {
          setRedirectSeconds(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              // 👇 Pass messageType: 'success' so login shows it in blue
              navigate('/login', {
                state: {
                  message: userType === 'verified'
                    ? 'Your account was created. After email verification, please log in to complete your verification request.'
                    : 'Please check your email to verify your account',
                  email,
                  messageType: 'success',
                },
              });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      let userMessage = error.message || 'Registration failed. Please try again.';
      if (error.message?.includes('already registered')) userMessage = 'This email is already registered. Please try logging in.';
      else if (error.message?.includes('rate limit')) userMessage = 'Too many attempts. Please wait a few minutes before trying again.';
      else if (error.message?.includes('network')) userMessage = 'Network error. Please check your connection and try again.';
      setServerError(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusModal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} email={modalEmail} type={modalType} redirectSeconds={redirectSeconds} />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col justify-center items-center px-3 py-6 safe-area overflow-x-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-600/10 to-transparent" />
        <div className="absolute top-1/4 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-12 w-48 h-48 bg-indigo-400/5 rounded-full blur-3xl" />
        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center mb-6">{/* Header – same as before */}</div>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/80 overflow-hidden mb-4">
            <div className="p-4">
              {serverError && ( /* server error display – same as before */ )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name, Email, Phone – same as before */}
                {/* User Type Selection – same as before */}
                {/* Verified User Fields – same as before */}
                {/* Password fields – same as before */}
                {/* Terms – same as before */}
                <button
                  type="submit"
                  disabled={isLoading || isStoringReceipt}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {isLoading || isStoringReceipt ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">{isStoringReceipt ? 'Saving...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">Create Account</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
              <div className="flex items-center my-4">{/* divider – same */}</div>
              <button onClick={() => navigate('/login')} className="w-full border border-gray-300 text-gray-700 font-bold py-2.5 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 min-h-[44px]">Sign In Instead</button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 p-3">{/* security footer – same */}</div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
