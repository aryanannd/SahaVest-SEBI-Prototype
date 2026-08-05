import React, { useState } from 'react';
import { Trash2, ChevronDown, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { supabase } from '../../lib/supabaseClient';

export function AddNominee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName1: '',
    relationship1: '',
    dob1: '',
    share1: 100
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'share1' ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    if (!formData.fullName1 || !formData.relationship1 || !formData.dob1) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch('/api/profile/nominees', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: formData.fullName1,
          relation: formData.relationship1,
          dob: formData.dob1,
          allocation: formData.share1
        })
      });
      
      if (res.ok) {
        navigate('/profile');
      } else {
        alert('Failed to save nominee.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-background text-on-background antialiased flex flex-col min-h-screen">
      {/* TopAppBar */}
      <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-50 flex items-center justify-center px-4 py-3 min-h-[64px]">
        <Header />
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-start px-4 py-8 md:py-20 w-full max-w-3xl mx-auto">
        <div className="w-full text-center mb-8">
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-2">Protect Your Wealth</h1>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
            Add nominees to ensure your investments are smoothly passed on to your loved ones in the future. This step provides security and peace of mind.
          </p>
        </div>

        {/* Nominee Card */}
        <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant p-6 md:p-8 shadow-sm mb-6 relative">
          <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-3">
            <h2 className="font-headline-sm text-on-surface">Nominee 1</h2>
            <button onClick={() => navigate('/profile')} aria-label="Remove Nominee" className="text-error flex items-center justify-center h-[44px] w-[44px] hover:bg-error-container rounded-full transition-colors" type="button">
              <Trash2 size={24} />
            </button>
          </div>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {/* Full Name */}
            <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
              <label className="font-label-md text-on-surface-variant" htmlFor="fullName1">Full Name (as per ID)</label>
              <input 
                className="h-[44px] rounded-lg border border-outline bg-surface-container-lowest px-4 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" 
                id="fullName1" 
                name="fullName1" 
                value={formData.fullName1}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar" 
                type="text"
                required
              />
            </div>

            {/* Relationship */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-on-surface-variant" htmlFor="relationship1">Relationship</label>
              <div className="relative">
                <select 
                  className="w-full h-[44px] rounded-lg border border-outline bg-surface-container-lowest px-4 pr-10 font-body-md text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow cursor-pointer" 
                  id="relationship1" 
                  name="relationship1"
                  value={formData.relationship1}
                  onChange={handleChange}
                  required
                >
                  <option disabled value="">Select Relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={20} />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-on-surface-variant" htmlFor="dob1">Date of Birth</label>
              <div className="relative">
                <input 
                  className="w-full h-[44px] rounded-lg border border-outline bg-surface-container-lowest px-4 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" 
                  id="dob1" 
                  name="dob1" 
                  value={formData.dob1}
                  onChange={handleChange}
                  type="date"
                  required
                />
              </div>
            </div>

            {/* Share (%) */}
            <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
              <label className="font-label-md text-on-surface-variant" htmlFor="share1">Share Allocation (%)</label>
              <div className="relative flex items-center">
                <input 
                  className="w-full h-[44px] rounded-lg border border-outline bg-surface-container-lowest px-4 pr-12 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" 
                  id="share1" 
                  max="100" 
                  min="1" 
                  name="share1" 
                  value={formData.share1}
                  onChange={handleChange}
                  type="number" 
                  required
                />
                <span className="absolute right-4 font-body-md text-on-surface-variant select-none">%</span>
              </div>
              <p className="font-label-sm text-outline mt-1">Total share allocation must equal 100%.</p>
            </div>
            
            <button type="submit" className="hidden" id="submitBtn"></button>
          </form>
        </div>

        {/* Add Another Action */}
        <div className="w-full flex justify-start mb-8">
          <button className="flex items-center gap-2 h-[44px] px-4 rounded-full border border-outline-variant text-primary hover:bg-surface-container-low transition-colors" type="button">
            <Plus size={20} className="fill-current" />
            <span className="font-label-md">Add Another Nominee</span>
          </button>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col items-center gap-6 mt-auto pb-8">
          <button 
            className="w-full md:w-auto min-w-[240px] h-[56px] rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50" 
            type="button"
            onClick={() => document.getElementById('submitBtn')?.click()}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
          <button 
            className="font-label-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline h-[44px] flex items-center justify-center"
            onClick={() => navigate('/profile')}
          >
            Skip for now
          </button>
        </div>
      </main>
    </div>
  );
}
