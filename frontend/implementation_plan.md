# STAGE A — Systematic Audit Report

As requested, here is the full systematic end-to-end audit of all interactive elements across Clusters 1-9. I've specifically investigated the 10 named features you highlighted.

## Executive Summary of Incomplete Features (The 10 Named Items)

| Feature | Screen / Component | Status (Functional vs Dead) | Data Status (Real vs Hardcoded) |
| :--- | :--- | :--- | :--- |
| **Nominee Management** | `Profile/AddNominee.tsx` | **Dead**. Inputs have no `onChange`, Save button does nothing. | Hardcoded. Does not read/write to `users` or `nominees` table. |
| **2FA Toggle/Setup** | `Profile/SecuritySettings.tsx` | **Dead**. Toggles update local React state but make no API calls. | Semi-real (reads on load, but cannot save). |
| **Profile Edit** | `Profile/ProfileSettings.tsx` | **Dead**. No "Edit" form exists for Name/Email/DOB. | Hardcoded placeholders mixed with auth session data. |
| **Bank Account Linking** | `Profile/ProfileSettings.tsx` | **Dead**. Static list of banks. | Hardcoded. |
| **PIN / Password Change** | `Profile/SecuritySettings.tsx` | **Dead**. Toggles exist, but no actual UI/flow to change PIN. | N/A (Missing). |
| **Communication Prefs** | `Profile/NotificationPreferences.tsx` | **Dead**. Toggles update local state only. | Hardcoded defaults. |
| **KYC Status** | `Profile/ProfileSettings.tsx` | **Dead**. Shows a static "Verified" badge. | Hardcoded badge. |
| **Help & Support** | `Profile/HelpSupport.tsx` | **Dead**. Topic links are `href="#"`. Search does nothing. | Hardcoded content. |
| **Terms & Privacy Policy**| N/A | **Missing**. Entirely missing pages. Links point to `#`. | N/A (Missing). |
| **AI Chat Assistant** | `AI/AiChatAssistant.tsx` | **Dead**. The `<textarea>` has no `onChange`, `value`, or `onSubmit`. | Hardcoded message bubbles. Cannot send messages. |

---

## Detailed Cluster-by-Cluster Audit

### Cluster 1: Onboarding & KYC
| Element | Screen | Action Status | Data Status |
| :--- | :--- | :--- | :--- |
| **"Verify OTP" Input** | `OtpVerification.tsx` | Functional (Demo login works) | Real Auth Session |
| **"Proceed to Risk Profiling"** | `OtpVerification.tsx` | Functional (Navigates) | N/A |
| **"Approve" (Data Sharing)** | `ApproveDataSharing.tsx` | Functional (Navigates) | N/A |
| **"Upload CAS"** | `SelectInstitutions.tsx` | Functional (API works) | Real DB Insert |

### Cluster 2: Dashboard
| Element | Screen | Action Status | Data Status |
| :--- | :--- | :--- | :--- |
| **"View Portfolio"** | `Dashboard.tsx` | Functional (Navigates) | N/A |
| **Quick Action Grid** | `Dashboard.tsx` | Functional (Navigates) | N/A |
| **Net Worth Chart** | `Dashboard.tsx` | Dead (Static SVG) | Hardcoded |

### Cluster 3: Portfolio
| Element | Screen | Action Status | Data Status |
| :--- | :--- | :--- | :--- |
| **Asset Class Tabs** | `PortfolioHub.tsx` | Dead (UI only) | Hardcoded |
| **"View Details" / Asset list** | `PortfolioHub.tsx` | Dead (Doesn't expand) | Real (fetches `/api/portfolio/me`) |
| **Timeframe filters (1W, 1M)**| `ReturnsDetail.tsx` | Dead | Hardcoded chart data |

### Cluster 4: Transactions
| Element | Screen | Action Status | Data Status |
| :--- | :--- | :--- | :--- |
| **"Buy" / "Sell" Buttons** | `OrderIntent.tsx` | Dead (UI only) | Hardcoded |
| **Amount Input** | `OrderIntent.tsx` | Dead | N/A |
| **"Review Order"** | `OrderIntent.tsx` | Dead (No backend logic) | N/A |

### Cluster 5: Profile & Settings
| Element | Screen | Action Status | Data Status |
| :--- | :--- | :--- | :--- |
| **"Edit Profile"** | `ProfileSettings.tsx` | Missing / Dead | Hardcoded |
| **"Add Nominee"** | `AddNominee.tsx` | Dead | Hardcoded |
| **2FA / Biometric Toggles** | `SecuritySettings.tsx`| Dead (No API call) | Local state only |
| **Notification Toggles** | `NotificationPreferences`| Dead (No API call) | Local state only |

### Cluster 6: Trust & Compliance
| Element | Screen | Action Status | Data Status |
| :--- | :--- | :--- | :--- |
| **"Report Scam" Submit** | `ReportScam.tsx` | Dead (UI only) | N/A |
| **"Upload Image" (Scam)** | `ScamChecker.tsx` | Dead (UI only) | N/A |
| **URL Input (Scam Checker)** | `ScamChecker.tsx` | Dead (UI only) | N/A |

### Cluster 7: AI / Twin
| Element | Screen | Action Status | Data Status |
| :--- | :--- | :--- | :--- |
| **Chat Input Area** | `AiChatAssistant.tsx` | Dead (No onChange/value) | Hardcoded chat |
| **Send Button** | `AiChatAssistant.tsx` | Dead (No onClick) | Hardcoded |
| **Upload Image Button** | `AiChatAssistant.tsx` | Missing | N/A |

### Cluster 8: Alerts
| Element | Screen | Action Status | Data Status |
| :--- | :--- | :--- | :--- |
| **Notification List** | `SafetyNotifications.tsx` | Functional (Navigates) | Hardcoded |
| **"Mark all as read"** | `SafetyNotifications.tsx` | Dead | N/A |

### Cluster 9: Learning / Simulator
| Element | Screen | Action Status | Data Status |
| :--- | :--- | :--- | :--- |
| **"Start Course"** | `LearningHub.tsx` | Dead | Hardcoded |
| **"Adjust Sliders"** | `Simulator.tsx` | Dead | Hardcoded |

> [!IMPORTANT]
> **Awaiting Go-Ahead:** This concludes STAGE A. The audit reveals that the vast majority of the UI is visually complete but structurally disconnected from the backend (dead states, missing inputs, fake forms). Please review the audit table. Once you approve, I will proceed to **STAGE B** starting with Cluster 1, and eventually tackle the AI Multimodal Chat fix in **STAGE C**.
