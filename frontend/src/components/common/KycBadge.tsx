import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

export function KycBadge() {
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase.from('users').select('kyc_status').eq('id', user.id).single();
      if (data) {
        setKycStatus(data.kyc_status);
      }
    }
    
    fetchStatus();
  }, []);

  if (!kycStatus) return null;

  switch (kycStatus) {
    case 'complete':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
          <CheckCircle2 size={14} />
          <span className="font-label-sm">KYC Verified</span>
        </div>
      );
    case 'pending':
    case 'pending_video_review':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
          <Clock size={14} />
          <span className="font-label-sm">KYC Pending</span>
        </div>
      );
    case 'rejected':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-600 rounded-full border border-red-500/20">
          <XCircle size={14} />
          <span className="font-label-sm">KYC Rejected</span>
        </div>
      );
    case 'not_started':
    default:
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-variant text-on-surface-variant rounded-full border border-outline-variant">
          <AlertCircle size={14} />
          <span className="font-label-sm">KYC Incomplete</span>
        </div>
      );
  }
}
