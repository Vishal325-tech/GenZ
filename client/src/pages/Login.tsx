import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Phone, Key, Chrome, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, requestOTP, loginWithOTP } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'otp'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [emailOrPhoneError, setEmailOrPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP Verification logic inside registration
  const [verifyingContact, setVerifyingContact] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [regOtp, setRegOtp] = useState('');
  const [regOtpError, setRegOtpError] = useState('');

  // Save Password dialog popup
  const [showSavePasswordPrompt, setShowSavePasswordPrompt] = useState(false);

  // OTP Login fields (Unified Email/Phone)
  const [otpEmailOrPhone, setOtpEmailOrPhone] = useState('');
  const [otpEmailOrPhoneError, setOtpEmailOrPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validates email or Indian mobile number
  const validateEmailOrPhoneString = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Indian Mobile Number pattern: matches optional +91 or 0, followed by 6-9 and then 9 digits
    const indianPhoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    return emailRegex.test(val) || indianPhoneRegex.test(val);
  };

  const handleEmailOrPhoneChange = (val: string) => {
    setEmailOrPhone(val);
    setIsVerified(false);
    setVerifyingContact(false);
    setRegOtp('');
    setRegOtpError('');

    if (!val) {
      setEmailOrPhoneError('');
    } else if (validateEmailOrPhoneString(val)) {
      setEmailOrPhoneError('');
    } else {
      setEmailOrPhoneError('Invalid Email Address or Indian Mobile Number.');
    }
  };

  const handleOtpEmailOrPhoneChange = (val: string) => {
    setOtpEmailOrPhone(val);
    setOtpSent(false);
    setOtp('');

    if (!val) {
      setOtpEmailOrPhoneError('');
    } else if (validateEmailOrPhoneString(val)) {
      setOtpEmailOrPhoneError('');
    } else {
      setOtpEmailOrPhoneError('Invalid Email Address or Indian Mobile Number.');
    }
  };

  const handleVerifyContactClick = () => {
    if (emailOrPhoneError || !emailOrPhone) return;
    setVerifyingContact(true);
    setRegOtpError('');
  };

  const handleConfirmVerifyContact = (e: React.MouseEvent) => {
    e.preventDefault();
    setRegOtpError('');
    if (regOtp === '123456') {
      setIsVerified(true);
      setVerifyingContact(false);
      setRegOtp('');
    } else {
      setRegOtpError('Invalid OTP. Use mock code 123456.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      // Ask to save password in Google after successful login
      setShowSavePasswordPrompt(true);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !emailOrPhone || !password || !confirmPassword) {
      setError('Please provide all details to register.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isVerified) {
      setError('Please verify your Email or Indian Mobile Number first.');
      return;
    }

    setLoading(true);
    try {
      const isEmail = emailOrPhone.includes('@');
      const finalEmail = isEmail ? emailOrPhone : `${emailOrPhone}@royalhampers.com`;
      const finalPhone = isEmail ? '' : emailOrPhone;

      await register(name, finalEmail, password, finalPhone);
      setLoading(false);
      setShowSavePasswordPrompt(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  const handleSavePasswordConfirm = (save: boolean) => {
    setShowSavePasswordPrompt(false);
    const finalEmail = emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@royalhampers.com`;
    const targetEmail = mode === 'login' ? loginEmail : finalEmail;
    const targetPassword = mode === 'login' ? loginPassword : password;

    if (save && (window as any).PasswordCredential) {
      try {
        const cred = new (window as any).PasswordCredential({
          id: targetEmail,
          password: targetPassword,
          name: name || targetEmail
        });
        navigator.credentials.store(cred)
          .then(() => {
            navigate('/account');
            window.location.reload();
          })
          .catch(() => {
            navigate('/account');
            window.location.reload();
          });
      } catch (err) {
        console.error('Credential storage error:', err);
        navigate('/account');
        window.location.reload();
      }
    } else {
      navigate('/account');
      window.location.reload();
    }
  };

  // OTP Login triggers request
  const handleSendOTP = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!otpEmailOrPhone || otpEmailOrPhoneError) {
      setError('Please provide a valid email or mobile number first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const isEmail = otpEmailOrPhone.includes('@');
      const finalEmail = isEmail ? otpEmailOrPhone : `${otpEmailOrPhone}@royalhampers.com`;

      await requestOTP(finalEmail);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isEmail = otpEmailOrPhone.includes('@');
      const finalEmail = isEmail ? otpEmailOrPhone : `${otpEmailOrPhone}@royalhampers.com`;

      await loginWithOTP(finalEmail, otp);
      navigate('/account');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Try using code 123456.');
    } finally {
      setLoading(false);
    }
  };

  // Google genuine authentication simulator utilizing database auto-create verify-otp
  const handleSocialLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'google.customer@royalhampers.com', otp: '123456' })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('gift_movers_token', data.token);
        // Ask to save password in Google after successful authenticating
        setShowSavePasswordPrompt(true);
      } else {
        setError(data.message || 'Google Auth failed');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to authenticate via Google');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 min-h-[80vh] flex flex-col justify-center">
      <div className="bg-white dark:bg-luxury-black-soft border border-luxury-gold/35 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Logo Text */}
        <div className="text-center space-y-1">
          <h2 className="font-serif text-xl font-bold tracking-wider text-luxury-red dark:text-luxury-gold">
            GAJANANA ROYAL HAMPERS
          </h2>
          <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest">
            Luxury Celebration & Hampers
          </p>
        </div>

        {error && (
          <p className="text-xs text-luxury-red text-center font-semibold bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-500/10">
            {error}
          </p>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-luxury-black-soft/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3.5">
            <div className="w-9 h-9 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[11px] font-bold text-luxury-gold tracking-wide animate-pulse">Processing details...</p>
          </div>
        )}

        {/* Form selection tabs */}
        <div className="flex border-b border-luxury-gold/15 pb-1">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`w-1/3 pb-2 text-xs font-bold uppercase text-center ${
              mode === 'login' ? 'text-luxury-red border-b-2 border-luxury-red' : 'text-neutral-400'
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`w-1/3 pb-2 text-xs font-bold uppercase text-center ${
              mode === 'register' ? 'text-luxury-red border-b-2 border-luxury-red' : 'text-neutral-400'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setMode('otp'); setError(''); }}
            className={`w-1/3 pb-2 text-xs font-bold uppercase text-center ${
              mode === 'otp' ? 'text-luxury-red border-b-2 border-luxury-red' : 'text-neutral-400'
            }`}
          >
            OTP Login
          </button>
        </div>

        {/* Form: Email Password Login */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-3.5">
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-xs bg-white dark:bg-luxury-black-soft text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
                />
                <Mail className="absolute left-3 h-4 w-4 text-luxury-gold" />
              </div>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-xs bg-white dark:bg-luxury-black-soft text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
                />
                <Lock className="absolute left-3 h-4 w-4 text-luxury-gold" />
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => alert('Demo Feature: Register or use OTP code 123456.')}
                className="text-[10px] text-neutral-400 hover:text-luxury-red font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-luxury-red hover:bg-luxury-red-dark text-white rounded-lg text-xs uppercase font-bold tracking-widest shadow-md"
            >
              Sign In
            </button>
          </form>
        )}

        {/* Form: Register */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-xs bg-white dark:bg-luxury-black-soft text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
              />
              
              {/* Merged Email and Phone section */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Email or Indian Mobile Number"
                    value={emailOrPhone}
                    onChange={(e) => handleEmailOrPhoneChange(e.target.value)}
                    className="w-full pl-10 pr-20 py-2 border rounded-lg text-xs bg-white dark:bg-luxury-black-soft text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
                  />
                  <Phone className="absolute left-3.5 h-4 w-4 text-luxury-gold" />
                  
                  {/* Little verify button */}
                  <button
                    type="button"
                    disabled={!!emailOrPhoneError || !emailOrPhone || isVerified}
                    onClick={handleVerifyContactClick}
                    className={`absolute right-2 px-2.5 py-1 text-[9px] font-bold uppercase rounded-md tracking-wide transition-all ${
                      isVerified 
                        ? 'bg-green-100 text-green-700 border border-green-300 cursor-default' 
                        : emailOrPhoneError || !emailOrPhone
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          : 'bg-luxury-gold hover:bg-luxury-gold-hover text-luxury-black shadow-sm'
                    }`}
                  >
                    {isVerified ? (
                      <span className="flex items-center gap-0.5"><Check className="h-2.5 w-2.5" /> Verified</span>
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
                
                {/* On-the-fly validation error display */}
                {emailOrPhone && emailOrPhoneError && (
                  <p className="text-[9px] text-luxury-red font-semibold pl-1.5">{emailOrPhoneError}</p>
                )}
                {isVerified && (
                  <p className="text-[9px] text-green-600 font-semibold pl-1.5 flex items-center gap-0.5">✓ Contact verified genuine.</p>
                )}
              </div>

              {/* Inline OTP input section for verify purpose */}
              {verifyingContact && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-luxury-gold/30 rounded-xl space-y-2 animate-scaleUp">
                  <p className="text-[10px] text-green-600 font-semibold leading-relaxed">
                    OTP code simulated. Use code <span className="font-bold text-luxury-gold font-mono">123456</span> to verify.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-Digit OTP"
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value)}
                      className="w-full text-center tracking-widest font-mono p-1.5 border rounded-lg text-xs bg-white dark:bg-luxury-black-soft text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmVerifyContact}
                      className="bg-luxury-red hover:bg-luxury-red-dark text-white px-3.5 py-1 rounded-lg text-xs font-bold uppercase shrink-0"
                    >
                      Confirm
                    </button>
                  </div>
                  {regOtpError && <p className="text-[9px] text-luxury-red font-semibold">{regOtpError}</p>}
                </div>
              )}

              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-xs bg-white dark:bg-luxury-black-soft text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
                />
                <Lock className="absolute left-3.5 h-4 w-4 text-luxury-gold" />
              </div>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-xs bg-white dark:bg-luxury-black-soft text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
                />
                <Lock className="absolute left-3.5 h-4 w-4 text-luxury-gold" />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isVerified}
              className={`w-full py-2.5 text-xs uppercase font-bold tracking-widest rounded-lg transition-all shadow-md ${
                isVerified 
                  ? 'bg-luxury-red hover:bg-luxury-red-dark text-white cursor-pointer' 
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              Register & Sign In
            </button>
          </form>
        )}

        {/* Form: OTP verification login */}
        {mode === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="space-y-3.5">
              {/* Unified Email/Mobile for OTP Login */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Email or Indian Mobile Number"
                    value={otpEmailOrPhone}
                    onChange={(e) => handleOtpEmailOrPhoneChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-xs bg-white dark:bg-luxury-black-soft text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
                  />
                  <Phone className="absolute left-3.5 h-4 w-4 text-luxury-gold" />
                </div>
                
                {otpEmailOrPhone && otpEmailOrPhoneError && (
                  <p className="text-[9px] text-luxury-red font-semibold pl-1.5">{otpEmailOrPhoneError}</p>
                )}
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  disabled={!!otpEmailOrPhoneError || !otpEmailOrPhone}
                  onClick={handleSendOTP}
                  className={`w-full py-2.5 rounded text-xs font-bold transition-all ${
                    otpEmailOrPhoneError || !otpEmailOrPhone
                      ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                      : 'bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black cursor-pointer shadow-sm'
                  }`}
                >
                  Send OTP Code
                </button>
              ) : (
                <div className="space-y-3 animate-scaleUp">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-green-600 font-semibold bg-green-50 dark:bg-green-950/20 p-2.5 rounded-lg border border-green-500/10">
                      OTP code simulated. Use code <span className="font-bold text-luxury-gold font-mono">123456</span> to complete.
                    </p>
                  </div>
                  
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="6-digit Verification Code (123456)"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg text-xs tracking-widest font-bold bg-white dark:bg-luxury-black-soft text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
                    />
                    <Key className="absolute left-3.5 h-4 w-4 text-luxury-gold" />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-luxury-red hover:bg-luxury-red-dark text-white rounded-lg text-xs uppercase font-bold tracking-widest"
                  >
                    Verify & Login
                  </button>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Divider & Social Logins */}
        <div className="space-y-4 pt-4 border-t border-luxury-gold/15">
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-luxury-black-soft px-3 text-neutral-400 font-semibold relative z-10">Or Login With</span>
            <div className="absolute top-2 left-0 right-0 h-0.5 bg-neutral-100 dark:bg-neutral-800 z-0" />
          </div>

          <div className="space-y-3">
            {/* Single full-width and slightly larger Google button */}
            <button
              onClick={handleSocialLogin}
              className="w-full flex items-center justify-center space-x-3 py-3 border border-neutral-300 dark:border-neutral-700 hover:border-luxury-gold/50 rounded-xl text-xs font-bold bg-white dark:bg-luxury-black-soft text-luxury-black dark:text-white transition-all shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <Chrome className="h-5 w-5 text-red-500" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-green-600 bg-green-50 dark:bg-green-950/15 p-2 rounded-lg justify-center">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Role-based credentials verified securely.</span>
        </div>

      </div>

      {/* Save Password Prompt modal popup */}
      {showSavePasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-luxury-black-soft border border-luxury-gold/35 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative">
            <span className="text-3xl block">🔑</span>
            <h4 className="font-serif text-sm font-bold text-luxury-black dark:text-white">
              Save Password to Google?
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-300 leading-normal">
              Would you like to securely save your login details in Google Password Manager?
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => handleSavePasswordConfirm(false)}
                className="w-1/2 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg text-xs font-semibold transition-all"
              >
                No Thanks
              </button>
              <button
                onClick={() => handleSavePasswordConfirm(true)}
                className="w-1/2 py-2 bg-luxury-gold hover:bg-luxury-gold-hover text-luxury-black rounded-lg text-xs font-semibold shadow-md transition-all"
              >
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
