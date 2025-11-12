'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  ArrowRight,
  Play,
  Calendar,
  Users,
  Award,
  Globe
} from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Handle newsletter subscription
      console.log('Subscribing:', email)
      setEmail('')
      // Show success message
    }
  }

  const features = [
    {
      icon: <Award className="h-6 w-6 text-blue-600" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning for accurate voice analysis"
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: "Trusted by Professionals",
      description: "Used by healthcare providers worldwide"
    },
    {
      icon: <Globe className="h-6 w-6 text-purple-600" />,
      title: "Global Reach",
      description: "Available in 8+ languages with cultural adaptation"
    }
  ]

  const quickLinks = [
    { name: "About Parkinson's", href: "#about" },
    { name: "How It Works", href: "#how" },
    { name: "Research", href: "#research" },
    { name: "Clinical Studies", href: "#studies" },
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Service", href: "#terms" }
  ]

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#", label: "LinkedIn" },
    { icon: <Instagram className="h-5 w-5" />, href: "#", label: "Instagram" },
    { icon: <Youtube className="h-5 w-5" />, href: "#", label: "YouTube" }
  ]

  return (
    <footer className="bg-muted/50 border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-lg font-bold">🎙️</span>
              </div>
              <span className="font-bold text-xl">Parkinson's AI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering early detection of Parkinson's disease through advanced voice analysis and AI technology. 
              Making healthcare accessible to everyone, everywhere.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                  asChild
                >
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    {link.name}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Why Choose Us</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Get the latest research updates and Parkinson's detection insights.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Video Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Educational Videos</h3>
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop" 
                    alt="Parkinson's Awareness"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Button size="lg" className="rounded-full">
                      <Play className="h-6 w-6 ml-1" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold">Understanding Parkinson's Disease</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Learn about early symptoms, diagnosis, and the importance of voice analysis in detection.
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    15 min watch • 2.3K views
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  <img 
                    src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop" 
                    alt="Voice Analysis Technology"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Button size="lg" className="rounded-full">
                      <Play className="h-6 w-6 ml-1" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold">How Voice Analysis Works</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Discover the technology behind our AI-powered voice analysis system.
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    8 min watch • 1.8K views
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Research & Impact</h3>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">50,000+ Users</h4>
                      <p className="text-sm text-muted-foreground">
                        People worldwide using our platform for early Parkinson's screening
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">92% Accuracy</h4>
                      <p className="text-sm text-muted-foreground">
                        Clinical validation studies show high accuracy in early detection
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Globe className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">25+ Countries</h4>
                      <p className="text-sm text-muted-foreground">
                        Global reach with localized language and cultural adaptation
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 border-t pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-semibold">Research Center</h4>
                <p className="text-sm text-muted-foreground">
                  123 Medical Drive<br />
                  Boston, MA 02115<br />
                  United States
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-semibold">Contact Us</h4>
                <p className="text-sm text-muted-foreground">
                  Phone: +1 (555) 123-4567<br />
                  Email: info@parkinsons-ai.com<br />
                  24/7 Support Available
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-semibold">Research Partnerships</h4>
                <p className="text-sm text-muted-foreground">
                  Interested in collaborating?<br />
                  research@parkinsons-ai.com<br />
                  Join our global research network
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 Parkinson's AI. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <a href="#privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for better healthcare</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}