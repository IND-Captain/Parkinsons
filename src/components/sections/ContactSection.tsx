import React from 'react';

const ContactSection = () => {
  return (
    <section id="contact" className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <div className="prose dark:prose-invert max-w-4xl mx-auto text-center">
          <p>
            For inquiries, please reach out to us at contact@parkinsons-ai.com.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;