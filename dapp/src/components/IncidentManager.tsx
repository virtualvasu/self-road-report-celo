// import { useState } from 'react';

import { useState } from 'react';
import ProjectIntroPage from './ProjectIntroPage';
import LandingPage from './LandingPage';
import IncidentWizard from './IncidentWizard';
import IncidentDashboard from './IncidentDashboard';
import RewardsTracker from './RewardsTracker';

type AppMode = 'intro' | 'landing' | 'report' | 'dashboard' | 'rewards';

export default function IncidentManager() {
  const [mode, setMode] = useState<AppMode>('intro');

  if (mode === 'intro') {
    return <ProjectIntroPage onContinue={() => setMode('landing')} />;
  }

  if (mode === 'landing') {
    return (
      <LandingPage
        onReportIncident={() => setMode('report')}
        onViewDashboard={() => setMode('dashboard')}
        onViewRewards={() => setMode('rewards')}
      />
    );
  }

  if (mode === 'report') {
    return <IncidentWizard onBackToHome={() => setMode('landing')} />;
  }

  if (mode === 'dashboard') {
    return <IncidentDashboard onBack={() => setMode('landing')} />;
  }

  if (mode === 'rewards') {
    return <RewardsTracker onBack={() => setMode('landing')} />;
  }

  return null;
}