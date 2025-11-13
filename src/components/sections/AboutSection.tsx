import React from 'react';

const AboutSection = () => {
  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">About This Tool</h2>
        <div className="prose dark:prose-invert max-w-4xl mx-auto text-center">
          <p>
            This tool utilizes advanced machine learning algorithms to analyze voice patterns for early indicators of Parkinson's disease.
          </p>
          <p>
            It is designed as an educational and preliminary screening tool. It is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;