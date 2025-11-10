
import React from 'react';

const PrivacyNotice: React.FC = () => {
  return (
    <div className="mt-8 text-center text-xs text-gray-500 p-4 border-t border-gray-800">
      <h4 className="font-bold text-gray-400">Your Privacy is Important</h4>
      <p className="mt-1 max-w-md mx-auto">
        We do not store your images. All processing is done in-session, and your photos are permanently deleted after you download your result or leave the page.
      </p>
    </div>
  );
};

export default PrivacyNotice;
