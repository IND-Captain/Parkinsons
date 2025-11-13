import React from 'react';

const ResearchSection = () => {
  return (
    <section id="research" className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Our Research</h2>
        <div className="prose dark:prose-invert max-w-4xl mx-auto text-center">
          <p>
            Our model is based on peer-reviewed studies that have identified vocal biomarkers associated with Parkinson's disease. We continuously work to improve its accuracy and reliability.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResearchSection;