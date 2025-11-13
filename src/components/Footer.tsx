'use client'

import { Brain, Users, Globe, Twitter, Linkedin, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FooterProps {
  onSectionChange: (section: string) => void;
}

export default function Footer({ onSectionChange }: FooterProps) {
  const quickLinks = [
    { label: "About Parkinson's", section: 'about' },
    { label: "How It Works", section: 'about' }, // Points to about section
    { label: "Research", section: 'research' },
    { label: "Clinical Studies", section: 'research' }, // Points to research
    { label: "Contact Us", section: 'contact' },
    // Assuming Privacy and Terms are external links or separate pages
    { label: "Privacy Policy", section: '#' },
    { label: "Terms of Service", section: '#' }
  ]

  const whyChooseUs = [
    {
      icon: <Brain className="h-6 w-6 text-blue-500" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning for accurate voice analysis"
    },
    {
      icon: <Users className="h-6 w-6 text-green-500" />,
      title: "Trusted by Professionals",
      description: "Used by healthcare providers worldwide"
    },
    {
      icon: <Globe className="h-6 w-6 text-purple-500" />,
      title: "Global Reach",
      description: "Available in 8+ languages with cultural adaptation"
    }
  ]

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Parkinson's AI</h2>
            </div>
            <p className="text-sm leading-relaxed">
              Empowering early detection of Parkinson's disease through advanced voice analysis and AI technology. Making healthcare accessible to everyone, everywhere.
            </p>
            <div className="flex space-x-6 mt-4">
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <button 
                    onClick={() => link.section !== '#' && onSectionChange(link.section)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Why Choose Us */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Why Choose Us</h3>
            <ul className="space-y-4 text-sm">
              {whyChooseUs.map(item => (
                <li key={item.title} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{item.icon}</div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
                    <p className="text-xs">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay Updated */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Stay Updated</h3>
            <p className="text-sm mb-4">Get the latest research updates and Parkinson's detection insights.</p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Copyright and Social Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Parkinson's AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}