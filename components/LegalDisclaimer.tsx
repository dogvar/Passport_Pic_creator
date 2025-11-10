import React from 'react';

const LegalDisclaimer: React.FC = () => {
  return (
    <div className="mt-4 text-center text-xs text-gray-500 p-4 border-t border-gray-800">
      <h4 className="font-bold text-gray-400">User Responsibility</h4>
      <p className="mt-1 max-w-lg mx-auto">
        You are solely responsible for the images you upload and the content you generate. By using this service, you agree not to create or share content that infringes on any laws or third-party rights. 
        This tool is designed to assist you in creating photos that meet common requirements, but it is not a guaranteed compliance service. It is your responsibility to verify that the final photo meets the specific and current requirements of the official authority (e.g., government agency, embassy) to which you are submitting it.
        Ensure you have the necessary permissions for any content you use.
      </p>
    </div>
  );
};

export default LegalDisclaimer;
