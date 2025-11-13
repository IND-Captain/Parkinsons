import React from 'react';

const TermsOfServiceSection = () => {
  return (
    <section id="terms" className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Terms of Service</h2>
        <div className="prose dark:prose-invert max-w-4xl mx-auto">
          <p>
            By using this tool, you agree that it is for informational and educational purposes only. It does not provide medical advice.
          </p>
          <p>
            You agree not to hold Parkinson's AI liable for any decisions you make based on the results of this screening tool. Always consult with a qualified healthcare professional for any health concerns.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfServiceSection;