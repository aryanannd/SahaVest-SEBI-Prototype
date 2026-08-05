import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
  SplashCover, LanguageSelection, MobileAuth, OtpVerification, WelcomeCarousel,
  IdentityConsent, KycProcessing, RiskProfiling, RiskProfileResult, LinkingAccounts,
  SelectInstitutions, AccountAggregatorLinking, ApproveDataSharing, LinkingSummary,
  AuthCallback, PersonalInfo, KycUpload, SelfieCapture
} from './features/onboarding';
import { PhoneFrame } from './components/layout/PhoneFrame';
import { BottomNav } from './components/layout/BottomNav';
import { Dashboard } from './features/dashboard/Dashboard';
import { FundDetail } from './features/dashboard/FundDetail';
import { HoldingDetail } from './features/dashboard/HoldingDetail';
import { PortfolioHub } from './features/portfolio/PortfolioHub';
import { GoalsHub } from './features/portfolio/GoalsHub';
import { GoalDetail } from './features/portfolio/GoalDetail';
import { ReturnsDetail } from './features/portfolio/ReturnsDetail';
import { TaxSummary } from './features/portfolio/TaxSummary';
import { PerformanceHistory } from './features/portfolio/PerformanceHistory';
import { Simulator } from './features/twin/Simulator';
import { ChatAssistant } from './features/twin/ChatAssistant';
import { PortfolioAlerts } from './features/twin/PortfolioAlerts';
import { AIExplainability } from './features/twin/AIExplainability';
import { ScamChecker } from './features/trust/ScamChecker';
import { ReportScam } from './features/trust/ReportScam';
import { AdvisorVerification } from './features/trust/AdvisorVerification';
import { RegistryVerification } from './features/trust/RegistryVerification';
import { TrustScore } from './features/trust/TrustScore';
import { TrustScoreHistory } from './features/trust/TrustScoreHistory';
import { BehavioralAlertCenter } from './features/trust/BehavioralAlertCenter';
import { LearningHub } from './features/learning/LearningHub';
import { LearningModuleDetail } from './features/learning/LearningModuleDetail';
import { Quiz } from './features/learning/Quiz';
import { BadgesAchievements } from './features/learning/BadgesAchievements';
import { Leaderboard } from './features/learning/Leaderboard';
import { DocumentSimplifier } from './features/learning/DocumentSimplifier';
import { AiChatAssistant } from './features/ai/AiChatAssistant';
import { OrderIntent } from './features/trade/OrderIntent';
import { BrokerRedirect } from './features/trade/BrokerRedirect';
import { OrderSuccess } from './features/trade/OrderSuccess';
import { AuditTrail } from './features/compliance/AuditTrail';
import { FileGrievance } from './features/compliance/FileGrievance';
import { GrievanceTracker } from './features/compliance/GrievanceTracker';
import { Grievance } from './features/compliance/Grievance';
import { PrivacyCenter } from './features/compliance/PrivacyCenter';
import { ManageConsents } from './features/compliance/ManageConsents';
import { ProfileSettings } from './features/profile/ProfileSettings';
import { SecuritySettings } from './features/profile/SecuritySettings';
import { NotificationPreferences } from './features/profile/NotificationPreferences';
import { AddNominee } from './features/profile/AddNominee';
import { HelpSupport } from './features/profile/HelpSupport';
import { SafetyNotifications } from './features/profile/SafetyNotifications';
import { AuthGuard } from './components/common/AuthGuard';

const ProtectedRoute = ({ children, requireKyc = true }: { children: React.ReactNode, requireKyc?: boolean }) => (
  <AuthGuard requireKyc={requireKyc}>
    {children}
  </AuthGuard>
);

function App() {
  return (
      <BrowserRouter>
        <PhoneFrame>
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <Routes>
              {/* Onboarding Routes */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding/splash" element={<SplashCover />} />
              <Route path="/onboarding/language" element={<LanguageSelection />} />
              <Route path="/onboarding/mobile" element={<MobileAuth />} />
              <Route path="/onboarding/otp" element={<OtpVerification />} />
              <Route path="/onboarding/personal-info" element={<PersonalInfo />} />
              <Route path="/onboarding/identity-consent" element={<IdentityConsent />} />
              <Route path="/onboarding/kyc-upload" element={<KycUpload />} />
              <Route path="/onboarding/selfie" element={<SelfieCapture />} />
              <Route path="/onboarding/kyc-processing" element={<KycProcessing />} />
              <Route path="/onboarding/welcome" element={<WelcomeCarousel />} />
              <Route path="/onboarding/risk-profiling" element={<RiskProfiling />} />
              <Route path="/onboarding/risk-profile-result" element={<RiskProfileResult />} />
              <Route path="/onboarding/account-aggregator" element={<AccountAggregatorLinking />} />
              <Route path="/onboarding/select-institutions" element={<SelectInstitutions />} />
              <Route path="/onboarding/approve-data-sharing" element={<ApproveDataSharing />} />
              <Route path="/onboarding/linking" element={<LinkingAccounts />} />
              <Route path="/onboarding/linking-summary" element={<LinkingSummary />} />
              
              <Route path="/dashboard" element={<ProtectedRoute requireKyc={false}><Dashboard /></ProtectedRoute>} />
              <Route path="/fund/:type" element={<ProtectedRoute requireKyc={false}><FundDetail /></ProtectedRoute>} />
              <Route path="/fund/:type/:holdingId" element={<ProtectedRoute requireKyc={false}><HoldingDetail /></ProtectedRoute>} />
              <Route path="/portfolio/holding/:holdingId" element={<ProtectedRoute requireKyc={false}><HoldingDetail /></ProtectedRoute>} />
              <Route path="/portfolio" element={<ProtectedRoute requireKyc={false}><PortfolioHub /></ProtectedRoute>} />
              <Route path="/portfolio/returns" element={<ProtectedRoute requireKyc={false}><ReturnsDetail /></ProtectedRoute>} />
              <Route path="/portfolio/goals" element={<ProtectedRoute requireKyc={false}><GoalsHub /></ProtectedRoute>} />
              <Route path="/portfolio/goals/:id" element={<ProtectedRoute requireKyc={false}><GoalDetail /></ProtectedRoute>} />
              <Route path="/portfolio/tax" element={<ProtectedRoute requireKyc={false}><TaxSummary /></ProtectedRoute>} />
              <Route path="/portfolio/performance" element={<ProtectedRoute requireKyc={false}><PerformanceHistory /></ProtectedRoute>} />
              <Route path="/twin/simulator" element={<Simulator />} />
              <Route path="/twin/explainability" element={<AIExplainability />} />
              <Route path="/chat" element={<AiChatAssistant />} />
              <Route path="/alerts" element={<PortfolioAlerts />} />
              <Route path="/fraud" element={<ScamChecker />} />
              <Route path="/protection" element={<Navigate to="/fraud" replace />} />
              <Route path="/trust/report" element={<ReportScam />} />
              <Route path="/trust/advisor" element={<AdvisorVerification />} />
              <Route path="/trust/registry" element={<RegistryVerification />} />
              <Route path="/trust/score" element={<TrustScore />} />
              <Route path="/trust/history" element={<TrustScoreHistory />} />
              <Route path="/trust/alerts" element={<BehavioralAlertCenter />} />
              <Route path="/learn" element={<LearningHub />} />
              <Route path="/learn/module" element={<LearningModuleDetail />} />
              <Route path="/learn/quiz" element={<Quiz />} />
              <Route path="/learn/badges" element={<BadgesAchievements />} />
              <Route path="/learn/leaderboard" element={<Leaderboard />} />
              <Route path="/learn/simplify" element={<DocumentSimplifier />} />
              
              <Route path="/trade/intent" element={<ProtectedRoute requireKyc={true}><OrderIntent /></ProtectedRoute>} />
              <Route path="/trade/redirect" element={<ProtectedRoute requireKyc={true}><BrokerRedirect /></ProtectedRoute>} />
              <Route path="/trade/success" element={<ProtectedRoute requireKyc={true}><OrderSuccess /></ProtectedRoute>} />
              
              <Route path="/compliance/audit" element={<AuditTrail />} />
              <Route path="/compliance/grievance/new" element={<FileGrievance />} />
              <Route path="/compliance/grievance/track" element={<GrievanceTracker />} />
              <Route path="/grievance/tracker" element={<GrievanceTracker />} />
              <Route path="/compliance/grievance/:id" element={<Grievance />} />
              <Route path="/privacy" element={<PrivacyCenter />} />
              <Route path="/privacy/consents" element={<ManageConsents />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/profile/security" element={<SecuritySettings />} />
              <Route path="/profile/notifications" element={<NotificationPreferences />} />
              <Route path="/profile/nominee/add" element={<AddNominee />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/safety" element={<SafetyNotifications />} />
              <Route path="*" element={<Navigate to="/onboarding/splash" replace />} />
            </Routes>
            <BottomNav />
          </div>
        </PhoneFrame>
      </BrowserRouter>
  );
}

export default App;
