import React from 'react';

const PrivacyPolicySection = () => {
  return (
    <section id="privacy" className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Privacy Policy</h2>
        <div className="prose dark:prose-invert max-w-4xl mx-auto">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>
            Your privacy is important to us. It is Parkinson's AI's policy to respect your privacy regarding any
            information we may collect from you across our website.
          </p>
          <h3>Information We Collect</h3>
          <p>
            The only personal data we collect is the voice recording you voluntarily provide for analysis. This recording is processed in memory and is not stored on our servers after the analysis is complete. We do not ask for any other personally identifiable information.
          </p>
          <h3>Use of Information</h3>
          <p>
            The voice data is used solely for the purpose of running the AI model to provide an educational screening result. The data is not used for any other purpose, is not shared with third parties, and is not used to train our models.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicySection;