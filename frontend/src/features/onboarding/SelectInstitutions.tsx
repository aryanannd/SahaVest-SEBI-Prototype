import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Landmark, TrendingUp, PieChart, PiggyBank, UploadCloud, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';

export function SelectInstitutions() {
  const navigate = useNavigate();
  const [selections, setSelections] = useState({
    hdfc: true,
    icici: false,
    cdsl: true,
    cams: true,
    nps: false
  });

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const selectedCount = Object.values(selections).filter(Boolean).length;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const password = prompt('Enter CAS Password (usually your PAN in uppercase):') || '';

    setUploadStatus('uploading');
    setUploadMessage('Parsing CAS document...');

    const formData = new FormData();
    formData.append('casFile', file);
    formData.append('password', password);

    try {
      const response = await fetch('/api/portfolio/upload-cas', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload CAS');
      }

      if (data.partialDataWarning) {
        setUploadStatus('success');
        setUploadMessage(data.partialDataWarning);
      } else {
        setUploadStatus('success');
        setUploadMessage(`Successfully parsed ${data.inserted} holdings.`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage(error.message || 'Failed to parse CAS document. Please try again.');
    }
  };

  const handleToggle = (key: keyof typeof selections) => {
    setSelections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body-md flex flex-col items-center">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100"
        >
          <ArrowLeft size={24} />
        </button>
        <Header />
        <div className="w-[44px]"></div> {/* Placeholder for balance */}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-3xl flex-grow px-4 py-6 pb-[120px]">
        <div className="mb-6">
          <h1 className="font-headline-md text-on-surface mb-2">Link Financial Providers</h1>
          <p className="font-body-md text-on-surface-variant mb-4">Select the institutions you want to connect via Account Aggregator to consolidate your portfolio view.</p>
          
          <div className="flex items-center space-x-2 text-warning bg-warning-container/20 py-2 px-3 rounded-lg border border-warning/30">
            <Shield size={16} className="text-warning flex-shrink-0" />
            <span className="font-label-sm text-on-warning-container leading-tight">
              <b>Sandbox Mode:</b> This connects to mock data providers. No real financial credentials are required.
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Category: Banks */}
          <section>
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-3 px-2">Bank Accounts</h2>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              
              <div className="flex items-center justify-between p-4 border-b border-outline-variant last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg">
                    <Landmark size={24} className="text-primary fill-current" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface">HDFC Bank</h3>
                    <p className="font-body-md text-on-surface-variant">Savings & Current Accounts</p>
                  </div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    id="hdfc-toggle" 
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 top-0 left-0 transition-transform duration-200 ease-in-out border-primary checked:right-0 checked:translate-x-full" 
                    checked={selections.hdfc}
                    onChange={() => handleToggle('hdfc')}
                  />
                  <label htmlFor="hdfc-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${selections.hdfc ? 'bg-primary' : 'bg-surface-variant'}`}></label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-b border-outline-variant last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg">
                    <Landmark size={24} className="text-primary fill-current" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface">ICICI Bank</h3>
                    <p className="font-body-md text-on-surface-variant">Savings & Deposits</p>
                  </div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    id="icici-toggle" 
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 top-0 left-0 transition-transform duration-200 ease-in-out border-outline-variant checked:border-primary checked:right-0 checked:translate-x-full" 
                    checked={selections.icici}
                    onChange={() => handleToggle('icici')}
                  />
                  <label htmlFor="icici-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${selections.icici ? 'bg-primary' : 'bg-surface-variant'}`}></label>
                </div>
              </div>
            </div>
          </section>

          {/* Category: Mutual Funds & Equities */}
          <section>
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-3 px-2">Investments & Demat</h2>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              
              <div className="flex items-center justify-between p-4 border-b border-outline-variant last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg">
                    <TrendingUp size={24} className="text-primary fill-current" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface">CDSL</h3>
                    <p className="font-body-md text-on-surface-variant">Equities & ETFs</p>
                  </div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    id="cdsl-toggle" 
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 top-0 left-0 transition-transform duration-200 ease-in-out border-primary checked:right-0 checked:translate-x-full" 
                    checked={selections.cdsl}
                    onChange={() => handleToggle('cdsl')}
                  />
                  <label htmlFor="cdsl-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${selections.cdsl ? 'bg-primary' : 'bg-surface-variant'}`}></label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-b border-outline-variant last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg">
                    <PieChart size={24} className="text-primary fill-current" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface">CAMS</h3>
                    <p className="font-body-md text-on-surface-variant">Mutual Funds</p>
                  </div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    id="cams-toggle" 
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 top-0 left-0 transition-transform duration-200 ease-in-out border-primary checked:right-0 checked:translate-x-full" 
                    checked={selections.cams}
                    onChange={() => handleToggle('cams')}
                  />
                  <label htmlFor="cams-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${selections.cams ? 'bg-primary' : 'bg-surface-variant'}`}></label>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-3 px-2">Retirement & Pension</h2>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg opacity-60">
                    <PiggyBank size={24} className="text-on-surface-variant" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface">NPS (KFintech)</h3>
                    <p className="font-body-md text-on-surface-variant">National Pension System</p>
                    <p className="font-label-sm text-outline mt-0.5">Coming soon — requires PFRDA-CRA partnership</p>
                  </div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none opacity-40 pointer-events-none" title="Coming soon">
                  <input 
                    type="checkbox" 
                    id="nps-toggle" 
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-not-allowed z-10 top-0 left-0" 
                    checked={false}
                    disabled
                    onChange={() => {}}
                  />
                  <label htmlFor="nps-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-variant cursor-not-allowed"></label>
                </div>
              </div>
            </div>
          </section>

          {/* Category: Manual Import */}
          <section>
            <h2 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-3 px-2">Manual Import (Optional)</h2>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden p-4 flex flex-col items-center text-center">
              <UploadCloud size={32} className="text-outline mb-2" />
              <h3 className="font-headline-sm text-on-surface mb-1">Upload NSDL/CDSL CAS</h3>
              <p className="font-body-md text-on-surface-variant mb-4 max-w-sm">
                If you prefer not to use Account Aggregator, you can manually upload your Consolidated Account Statement PDF.
              </p>
              
              <div className="w-full relative">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploadStatus === 'uploading'}
                />
                <button 
                  className={`w-full py-3 rounded-lg font-label-md flex items-center justify-center gap-2 border transition-colors
                    ${uploadStatus === 'uploading' ? 'bg-surface-variant text-on-surface-variant border-transparent' : 
                      uploadStatus === 'success' ? 'bg-secondary-container text-on-secondary-container border-transparent' : 
                      'bg-surface text-primary border-outline-variant hover:bg-surface-container-low'}
                  `}
                >
                  {uploadStatus === 'idle' && 'Select PDF File'}
                  {uploadStatus === 'uploading' && <><Loader2 size={18} className="animate-spin" /> {uploadMessage}</>}
                  {uploadStatus === 'success' && <><CheckCircle2 size={18} /> {uploadMessage}</>}
                  {uploadStatus === 'error' && uploadMessage}
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant p-4 flex justify-center max-w-7xl mx-auto shadow-sm">
        <button 
          onClick={() => navigate('/onboarding/approve-data-sharing')}
          disabled={selectedCount === 0}
          className={`w-full max-w-sm h-[56px] font-label-md rounded-lg flex items-center justify-center transition-colors active:scale-95 duration-100 shadow-md ${
            selectedCount > 0 ? 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container' : 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed'
          }`}
        >
          {selectedCount > 0 ? `Proceed with ${selectedCount} Selected` : 'Select Providers to Proceed'}
          {selectedCount > 0 && <ArrowRight size={20} className="ml-2" />}
        </button>
      </div>

    </div>
  );
}
