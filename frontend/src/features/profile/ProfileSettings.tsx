import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Wallet, FileText, ChevronRight, HelpCircle, ShieldCheck, CreditCard, Banknote, Smartphone, Moon, LogOut, CheckCircle, SmartphoneNfc, Fingerprint, Lock, ShieldAlert, Mail, MapPin, Edit3, Camera, FileCheck, Share2, Users, Edit2, Landmark, Utensils, LineChart, CheckSquare, Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function ProfileSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', dob: '', marital_status: '', annual_income: '' });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinForm, setPinForm] = useState({ newPin: '' });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        const res = await fetch('http://localhost:3000/api/profile/me', { headers });
        const data = await res.json();
        setProfileData(data);
        if (data.profile) {
          setTwoFactorEnabled(data.profile.two_factor_enabled || false);
          setBiometricEnabled(data.profile.biometric_enabled || false);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/onboarding/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      
      const res = await fetch('http://localhost:3000/api/profile/me', {
        method: 'PUT',
        headers,
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setProfileData((prev: any) => ({
          ...prev,
          profile: { ...prev.profile, ...editForm }
        }));
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSecurity = async (updates: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      
      const res = await fetch('http://localhost:3000/api/profile/security', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        if (updates.two_factor_enabled !== undefined) setTwoFactorEnabled(updates.two_factor_enabled);
        if (updates.biometric_enabled !== undefined) setBiometricEnabled(updates.biometric_enabled);
        if (updates.app_pin !== undefined) setIsPinModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNominee = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      await fetch(`http://localhost:3000/api/profile/nominees/${id}`, { method: 'DELETE', headers });
      setProfileData((prev: any) => ({
        ...prev,
        nominees: prev.nominees.filter((n: any) => n.id !== id)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-full bg-background text-on-background antialiased flex flex-col min-h-screen">
      {/* TopAppBar */}
      <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-50 flex items-center justify-between px-4 py-3 min-h-[64px]">
        <h1 className="font-headline-sm text-on-surface">Account & Settings</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-error font-label-md hover:bg-error-container px-3 py-2 rounded-full transition-colors">
          <LogOut size={20} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Profile Header */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-variant flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
          
          <div className="relative group">
            <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center text-3xl font-display-md text-on-primary-container border-4 border-surface shadow-sm">
              {profileData?.profile?.name?.charAt(0) || 'R'}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-surface rounded-full flex items-center justify-center shadow-md border border-outline-variant text-on-surface hover:text-primary transition-colors">
              <Camera size={16} />
            </button>
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-headline-md text-on-surface">{profileData?.profile?.name || 'Rahul Sharma'}</h2>
              {profileData?.profile?.kyc_status === 'verified' ? (
                <div className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                  <ShieldCheck size={14} className="fill-current text-secondary" />
                  <span className="font-label-sm">KYC Verified</span>
                </div>
              ) : (
                <button onClick={() => navigate('/onboarding/kyc')} className="flex items-center gap-1 bg-error-container text-on-error-container px-3 py-1 rounded-full hover:bg-error hover:text-on-error transition-colors">
                  <ShieldAlert size={14} className="fill-current" />
                  <span className="font-label-sm">Complete KYC</span>
                </button>
              )}
            </div>
            <p className="font-body-md text-on-surface-variant mb-3">{profileData?.profile?.email || 'rahul@example.com'} • {profileData?.profile?.phone || '+91 98765 43210'}</p>
            <div className="flex gap-2">
              <span className="font-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-surface-variant">Risk Profile: {profileData?.profile?.risk_profile || 'Moderate'}</span>
              <span className="font-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-surface-variant">Member since Jan 2026</span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-surface-variant overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`font-label-md px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Personal Details
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`font-label-md px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Security & Login
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`font-label-md px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Personal Info & Nominees */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Personal Information */}
                <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden relative">
                  <div className="px-4 py-3 border-b border-surface-variant bg-surface-bright flex justify-between items-center">
                    <h3 className="font-headline-sm text-on-background flex items-center gap-2">
                      <User className="text-primary fill-current" size={24} />
                      Personal Information
                    </h3>
                    <button 
                      onClick={() => {
                        setEditForm({
                          name: profileData?.profile?.name || '',
                          email: profileData?.profile?.email || '',
                          dob: profileData?.profile?.dob || '',
                          marital_status: profileData?.profile?.marital_status || '',
                          annual_income: profileData?.profile?.annual_income || ''
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="text-primary hover:bg-surface-container px-3 py-1.5 rounded-lg font-label-md transition-colors flex items-center gap-1"
                    >
                      <Edit3 size={16} /> Edit
                    </button>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div className="py-2 border-b border-surface-variant sm:border-none">
                        <p className="font-label-sm text-outline mb-1 uppercase">Date of Birth</p>
                        <p className="font-body-md text-on-background">{profileData?.profile?.dob || 'Not set'}</p>
                      </div>
                      <div className="py-2 border-b border-surface-variant sm:border-none">
                        <p className="font-label-sm text-outline mb-1 uppercase">PAN Number</p>
                        <p className="font-body-md text-on-background tracking-wider font-mono">ABCDE1234F</p>
                      </div>
                      <div className="py-2 border-b border-surface-variant sm:border-none">
                        <p className="font-label-sm text-outline mb-1 uppercase">Marital Status</p>
                        <p className="font-body-md text-on-background">{profileData?.profile?.marital_status || 'Not set'}</p>
                      </div>
                      <div className="py-2">
                        <p className="font-label-sm text-outline mb-1 uppercase">Annual Income</p>
                        <p className="font-body-md text-on-background">{profileData?.profile?.annual_income || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Manage Nominees */}
                <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
                  <div className="px-4 py-3 border-b border-surface-variant bg-surface-bright flex justify-between items-center">
                    <h3 className="font-headline-sm text-on-background flex items-center gap-2">
                      <Users className="text-primary fill-current" size={24} />
                      Manage Nominees
                    </h3>
                    <button onClick={() => navigate('/profile/nominee/add')} className="px-4 py-2 bg-primary-container text-on-primary-container font-label-md rounded-lg hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Nominee
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {profileData?.nominees?.length > 0 ? profileData.nominees.map((nom: any) => (
                      <div key={nom.id} className="flex items-center justify-between p-3 border border-surface-variant rounded-lg bg-surface-bright">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant">
                            <User size={24} className="fill-current" />
                          </div>
                          <div>
                            <p className="font-body-md text-on-background font-medium">{nom.name}</p>
                            <p className="font-label-md text-on-surface-variant">{nom.relation} • {nom.allocation}% Allocation</p>
                          </div>
                        </div>
                        <button onClick={() => deleteNominee(nom.id)} aria-label="Remove Nominee" className="w-[44px] h-[44px] flex items-center justify-center text-error hover:bg-error-container rounded-full transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-on-surface-variant">
                        No nominees added yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: Linked Accounts & Settings */}
              <div className="space-y-6">
                
                {/* Linked Accounts */}
                <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
                  <div className="px-4 py-3 border-b border-surface-variant bg-surface-bright flex justify-between items-center">
                    <h3 className="font-headline-sm text-on-background flex items-center gap-2">
                      <Landmark className="text-primary fill-current" size={24} />
                      Linked Accounts
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Bank Account */}
                    <div className="p-3 bg-surface-container-low rounded-lg border border-surface-variant flex items-start gap-3">
                      <div className="mt-1 text-primary">
                        <Landmark size={24} className="fill-current" />
                      </div>
                      <div className="flex-1">
                        <p className="font-label-sm text-outline uppercase mb-1">Primary Bank</p>
                        <p className="font-body-md text-on-background font-medium">HDFC Bank</p>
                        <p className="font-label-md text-on-surface-variant">XXXX-XXXX-1234</p>
                        <div className="mt-2 inline-flex items-center gap-1 text-secondary">
                          <ShieldCheck size={16} className="fill-current" />
                          <span className="font-label-sm">Mandate Active</span>
                        </div>
                      </div>
                    </div>
                    {/* Demat Account */}
                    <div className="p-3 bg-surface-container-low rounded-lg border border-surface-variant flex items-start gap-3">
                      <div className="mt-1 text-primary">
                        <LineChart size={24} className="fill-current" />
                      </div>
                      <div className="flex-1">
                        <p className="font-label-sm text-outline uppercase mb-1">Demat Account</p>
                        <p className="font-body-md text-on-background font-medium">Zerodha Broking</p>
                        <p className="font-label-md text-on-surface-variant">DP ID: IN301549</p>
                        <div className="mt-2 inline-flex items-center gap-1 text-secondary">
                          <CheckCircle size={16} className="fill-current" />
                          <span className="font-label-sm">Synced</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-2 border border-outline-variant text-primary font-label-md rounded-lg hover:bg-surface-container-low transition-colors">
                      Link Another Account
                    </button>
                  </div>
                </section>
                
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
                <div className="px-4 py-3 border-b border-surface-variant bg-surface-bright flex justify-between items-center">
                  <h3 className="font-headline-sm text-on-background flex items-center gap-2">
                    <Shield className="text-primary fill-current" size={24} />
                    Security Settings
                  </h3>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-variant">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-surface-container-high rounded-full text-on-surface-variant">
                        <Lock size={24} />
                      </div>
                      <div>
                        <h4 className="font-body-lg text-on-surface font-medium mb-1">App PIN & Biometrics</h4>
                        <p className="font-body-md text-on-surface-variant max-w-md">Use FaceID/TouchID or a 6-digit PIN to securely open the app.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsPinModalOpen(true)}
                      className="shrink-0 px-4 py-2 border border-outline-variant text-primary font-label-md rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                      Change PIN
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-variant">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-surface-container-high rounded-full text-on-surface-variant">
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <h4 className="font-body-lg text-on-surface font-medium mb-1">Two-Factor Authentication</h4>
                        <p className="font-body-md text-on-surface-variant max-w-md">Add an extra layer of security requiring an OTP for important actions.</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => handleUpdateSecurity({ two_factor_enabled: !twoFactorEnabled })}
                      className={`relative w-14 h-8 rounded-full transition-colors ${twoFactorEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
                      aria-label="Toggle 2FA"
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-surface rounded-full shadow-sm transition-transform ${twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                    </button>
                  </div>

                </div>
              </section>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
                <div className="px-4 py-3 border-b border-surface-variant bg-surface-bright flex justify-between items-center">
                  <h3 className="font-headline-sm text-on-background flex items-center gap-2">
                    <Bell className="text-primary fill-current" size={24} />
                    Notification Preferences
                  </h3>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-surface-variant">
                    <div>
                      <h4 className="font-body-md text-on-surface font-medium">Portfolio Updates</h4>
                      <p className="font-body-sm text-on-surface-variant">Weekly summaries and major market movements.</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-surface-variant">
                    <div>
                      <h4 className="font-body-md text-on-surface font-medium">Security Alerts</h4>
                      <p className="font-body-sm text-on-surface-variant">Unusual login attempts and important account changes.</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" defaultChecked disabled />
                  </div>

                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-surface-variant">
                    <div>
                      <h4 className="font-body-md text-on-surface font-medium">Promotional Offers</h4>
                      <p className="font-body-sm text-on-surface-variant">New features, investment opportunities, and partner offers.</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" />
                  </div>

                </div>
              </section>
            </div>
          )}

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-surface-variant flex justify-between items-center bg-surface-bright">
              <h2 className="font-headline-sm text-on-background">Edit Personal Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-highest">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Full Name</label>
                <input type="text" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-background" />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Email Address</label>
                <input type="email" required value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-background" />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Date of Birth</label>
                <input type="date" required value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1">Marital Status</label>
                  <select value={editForm.marital_status} onChange={e => setEditForm({...editForm, marital_status: e.target.value})} className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-background appearance-none">
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1">Annual Income</label>
                  <select value={editForm.annual_income} onChange={e => setEditForm({...editForm, annual_income: e.target.value})} className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-background appearance-none">
                    <option value="">Select</option>
                    <option value="< ₹10L">&lt; ₹10L</option>
                    <option value="₹10L - ₹25L">₹10L - ₹25L</option>
                    <option value="> ₹25L">&gt; ₹25L</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 font-label-lg text-primary hover:bg-surface-container rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 font-label-lg bg-primary text-on-primary hover:bg-primary/90 rounded-xl transition-colors shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h2 className="font-headline-sm text-on-background mb-2">Set App PIN</h2>
            <p className="font-body-md text-on-surface-variant mb-6">Enter a new 6-digit PIN to secure your app access.</p>
            <input 
              type="password" 
              maxLength={6} 
              placeholder="••••••" 
              value={pinForm.newPin}
              onChange={e => setPinForm({ newPin: e.target.value.replace(/\D/g, '') })}
              className="w-full text-center tracking-[1em] font-mono text-2xl px-4 py-3 bg-surface-bright border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-background mb-6" 
            />
            <div className="flex justify-between gap-3">
              <button onClick={() => setIsPinModalOpen(false)} className="flex-1 py-2.5 font-label-lg border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container transition-colors">Cancel</button>
              <button 
                onClick={() => handleUpdateSecurity({ app_pin: pinForm.newPin })} 
                disabled={pinForm.newPin.length !== 6}
                className="flex-1 py-2.5 font-label-lg bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save PIN
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
