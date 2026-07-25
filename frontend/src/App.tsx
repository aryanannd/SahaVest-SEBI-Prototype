import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { PhoneFrame } from './components/layout/PhoneFrame';
import { BottomNav } from './components/layout/BottomNav';
import { Dashboard } from './features/dashboard/Dashboard';
import { FundDetail } from './features/dashboard/FundDetail';
import { PortfolioHub } from './features/portfolio/PortfolioHub';
import { GoalsHub } from './features/portfolio/GoalsHub';
import { ReturnsDetail } from './features/portfolio/ReturnsDetail';
import { Simulator } from './features/twin/Simulator';
import { ChatAssistant } from './features/twin/ChatAssistant';
import { PortfolioAlerts } from './features/twin/PortfolioAlerts';
import { ScamChecker } from './features/trust/ScamChecker';
import { AdvisorVerification } from './features/trust/AdvisorVerification';
import { RegistryVerification } from './features/trust/RegistryVerification';
import { TrustScore } from './features/trust/TrustScore';
import { LearningHub } from './features/learning/LearningHub';
import { Quiz } from './features/learning/Quiz';
import { BrokerRedirect } from './features/trade/BrokerRedirect';
import { OrderSuccess } from './features/trade/OrderSuccess';
import { AuditTrail } from './features/compliance/AuditTrail';
import { Grievance } from './features/compliance/Grievance';
import { PrivacyCenter } from './features/compliance/PrivacyCenter';

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

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Routes>
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fund/:type" element={<FundDetail />} />
            <Route path="/portfolio" element={<PortfolioHub />} />
            <Route path="/portfolio/returns" element={<ReturnsDetail />} />
            <Route path="/portfolio/goals" element={<GoalsHub />} />
            <Route path="/twin/simulator" element={<Simulator />} />
            <Route path="/chat" element={<ChatAssistant />} />
            <Route path="/alerts" element={<PortfolioAlerts />} />
            <Route path="/fraud" element={<ScamChecker />} />
            <Route path="/trust/advisor" element={<AdvisorVerification />} />
            <Route path="/trust/registry" element={<RegistryVerification />} />
            <Route path="/trust/score" element={<TrustScore />} />
            <Route path="/learn" element={<LearningHub />} />
            <Route path="/learn/quiz" element={<Quiz />} />
            <Route path="/trade/redirect" element={<BrokerRedirect />} />
            <Route path="/trade/success" element={<OrderSuccess />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/grievance" element={<Grievance />} />
            <Route path="/privacy" element={<PrivacyCenter />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </PhoneFrame>
    </BrowserRouter>
  );
}

export default App;
