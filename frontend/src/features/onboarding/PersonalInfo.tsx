import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, ArrowRight, Loader2, User, Phone, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export function PersonalInfo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Prefer not to say',
    phone: '',
    address: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updatePayload = {
        full_name: formData.fullName,
        dob: formData.dob || null,
        phone: formData.phone,
        onboarding_status: 'kyc_pending',
      };

      const { error } = await supabase.from('users').update(updatePayload).eq('id', user.id);
      
      if (error) throw error;
      
      navigate('/onboarding/identity-consent');
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save information');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased md:items-center md:justify-center">
      <main className="flex-1 flex flex-col px-4 pt-16 pb-8 w-full max-w-md mx-auto relative z-10 md:bg-surface-container-lowest md:rounded-xl md:shadow-sm md:border md:border-outline-variant md:min-h-[600px] md:pt-8">
        
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm font-label-md text-on-surface-variant mb-2">
            <span>Account Creation</span>
            <span>Step 1 of 3</span>
          </div>
          <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-primary rounded-full"></div>
          </div>
        </div>

        <header className="mb-6">
          <h1 className="font-display-lg-mobile text-on-surface mb-2">
            Personal Information
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Please provide your details exactly as they appear on your official IDs.
          </p>
        </header>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error-container/20">
            {errorMsg}
          </div>
        )}

        <form className="flex-1 flex flex-col gap-4" onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div>
            <label className="block font-label-md text-on-surface mb-1" htmlFor="fullName">Full Name (As per PAN)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                <User size={18} />
              </div>
              <input 
                name="fullName"
                id="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full h-[50px] pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                placeholder="Rahul Kumar Sharma" 
              />
            </div>
          </div>

          {/* DOB & Gender */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-label-md text-on-surface mb-1" htmlFor="dob">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <Calendar size={18} />
                </div>
                <input 
                  type="date"
                  name="dob"
                  id="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full h-[50px] pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow appearance-none" 
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block font-label-md text-on-surface mb-1" htmlFor="gender">Gender</label>
              <select 
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full h-[50px] px-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block font-label-md text-on-surface mb-1" htmlFor="phone">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                <Phone size={18} />
              </div>
              <input 
                type="tel"
                name="phone"
                id="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-[50px] pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" 
                placeholder="99999 99999" 
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block font-label-md text-on-surface mb-1" htmlFor="address">Current Address</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none text-on-surface-variant">
                <MapPin size={18} />
              </div>
              <textarea 
                name="address"
                id="address"
                rows={3}
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full py-3 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow resize-none" 
                placeholder="Flat No, Building Name, Street..." 
              />
            </div>
          </div>

          {/* Safety Notice */}
          <div className="mt-4 bg-surface-container-low rounded-lg p-3 flex gap-2 items-start border border-outline-variant/50">
            <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="font-body-sm text-on-surface-variant leading-tight">
              Your information is securely encrypted and used only for regulatory KYC compliance.
            </p>
          </div>

          <div className="mt-auto pt-6 pb-2">
            <button 
              disabled={isProcessing}
              className="w-full h-[56px] bg-primary text-on-primary font-headline-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm" 
              type="submit"
            >
              {isProcessing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <div 
        className="hidden md:block fixed inset-0 z-0 pointer-events-none opacity-20" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--tw-colors-outline-variant) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      ></div>
    </div>
  );
}
