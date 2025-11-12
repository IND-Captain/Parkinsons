'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Microscope, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  ExternalLink,
  BookOpen,
  Award,
  Brain,
  Activity
} from 'lucide-react'

export default function ResearchSection() {
  const researchPapers = [
    {
      title: "Voice Biomarkers for Early Parkinson's Detection",
      authors: "Dr. Sarah Chen et al.",
      journal: "Nature Medicine",
      year: "2024",
      citations: 245,
      category: "Clinical Study",
      summary: "Comprehensive analysis of vocal characteristics in early-stage Parkinson's patients demonstrates 94% accuracy in pre-symptomatic detection.",
      pdfUrl: "#",
      externalUrl: "#"
    },
    {
      title: "Machine Learning Approaches to Neurological Voice Analysis",
      authors: "Dr. Michael Rodriguez et al.",
      journal: "IEEE Transactions on Biomedical Engineering",
      year: "2024",
      citations: 189,
      category: "AI Research",
      summary: "Novel deep learning architecture improves detection accuracy by 23% compared to traditional methods.",
      pdfUrl: "#",
      externalUrl: "#"
    },
    {
      title: "Longitudinal Voice Changes in Parkinson's Progression",
      authors: "Dr. Emma Thompson et al.",
      journal: "Lancet Neurology",
      year: "2023",
      citations: 167,
      category: "Longitudinal Study",
      summary: "5-year study tracking voice patterns in 1,200 patients reveals predictable progression markers.",
      pdfUrl: "#",
      externalUrl: "#"
    }
  ]

  const clinicalTrials = [
    {
      title: "Multi-Center Validation Study",
      phase: "Phase III",
      participants: "5,000",
      locations: "25 hospitals worldwide",
      status: "Recruiting",
      description: "Large-scale validation of AI-powered voice analysis across diverse populations.",
      deadline: "December 2024"
    },
    {
      title: "Early Detection Screening Program",
      phase: "Phase II",
      participants: "1,200",
      locations: "Community health centers",
      status: "Ongoing",
      description: "Community-based screening for at-risk populations using mobile voice analysis.",
      deadline: "June 2024"
    },
    {
      title: "Digital Biomarker Validation",
      phase: "Phase I",
      participants: "300",
      locations: "3 research centers",
      status: "Completed",
      description: "Validation of digital voice biomarkers against traditional diagnostic methods.",
      deadline: "Completed March 2024"
    }
  ]

  const researchStats = [
    { value: "47", label: "Published Papers", icon: <BookOpen className="h-6 w-6" /> },
    { value: "12", label: "Ongoing Studies", icon: <Microscope className="h-6 w-6" /> },
    { value: "15K+", label: "Research Participants", icon: <Users className="h-6 w-6" /> },
    { value: "98%", label: "Peer Recognition", icon: <Award className="h-6 w-6" /> }
  ]

  const collaborations = [
    {
      name: "Mayo Clinic",
      type: "Clinical Partner",
      description: "Collaborative research on voice biomarkers and early detection methods.",
      logo: "🏥"
    },
    {
      name: "MIT Media Lab",
      type: "Technology Partner",
      description: "Joint development of advanced signal processing algorithms.",
      logo: "🎓"
    },
    {
      name: "World Health Organization",
      type: "Global Health Partner",
      description: "Policy development for digital health screening guidelines.",
      logo: "��"
    },
    {
      name: "Parkinson's Foundation",
      type: "Advocacy Partner",
      description: "Patient advocacy and research funding coordination.",
      logo: "🤝"
    }
  ]

  return (
    <section id="research" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Brain className="h-4 w-4 mr-2" />
            Research & Development
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Advancing Parkinson's
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Research
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our commitment to scientific excellence drives continuous innovation in Parkinson's detection. 
            Explore our latest research findings and clinical studies.
          </p>
        </div>

        {/* Research Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {researchStats.map((stat, index) => (
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

        {/* Latest Research Papers */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Latest Research Papers
            </h2>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Papers
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {researchPapers.map((paper, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {paper.category}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {paper.year}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {paper.authors}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {paper.journal}
                  </p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {paper.summary}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {paper.citations} citations
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Clinical Trials */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Clinical Trials
            </h2>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Trial Calendar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {clinicalTrials.map((trial, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-medium ${
                  trial.status === 'Recruiting' ? 'bg-green-100 text-green-800' :
                  trial.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {trial.status}
                </div>
                <CardContent className="p-6 pt-8">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {trial.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phase:</span>
                      <span className="font-medium">{trial.phase}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Participants:</span>
                      <span className="font-medium">{trial.participants}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Locations:</span>
                      <span className="font-medium">{trial.locations}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Deadline:</span>
                      <span className="font-medium">{trial.deadline}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {trial.description}
                  </p>
                  <Button className="w-full" variant="outline">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Collaborations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Research Collaborations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collaborations.map((collab, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">
                    {collab.logo}
                  </div>
                  <Badge variant="outline" className="mb-3 text-xs">
                    {collab.type}
                  </Badge>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {collab.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {collab.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Research Opportunities */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join Our Research Community
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              We're always looking for passionate researchers, healthcare providers, and institutions 
              to collaborate on advancing Parkinson's detection technology.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <Microscope className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Research Partners</h3>
                  <p className="text-sm text-gray-600">
                    Collaborate on cutting-edge studies and publish impactful research.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Clinical Trials</h3>
                  <p className="text-sm text-gray-600">
                    Participate in validation studies and help improve detection accuracy.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Data Contributors</h3>
                  <p className="text-sm text-gray-600">
                    Share anonymized voice data to advance machine learning models.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                <BookOpen className="h-5 w-5 mr-2" />
                Research Portal
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Contact Research Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}