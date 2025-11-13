'use client'

import React, { useState, useRef, useEffect, useCallback, Suspense, lazy } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mic, MicOff, Play, Pause, Download, Info, AlertTriangle, CheckCircle, TestTube2, HelpCircle, LayoutDashboard, UserCog, Settings, LogOut, MoveRight, PhoneCall } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer' 
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Hero } from "@/components/ui/animated-hero";
import { BackgroundPaths } from "@/components/ui/background-paths";

// A simple, self-contained Progress component to replace the problematic one.
const Progress = ({ value, className }: { value?: number; className?: string }) => {
  const progressValue = value ?? 100; // Default to 100% for indeterminate state
  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full bg-primary/20 ${className || ''}`}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{
          transform: `translateX(-${100 - progressValue}%)`,
          // For indeterminate state, add a simple animation
          animation: value === undefined ? 'indeterminate-progress 1.5s infinite linear' : 'none',
        }}
      />
    </div>
  );
};

interface SelfCheckState {
  hasCold: boolean;
  isTired: boolean;
  isStressed: boolean;
}

interface PredictionResult {
  prediction: number // 0 = Healthy, 1 = Parkinson's Risk
  confidence: number // 0-100%
  features?: any
  timestamp: string
  quality_report?: any
  risk_factors?: string[]
  recommendations?: string[]
  detailed_analysis?: {
    voice_quality_score: number
    neurological_indicators: string[]
    severity_assessment: 'low' | 'moderate' | 'high'
  }
}

interface AudioFeatures {
  pitch_mean: number
  pitch_std: number
  mfccs: number[]
  jitter: number
  shimmer: number
  zcr: number
  spectral_centroid: number
  hnr: number
}

const translations = {
  en: {
    title: "🎙️ Parkinson's Disease Early Detection Tool",
    subtitle: "Early voice-based screening for Parkinson's disease",
    recordButton: "Start Recording",
    stopButton: "Stop Recording",
    clearButton: "Clear Recording",
    playbackButton: "Play Recording",
    analyzing: "Analyzing your voice...",
    recording: "Recording... Speak clearly",
    resultsHealthy: "✅ Likely Healthy",
    resultsRisk: "⚠️ At Risk",
    confidence: "Confidence",
    disclaimer: "This tool is for educational purposes only and should not replace professional medical diagnosis.",
    privacy: "Your recording is only used for this analysis and is not saved.",
    instructions: "Click 'Start Recording' and speak clearly for 5-15 seconds. The system will analyze your voice patterns.",
    aboutTitle: "About Parkinson's Disease",
    howItWorks: "How It Works",
    faq: "FAQ",
    voiceQualityScore: "Voice Quality Score",
    riskFactors: "Identified Risk Factors",
    recommendations: "Recommendations",
    voiceFeaturesAnalysis: "Voice Features Analysis",
    downloadResults: "Download Results",
    pitchMean: "Pitch Mean",
    pitchStd: "Pitch Std",
    jitter: "Jitter",
    shimmer: "Shimmer",
    hnr: "HNR",
    zcr: "ZCR",
    severity: "Severity",
    analyzeVoice: "Analyze Voice",
    recordingTooShort: "Recording too short",
    recordingStarted: "Recording started",
    analysisComplete: "Analysis complete",
    analysisFailed: "Analysis failed",
    couldNotAccessMicrophone: "Could not access microphone. Please check permissions.",
    pleaseRecordForAtLeast3Seconds: "Please record for at least 3 seconds.",
    pleaseSpeakClearlyAndCheckYourMicrophone: "Audio is too quiet or silent. Please speak clearly and check your microphone.",
    couldNotAnalyzeYourRecordingPleaseTryAgain: "Could not analyze your recording. Please try again.",
    yourVoiceHasBeenAnalyzedSuccessfully: "Your voice has been analyzed successfully.",
    recordYourVoiceToSeeAnalysisResults: "Record your voice to see analysis results",
    textToRead: "Please read the following passage clearly: 'When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors.'",
    recordingTips: "For best results: Find a quiet room, speak clearly at a consistent volume, and stay about 6 inches from your microphone.",
    helpPopupTitle: "Recording Tips",
    selfCheckTitle: "Quick Self-Check",
    selfCheckDescription: "How are you feeling today? This helps provide context for the results.",
    selfCheckOptions: ["I have a cold/sore throat", "I'm feeling tired", "I'm feeling stressed"],
    testMicrophone: "Test Microphone",
    testingMicrophone: "Testing... Please wait",
    micTestSuccess: "Microphone test successful!",
    micTestFailed: "Microphone test failed",
    qualityScore: "Audio Quality Score",
    snr: "Signal-to-Noise Ratio (dB)",
    amplitude: "Peak Amplitude",
    historyAndComparison: "History & Comparison",
    downloadPDF: "Download PDF Report"
  },
  hi: {
    title: "🎙️ पार्किंसंस रोग का प्रारंभिक पता लगाने का उपकरण",
    subtitle: "पार्किंसंस रोग के लिए आवाज-आधारित प्रारंभिक स्क्रीनिंग",
    recordButton: "रिकॉर्डिंग शुरू करें",
    stopButton: "रिकॉर्डिंग रोकें",
    clearButton: "रिकॉर्डिंग हटाएं",
    playbackButton: "रिकॉर्डिंग चलाएं",
    analyzing: "आपकी आवाज का विश्लेषण किया जा रहा है...",
    recording: "रिकॉर्डिंग... स्पष्ट रूप से बोलें",
    resultsHealthy: "✅ संभवतः स्वस्थ",
    resultsRisk: "⚠️ जोखिम में",
    confidence: "विश्वास",
    disclaimer: "यह उपकरण केवल शैक्षिक उद्देश्यों के लिए है और पेशेवर चिकित्सा निदान की जगह नहीं लेना चाहिए।",
    privacy: "आपकी रिकॉर्डिंग का उपयोग केवल इस विश्लेषण के लिए किया जाता है और इसे सहेजा नहीं जाता है।",
    instructions: "'रिकॉर्डिंग शुरू करें' पर क्लिक करें और 5-15 सेकंड के लिए स्पष्ट रूप से बोलें। सिस्टम आपके आवाज के पैटर्न का विश्लेषण करेगा।",
    aboutTitle: "पार्किंसंस रोग के बारे में",
    howItWorks: "यह कैसे काम करता है",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    voiceQualityScore: "आवाज गुणवत्ता स्कोर",
    riskFactors: "पहचाने गए जोखिम कारक",
    recommendations: "सिफारिशें",
    voiceFeaturesAnalysis: "आवाज विशेषताएं विश्लेषण",
    downloadResults: "परिणाम डाउनलोड करें",
    pitchMean: "पिच माध्य",
    pitchStd: "पिच मानक विचलन",
    jitter: "जिटर",
    shimmer: "शिमर",
    hnr: "एचएनआर",
    zcr: "जेडसीआर",
    severity: "गंभीरता",
    analyzeVoice: "आवाज का विश्लेषण करें",
    recordingTooShort: "रिकॉर्डिंग बहुत छोटी",
    recordingStarted: "रिकॉर्डिंग शुरू हो गई",
    analysisComplete: "विश्लेषण पूर्ण",
    analysisFailed: "विश्लेषण विफल",
    couldNotAccessMicrophone: "माइक्रोफोन तक पहुंच नहीं सका। कृपया अनुमतियां जांचें।",
    pleaseRecordForAtLeast3Seconds: "कृपया कम से कम 3 सेकंड के लिए रिकॉर्ड करें।",
    pleaseSpeakClearlyAndCheckYourMicrophone: "ऑडियो बहुत कम या मौन है। कृपया स्पष्ट रूप से बोलें और अपना माइक्रोफोन जांचें।",
    couldNotAnalyzeYourRecordingPleaseTryAgain: "आपकी रिकॉर्डिंग का विश्लेषण नहीं किया जा सका। कृपया फिर से कोशिश करें।",
    yourVoiceHasBeenAnalyzedSuccessfully: "आपकी आवाज का सफलतापूर्वक विश्लेषण किया गया है।",
    recordYourVoiceToSeeAnalysisResults: "विश्लेषण परिणाम देखने के लिए अपनी आवाज रिकॉर्ड करें",
    textToRead: "कृपया निम्नलिखित गद्यांश को स्पष्ट रूप से पढ़ें: 'जब सूरज की रोशनी हवा में बारिश की बूंदों से टकराती है, तो वे एक प्रिज्म के रूप में काम करती हैं और एक इंद्रधनुष बनाती हैं। इंद्रधनुष सफेद प्रकाश का कई सुंदर रंगों में विभाजन है।'",
    recordingTips: "सर्वोत्तम परिणामों के लिए: एक शांत कमरा खोजें, स्पष्ट रूप से एक समान आवाज में बोलें, और अपने माइक्रोफोन से लगभग 6 इंच की दूरी पर रहें।",
    helpPopupTitle: "रिकॉर्डिंग टिप्स",
    selfCheckTitle: "त्वरित स्व-जांच",
    selfCheckDescription: "आज आप कैसा महसूस कर रहे हैं? यह परिणामों की व्याख्या करने में मदद करता है।",
    selfCheckOptions: ["मुझे सर्दी/गले में खराश है", "मैं थका हुआ महसूस कर रहा हूं", "मैं तनावग्रस्त महसूस कर रहा हूं"],
    testMicrophone: "माइक्रोफोन का परीक्षण करें",
    testingMicrophone: "परीक्षण हो रहा है... कृपया प्रतीक्षा करें",
    micTestSuccess: "माइक्रोफोन परीक्षण सफल!",
    micTestFailed: "माइक्रोफोन परीक्षण विफल",
    qualityScore: "ऑडियो गुणवत्ता स्कोर",
    snr: "सिग्नल-टू-नॉइज़ अनुपात (dB)",
    amplitude: "पीक एम्प्लिट्यूड",
    historyAndComparison: "इतिहास और तुलना",
    downloadPDF: "पीडीएफ रिपोर्ट डाउनलोड करें"
  }
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Acet Labs
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

// Dummy dashboard component with content
const Dashboard = ({ history, t }: { history: PredictionResult[], t: any }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No History Yet</h3>
          <p>Your analysis results will appear here after you record your voice.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-4">Session History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between text-lg ${result.prediction === 1 ? 'text-red-500' : 'text-green-500'}`}>
                <span>{result.prediction === 1 ? t.resultsRisk : t.resultsHealthy}</span>
                <Badge variant={result.prediction === 1 ? 'destructive' : 'default'}>
                  {result.confidence.toFixed(0)}% {t.confidence}
                </Badge>
              </CardTitle>
              <CardDescription>
                {new Date(result.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p><strong>{t.voiceQualityScore}:</strong> {result.detailed_analysis?.voice_quality_score.toFixed(0)}%</p>
                <p><strong>{t.severity}:</strong> <span className="capitalize">{result.detailed_analysis?.severity_assessment}</span></p>
              </div>
            </CardContent>
          </Card>
          ))}
      </div>
    </div>
  );
};

export default function ParkinsonsDetectionApp() {
  const [activeSection, setActiveSection] = useState('home')
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)  
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [features, setFeatures] = useState<AudioFeatures | null>(null)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [selfCheck, setSelfCheck] = useState<SelfCheckState>({
    hasCold: false,
    isTired: false,
    isStressed: false,
  })
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<PredictionResult[]>([]);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showApp, setShowApp] = useState(false);
  
  // Lazy load sections to improve initial load time.
  const ResearchSection = lazy(() => import('@/components/sections/ResearchSection'));
  const ContactSection = () => (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <div className="max-w-2xl mx-auto">
          <p className="text-center mb-8 text-muted-foreground">
            Have questions or feedback? We'd love to hear from you. Fill out the form below or email us directly.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                For inquiries, please email us at: <a href="mailto:support@parkinsonsai.com" className="text-blue-500 hover:underline">support@parkinsonsai.com</a> or use the form below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your message..." rows={5} />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
  const PrivacyPolicySection = lazy(() => import('@/components/sections/PrivacyPolicySection'));
  const TermsOfServiceSection = lazy(() => import('@/components/sections/TermsOfServiceSection'));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  const onSectionChange = (section: string) => {
    setActiveSection(section);
    // You can add scrolling logic here if needed
  };

  const t = translations[language]

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "#",
      onClick: () => setShowApp(false),
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Voice Recording",
      href: "#",
      icon: (
        <TestTube2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Contact",
      href: "#",
      icon: (
        <PhoneCall className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  useEffect(() => {
    // Listen for language changes from navbar
    const handleLanguageChange = (e: any) => {
      setLanguage(e.detail)
    }
    
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioUrl])

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (isRecording) {
      // Animated waveform during recording
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      const sliceWidth = canvas.width / 100
      let x = 0
      
      for (let i = 0; i < 100; i++) {
        const y = canvas.height / 2 + Math.sin(i * 0.1 + Date.now() * 0.01) * 20 * Math.random()
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        
        x += sliceWidth
      }
      
      ctx.stroke()
      
      if (isRecording) {
        animationRef.current = requestAnimationFrame(drawWaveform)
      }
    } else if (waveformData.length > 0) {
      // Static waveform after recording
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      const sliceWidth = canvas.width / waveformData.length
      let x = 0
      
      waveformData.forEach((value, index) => {
        const y = canvas.height / 2 + (value - 128) * canvas.height / 256
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        
        x += sliceWidth
      })
      
      ctx.stroke()
    } else {
      // Placeholder waveform
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(0, canvas.height / 2)
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [isRecording, waveformData])

  useEffect(() => {
    drawWaveform()
  }, [drawWaveform])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Generate waveform data
        generateWaveform(blob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setResult(null)
      setFeatures(null)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 15) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

      toast({
        title: t.recordingStarted,
        description: language === 'hi' ? "कृपया 5-15 सेकंड के लिए स्पष्ट रूप से बोलें।" : "Please speak clearly for 5-15 seconds.",
      })
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: language === 'hi' ? "त्रुटि" : "Error",
        description: t.couldNotAccessMicrophone,
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (recordingTime < 3) {
        toast({
          title: language === 'hi' ? "रिकॉर्डिंग बहुत छोटी" : t.recordingTooShort,
          description: t.pleaseRecordForAtLeast3Seconds,
          variant: "destructive",
        })
        clearRecording()
      }
    }
  }

  const clearRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setRecordingTime(0)
    setResult(null)
    setFeatures(null)
    setWaveformData([])
  }

  const generateWaveform = async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer()
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      const rawData = audioBuffer.getChannelData(0)
      const samples = 500 // Number of samples to display
      const blockSize = Math.floor(rawData.length / samples)
      const filteredData: number[] = []
      
      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i
        let sum = 0
        
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j])
        }
        
        filteredData.push(sum / blockSize)
      }
      
      // Normalize to 0-255 range
      const multiplier = Math.pow(Math.max(...filteredData), -1)
      const normalizedData = filteredData.map(n => n * multiplier * 255)
      
      setWaveformData(normalizedData)
    } catch (error) {
      console.error('Error generating waveform:', error)
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const testMicrophone = async () => {
    setIsTestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const testBlob = new Blob(chunks, { type: 'audio/wav' });
        
        const formData = new FormData();
        formData.append('audio', testBlob, 'mic-test.wav');
        formData.append('language', language); // Add language to the request

        const response = await fetch('http://127.0.0.1:5001/test_mic', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Microphone test failed.');
        }

        toast({
          title: t.micTestSuccess,
          description: `${data.message} (${t.qualityScore}: ${data.quality_score}, SNR: ${data.snr} dB)`,
        });
        setIsTestingMic(false);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 3000); // 3-second test recording

    } catch (error) {
      console.error('Mic test error:', error);
      toast({
        title: t.micTestFailed,
        description: (error as Error).message || 'Could not perform microphone test.',
        variant: 'destructive',
      });
      setIsTestingMic(false);
    }
  };

  const analyzeRecording = async () => {
    if (!audioBlob) return

    setIsAnalyzing(true)
    try {
      // First, extract features from the audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('language', language)
      
      // Send audio to Python server for processing and prediction
      const predictionResponse = await fetch('http://127.0.0.1:5001/process_and_predict', {
        method: 'POST',
        body: formData,
      })

      if (!predictionResponse.ok) {
        let errorCode = 'UNKNOWN_ERROR';
        let errorMessage = t.analysisFailed;

        try {
          const errorData = await predictionResponse.json();
          // Check for our new structured error format
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
            errorCode = errorData.error.code || errorCode;
          } else if (typeof errorData.error === 'string') {
            // Fallback for older, simple string errors
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Response was not JSON, use the status text
          errorMessage = predictionResponse.statusText;
        }
        // Throw a structured error object
        throw { code: errorCode, message: errorMessage };
      }

      const predictionData = await predictionResponse.json()
      
      setResult({
        prediction: predictionData.prediction,
        confidence: predictionData.confidence,
        quality_report: predictionData.quality_report,
        timestamp: new Date().toISOString(),
        // The following fields can be populated with more detailed info from the backend if needed
        risk_factors: predictionData.prediction === 1 ? ['Voice patterns match risk profile'] : [],
        recommendations: predictionData.prediction === 1 ? ['Consult a medical professional for a formal diagnosis.'] : ['Continue regular health monitoring.'],
        detailed_analysis: {
          voice_quality_score: 100 - (predictionData.confidence / 2),
          neurological_indicators: [],
          severity_assessment: predictionData.confidence > 75 ? 'high' : predictionData.confidence > 50 ? 'moderate' : 'low'
        }
      })

      // Add to session history (max 10 items)
      setSessionHistory(prev => [{
        ...predictionData,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);

      toast({
        title: language === 'hi' ? "विश्लेषण पूर्ण" : t.analysisComplete,
        description: t.yourVoiceHasBeenAnalyzedSuccessfully,
      })
    } catch (error) {
      console.error('Analysis error:', error)
      
      let title = t.analysisFailed;
      let description = t.couldNotAnalyzeYourRecordingPleaseTryAgain;

      // Handle the structured error
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const err = error as { message: string };
        // Use the error message if it's not empty, otherwise provide a fallback.
        description = err.message || 'The server is not responding. Please check if it is running.';
        // You could add more specific user messages based on the error code here
        // if ((error as { code: string }).code === 'POOR_AUDIO_QUALITY') { ... }
      }

      toast({
        title: title,
        description: description,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownload = async (format: 'pdf' | 'csv') => {
    try {
      const response = await fetch('http://127.0.0.1:5001/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, history: sessionHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'pdf' ? 'parkinsons_report.pdf' : 'parkinsons_history.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      toast({ title: 'Download Failed', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Render different sections based on activeSection
  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return null; // Handled by the main landing page view
      case 'contact':
        return <ContactSection />;
      case 'privacy':
        return <PrivacyPolicySection />
      case 'terms':
        return <TermsOfServiceSection />
      default:
        return <Dashboard history={sessionHistory} t={t} />; // Default to dashboard
    }
  };

  if (!showApp) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar 
          activeSection={activeSection} 
          onSectionChange={(section) => {
            if (section === 'dashboard' || section === 'voice-recording') setShowApp(true);
            else setActiveSection(section);
          }} 
        />
        <main className="flex-grow">
          <BackgroundPaths title="Early Detection for Parkinson's">
            <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
              <div className="z-10">
                <Button asChild variant="secondary" size="sm" className="gap-4">
                  <a href="https://www.parkinsons.org/blog/research/science-news" target="_blank" rel="noopener noreferrer">
                    Read our launch article <MoveRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              <div className="flex gap-4 flex-col">
                <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
                  Early Detection for
                  <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                    &nbsp;
                    <span className="font-semibold text-blue-500">Parkinson's</span>
                  </span>
                </h1>

                <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
                  Empowering early detection of Parkinson's disease through advanced voice analysis and AI technology. Making healthcare accessible to everyone, everywhere.
                </p>
              </div>
              <div className="flex flex-row gap-3">
                <Button size="lg" className="gap-4" variant="outline" onClick={() => onSectionChange('contact')}>
                  Contact Us <PhoneCall className="w-4 h-4" />
                </Button>
                <Button size="lg" className="gap-4" onClick={() => { setActiveSection('voice-recording'); setShowApp(true); }}>
                  Launch Tool <MoveRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </BackgroundPaths>
          <Suspense fallback={<div>Loading...</div>}>
            {activeSection !== 'recording' && renderSection()}
          </Suspense>
        </main>
        <Footer 
          onSectionChange={onSectionChange}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="mt-8 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "cursor-pointer",
                    activeSection === link.label.toLowerCase().replace(' ', '-') && "bg-neutral-100 dark:bg-neutral-700 rounded-lg"
                  )}
                  onClick={link.onClick ? link.onClick : () => setActiveSection(link.label.toLowerCase().replace(' ', '-'))}>
                  <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-grow">
          {activeSection === 'dashboard' && <Dashboard history={sessionHistory} t={t} />}
          {activeSection === 'voice-recording' && (
            <section id="recording" className="py-16">
              <div className="container mx-auto h-full px-4 sm:px-6 lg:px-8">
                <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-2">
                  <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      Voice Recording
                    </CardTitle>
                    <CardDescription>{t.instructions}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Waveform Visualization */}
                    <div className="w-full">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={100}
                        className="w-full h-24 border border-gray-200 rounded-lg bg-gray-50"
                      />
                    </div>

                    {/* Text to Read */}
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {t.textToRead}
                      </AlertDescription>
                    </Alert>

                    {/* Recording Tips Help Popup */}
                    {/* The Dialog component is causing multiple errors, temporarily disabled. */}

                    {/* Mic Test Button */}
                    <Button
                      onClick={testMicrophone}
                      variant="outline"
                      className="w-full"
                      disabled={isTestingMic || isRecording}
                    >
                      <TestTube2 className="h-4 w-4 mr-2" />
                      {isTestingMic ? t.testingMicrophone : t.testMicrophone}
                    </Button>

                    {/* Recording Controls */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex gap-2">
                        {!isRecording ? (
                          <Button
                            onClick={startRecording}
                            size="lg"
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <Mic className="h-4 w-4 mr-2" />
                            {t.recordButton}
                          </Button>
                        ) : (
                          <Button
                            onClick={stopRecording}
                            size="lg"
                            variant="destructive"
                          >
                            <MicOff className="h-4 w-4 mr-2" />
                            {t.stopButton}
                          </Button>
                        )}
                        
                        {audioUrl && (
                          <>
                            <Button
                              onClick={togglePlayback}
                              variant="outline"
                              size="lg"
                            >
                              {isPlaying ? (
                                <Pause className="h-4 w-4 mr-2" />
                              ) : (
                                <Play className="h-4 w-4 mr-2" />
                              )}
                              {t.playbackButton}
                            </Button>
                            
                            <Button
                              onClick={clearRecording}
                              variant="outline"
                              size="lg"
                            >
                              {t.clearButton}
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Recording Status */}
                      {isRecording && (
                        <div className="w-full space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-pulse">
                              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">{t.recording}</span>
                            <Badge variant="secondary">{formatTime(recordingTime)}</Badge>
                          </div>
                          <Progress value={(recordingTime / 15) * 100} className="w-full" />
                        </div>
                      )}

                      {/* Audio Player */}
                      {audioUrl && (
                        <audio
                          ref={audioRef}
                          src={audioUrl}
                          onEnded={() => setIsPlaying(false)}
                          className="w-full"
                          controls
                        />
                      )}

                      {/* Analyze Button */}
                      {audioUrl && !isAnalyzing && !result && (
                        <Button
                          onClick={analyzeRecording}
                          size="lg"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {t.analyzeVoice}
                        </Button>
                      )}

                      {/* Analyzing Status */}
                      {isAnalyzing && (
                        <div className="w-full space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin">
                              <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">{t.analyzing}</span>
                          </div>
                          <Progress className="w-full" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Results Section */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-4">
                        {/* Risk Status */}
                        <div className={`p-6 rounded-lg text-center ${
                          result.prediction === 0 
                            ? 'bg-green-50 border-2 border-green-200' 
                            : 'bg-red-50 border-2 border-red-200'
                        }`}>
                          <div className="text-2xl font-bold mb-2">
                            {result.prediction === 0 ? t.resultsHealthy : t.resultsRisk}
                          </div>
                          <div className="text-lg mb-2">
                            {t.confidence}: {result.confidence.toFixed(1)}%
                          </div>
                          {/* Progress bar temporarily disabled due to type errors */}
                          {/* <Progress value={result.confidence} className="mt-2 mb-2" /> */}
                          {result.detailed_analysis && (
                            <div className="text-sm text-gray-600">
                              {t.severity}: <span className="font-semibold capitalize">{result.detailed_analysis.severity_assessment}</span>
                            </div>
                          )}
                        </div>

                        {/* Voice Quality Score */}
                        {result.detailed_analysis && (
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">{t.voiceQualityScore}</h4>
                              <div className="flex items-center gap-2">
                                {/* Progress bar temporarily disabled due to type errors */}
                                {/* <Progress value={result.detailed_analysis.voice_quality_score} className="flex-1" /> */}
                                <span className="text-sm font-medium">{result.detailed_analysis.voice_quality_score.toFixed(0)}%</span>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Risk Factors */}
                        {result.risk_factors && result.risk_factors.length > 0 && (
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">{t.riskFactors}</h4>
                              <ul className="text-sm space-y-1">
                                {result.risk_factors.map((factor, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <span>{factor}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {/* Recommendations */}
                        {result.recommendations && result.recommendations.length > 0 && (
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">{t.recommendations}</h4>
                              <ul className="text-sm space-y-1">
                                {result.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {/* Feature Breakdown */}
                        {features && (
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">{t.voiceFeaturesAnalysis}:</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">{t.pitchMean}:</span> {features.pitch_mean.toFixed(2)} Hz
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">{t.pitchStd}:</span> {features.pitch_std.toFixed(2)} Hz
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">{t.jitter}:</span> {(features.jitter * 100).toFixed(3)}%
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">{t.shimmer}:</span> {(features.shimmer * 100).toFixed(3)}%
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">{t.hnr}:</span> {features.hnr.toFixed(2)} dB
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">{t.zcr}:</span> {features.zcr.toFixed(4)}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Download Results Button */}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            const resultsText = `
Parkinson's Voice Analysis Results
====================================
Date: ${new Date(result.timestamp).toLocaleString()}
Prediction: ${result.prediction === 0 ? 'Healthy' : 'At Risk'}
Confidence: ${result.confidence.toFixed(1)}%
Severity: ${result.detailed_analysis?.severity_assessment || 'N/A'}

Voice Quality Score: ${result.detailed_analysis?.voice_quality_score.toFixed(0)}%

Risk Factors:
${result.risk_factors?.map(f => `- ${f}`).join('\n') || 'None identified'}

Recommendations:
${result.recommendations?.map(r => `- ${r}`).join('\n') || 'None provided'}

Voice Features:
- Pitch Mean: ${features?.pitch_mean.toFixed(2)} Hz
- Pitch Std Dev: ${features?.pitch_std.toFixed(2)} Hz
- Jitter: ${((features?.jitter || 0) * 100).toFixed(3)}%
- Shimmer: ${((features?.shimmer || 0) * 100).toFixed(3)}%
- HNR: ${features?.hnr.toFixed(2)} dB
- ZCR: ${features?.zcr.toFixed(4)}
- Spectral Centroid: ${features?.spectral_centroid.toFixed(2)} Hz

Disclaimer: This analysis is for educational purposes only and should not replace professional medical diagnosis.
                            `.trim()

                            const blob = new Blob([resultsText], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `parkinsons-analysis-${new Date().toISOString().split('T')[0]}.txt`
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t.downloadResults}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <MicOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t.recordYourVoiceToSeeAnalysisResults}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                </div>
              </div>
            </section>
          )}
        </div>
        <Footer onSectionChange={setActiveSection} />
      </main>
    </div>
  )
}