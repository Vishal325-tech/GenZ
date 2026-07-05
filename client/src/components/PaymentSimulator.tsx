import React, { useState } from 'react';
import { CreditCard, QrCode, ShieldCheck, CheckCircle, Smartphone } from 'lucide-react';

interface PaymentSimulatorProps {
  amount: number;
  onPaymentSuccess: (receiptId: string) => void;
  onPaymentCancel: () => void;
  method: string;
}

const PaymentSimulator: React.FC<PaymentSimulatorProps> = ({ amount, onPaymentSuccess, onPaymentCancel, method }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Card States
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  const triggerPaymentFlow = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate transaction delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        const mockReceiptId = 'REC_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        onPaymentSuccess(mockReceiptId);
      }, 1500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-6 rounded-2xl border border-luxury-gold/30 bg-white dark:bg-luxury-black-soft text-center shadow-2xl relative">
        
        <h3 className="font-serif text-lg font-bold text-luxury-red dark:text-luxury-gold mb-2">
          Secure Payment Simulator
        </h3>
        <p className="text-xs text-luxury-black/50 dark:text-white/50 mb-6">
          Amount to Pay: <span className="font-bold text-luxury-black dark:text-white">₹{amount.toLocaleString()}</span>
        </p>

        {loading && (
          <div className="py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-luxury-gold animate-pulse">
              Simulating Secure Bank Authorization...
            </p>
            <span className="text-[10px] text-luxury-black/40 dark:text-white/40 block">Powered by Stripe/Razorpay Sandbox Mode</span>
          </div>
        )}

        {success && (
          <div className="py-12 space-y-4 animate-scaleUp">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto animate-bounce" />
            <p className="text-base font-bold text-green-600">
              Payment Authorized Successfully!
            </p>
            <p className="text-xs text-luxury-black/50 dark:text-white/50">
              Finalizing your premium gift packaging details...
            </p>
          </div>
        )}

        {!loading && !success && (
          <form onSubmit={triggerPaymentFlow} className="space-y-4 text-left">
            
            {/* Card Method */}
            {method === 'card' && (
              <div className="space-y-4">
                {/* 3D-ish Card Preview Wrapper */}
                <div className={`w-full aspect-[1.586/1] rounded-xl p-5 text-white bg-gradient-to-tr from-luxury-black-dark to-luxury-black-light border border-luxury-gold/30 flex flex-col justify-between shadow-md relative transition-transform duration-500 transform ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  {!isFlipped ? (
                    <>
                      <div className="flex justify-between items-start">
                        <CreditCard className="h-8 w-8 text-luxury-gold" />
                        <span className="font-serif text-xs font-bold text-luxury-gold">GAJANANA ELITE</span>
                      </div>
                      <div className="text-base tracking-widest font-mono text-luxury-cream-light mt-4">
                        {cardNumber.padEnd(16, '•').replace(/(.{4})/g, '$1 ')}
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-luxury-cream-dark/50">Cardholder</div>
                          <div className="text-xs font-semibold uppercase">{cardName || 'YOUR NAME'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] uppercase tracking-wider text-luxury-cream-dark/50">Expires</div>
                          <div className="text-xs font-semibold">{expiry || 'MM/YY'}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="[transform:rotateY(180deg)] flex flex-col justify-between h-full py-2">
                      <div className="w-full h-8 bg-neutral-800 -mx-5 mt-2"></div>
                      <div className="text-right mt-6 pr-4">
                        <span className="text-[9px] text-luxury-cream-dark/50 block">CVV</span>
                        <span className="bg-white text-luxury-black px-2 py-0.5 rounded text-xs font-bold font-mono">
                          {cvv || '•••'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form fields */}
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-luxury-black/70 dark:text-white/70 block mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength={16}
                      required
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-luxury-black/70 dark:text-white/70 block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-luxury-black/70 dark:text-white/70 block mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength={3}
                        required
                        value={cvv}
                        onFocus={() => setIsFlipped(true)}
                        onBlur={() => setIsFlipped(false)}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-luxury-black/70 dark:text-white/70 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI barcode method */}
            {method.startsWith('upi') && (
              <div className="space-y-4 text-center">
                <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-luxury-gold/20 inline-block rounded-xl mx-auto">
                  <QrCode className="h-44 w-44 text-luxury-black dark:text-white" />
                </div>
                <p className="text-xs text-luxury-black/60 dark:text-white/60">
                  Scan this QR code using <strong>{method.toUpperCase()}</strong>, GPay, or Paytm to complete authentication.
                </p>
                <div className="flex justify-center space-x-4">
                  <span className="text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded">UPI ID: giftmovers@okaxis</span>
                </div>
              </div>
            )}

            {/* Netbanking dropdown option */}
            {method === 'netbanking' && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-luxury-black/70 dark:text-white/70 block mb-1">Select Bank</label>
                <select className="w-full px-3 py-2 rounded border border-neutral-300 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white" required>
                  <option value="">-- Choose Your Bank --</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Shield disclaimer */}
            <div className="flex items-center space-x-2 text-[10px] text-green-600 bg-green-50 dark:bg-green-900/10 p-2.5 rounded-lg">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>SSL Secured & Encrypted Sandbox Session. No real funds will be deducted.</span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={onPaymentCancel}
                className="w-1/3 py-2 border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-cream dark:hover:bg-neutral-800 rounded-lg text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-grow py-2 bg-luxury-red hover:bg-luxury-red-dark text-white rounded-lg text-xs font-semibold shadow-md transition-all"
              >
                {method.startsWith('upi') ? 'Confirm UPI Payment Scan' : 'Submit Secure Payment'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default PaymentSimulator;
