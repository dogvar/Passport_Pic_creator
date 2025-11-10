import React, { useState } from 'react';
import Header from './components/Header';
import Toggle from './components/Toggle';
import PassportPhotoConverter from './features/passport/PassportPhotoConverter';
import PortraitGenerator from './features/portrait/PortraitGenerator';
import PrivacyNotice from './components/PrivacyNotice';
import LegalDisclaimer from './components/LegalDisclaimer';
import { FeatureMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<FeatureMode>('passport');

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
          <Header />
          <Toggle currentMode={mode} onModeChange={setMode} />
          
          <div className="w-full bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700">
            {mode === 'passport' ? (
              <PassportPhotoConverter />
            ) : (
              <PortraitGenerator />
            )}
          </div>

          <PrivacyNotice />
          <LegalDisclaimer />
        </div>
      </main>
    </div>
  );
};

export default App;