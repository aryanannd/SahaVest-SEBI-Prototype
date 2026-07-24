import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { PhoneFrame } from './components/layout/PhoneFrame';

function DashboardPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface h-full">
      <h1 className="font-headline-md text-primary mb-2">Dashboard</h1>
      <p className="font-body-md text-on-surface-variant text-center">
        Onboarding complete! Your risk profile has been saved. The Dashboard feature cluster will be built next.
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PhoneFrame>
        {/* Simple top status bar mimicking a phone */}
        <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[11px] font-medium bg-primary text-on-primary">
          <span>9:41</span>
          <span className="tracking-wide">SahaVest</span>
          <span>100%</span>
        </div>

        <Routes>
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  );
}

export default App;
