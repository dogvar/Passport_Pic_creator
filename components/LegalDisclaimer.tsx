import React from 'react';

const LegalDisclaimer: React.FC = () => {
  return (
    <div className="mt-4 text-center text-xs text-gray-500 p-4 border-t border-gray-800">
      <h4 className="font-bold text-gray-400">User Responsibility</h4>
      <p className="mt-1 max-w-lg mx-auto">
        You are solely responsible for the images you upload and the content you generate. By using this service, you agree not to create or share content that infringes on any laws or third-party rights. Ensure you have the necessary permissions for any content you use.
      </p>
    </div>
  );
};

export default LegalDisclaimer;
