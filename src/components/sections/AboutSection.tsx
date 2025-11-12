'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Brain, 
  Users, 
  Globe, 
  Shield, 
  Zap,
  Award,
  Target,
  Lightbulb
} from 'lucide-react'

export default function AboutSection() {
  const stats = [
    { value: "10M+", label: "Lives Impacted", icon: <Heart className="h-8 w-8" /> },
    { value: "50K+", label: "Daily Users", icon: <Users className="h-8 w-8" /> },
    { value: "95%", label: "Accuracy Rate", icon: <Target className="h-8 w-8" /> },
    { value: "25+", label: "Countries", icon: <Globe className="h-8 w-8" /> }
  ]

  const features = [
    {
      icon: <Brain className="h-12 w-12 text-blue-600" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze voice patterns for early Parkinson's detection with industry-leading accuracy.",
      badge: "Machine Learning"
    },
    {
      icon: <Shield className="h-12 w-12 text-green-600" />,
      title: "Privacy First",
      description: "All voice analysis happens locally in your browser. No recordings are stored or shared with anyone.",
      badge: "100% Private"
    },
    {
      icon: <Zap className="h-12 w-12 text-yellow-600" />,
      title: "Instant Results",
      description: "Get comprehensive analysis in seconds, not days. Fast, reliable screening whenever you need it.",
      badge: "Real-time"
    },
    {
      icon: <Globe className="h-12 w-12 text-purple-600" />,
      title: "Global Accessibility",
      description: "Available in 8+ languages with culturally adapted interfaces for diverse populations worldwide.",
      badge: "Multilingual"
    }
  ]

  const missionPoints = [
    {
      title: "Early Detection Saves Lives",
      description: "Parkinson's disease often goes undiagnosed until significant progression. Our voice analysis can detect early signs, enabling timely intervention and better outcomes.",
      icon: <Lightbulb className="h-6 w-6 text-blue-500" />
    },
    {
      title: "Democratizing Healthcare",
      description: "Making advanced screening technology accessible to everyone, regardless of location, income, or access to specialist care.",
      icon: <Award className="h-6 w-6 text-green-500" />
    },
    {
      title: "Continuous Innovation",
      description: "Our research team constantly improves algorithms based on the latest medical research and user feedback.",
      icon: <Brain className="h-6 w-6 text-purple-500" />
    }
  ]

  return (
    <section id="about" className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            🏆 Award-Winning Technology
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Revolutionizing Parkinson's
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Early Detection
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Harnessing the power of artificial intelligence and voice analysis to detect Parkinson's disease 
            earlier than ever before. Join thousands who trust our technology for proactive health monitoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Start Free Analysis
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Mission: Early Detection for All
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We believe everyone deserves access to early Parkinson's detection. Our AI-powered platform 
              makes it possible to screen for early signs from anywhere, at any time.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {missionPoints.map((point, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {point.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {point.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 lg:p-12">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands who use our platform for proactive Parkinson's screening. 
                It's free, private, and takes just 5 minutes.
              </p>
              <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-blue-600 hover:bg-gray-100">
                Start Your Analysis Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}