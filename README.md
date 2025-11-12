# Parkinson's Disease Early Detection Tool

A comprehensive, production-ready web application for early detection of Parkinson's disease through voice analysis using advanced AI technology.

## 🎯 Features

### Core Functionality
- **🎙️ Voice Recording**: Professional audio recorder with real-time waveform visualization
- **🔬 AI-Powered Analysis**: Advanced feature extraction and machine learning prediction
- **📊 Comprehensive Results**: Detailed risk assessment with confidence scores and personalized recommendations
- **🌍 Multi-Language Support**: English and Hindi language support
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Technical Features
- **Real-time Audio Processing**: Web Audio API for immediate feedback
- **Advanced Acoustic Analysis**: 
  - Pitch characteristics (mean, standard deviation)
  - Jitter (frequency variation)
  - Shimmer (amplitude variation)
  - Harmonics-to-noise ratio (HNR)
  - Zero-crossing rate (ZCR)
  - Spectral centroid
  - Mel-frequency cepstral coefficients (MFCCs)
  
### User Experience
- **Educational Content**: Comprehensive information about Parkinson's disease
- **FAQ Section**: Detailed answers to common questions
- **Download Results**: Export analysis reports as text files
- **Interactive Visualizations**: Waveform display and progress indicators

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd parkinsons-detection-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Language**: TypeScript 5
- **State Management**: React hooks and state
- **Audio Processing**: Web Audio API

### Backend (API Routes)
- **Audio Analysis**: `/api/analyze-audio` - Feature extraction and processing
- **AI Prediction**: `/api/predict` - AI-enhanced risk assessment

### Key Components

#### Audio Processing Pipeline
1. **Recording**: Browser MediaRecorder API captures audio
2. **Preprocessing**: Resampling, normalization, silence trimming
3. **Feature Extraction**: Advanced acoustic feature analysis
4. **AI Analysis**: Machine learning model prediction
5. **Results Display**: Comprehensive report with recommendations

#### Voice Features Analyzed
- **Fundamental Frequency (F0)**: Pitch analysis
- **Jitter**: Frequency variation between periods
- **Shimmer**: Amplitude variation between periods
- **HNR**: Harmonics-to-noise ratio
- **MFCCs**: Mel-frequency cepstral coefficients
- **Spectral Features**: Frequency distribution analysis

## 🌐 API Endpoints

### POST /api/analyze-audio
Extracts acoustic features from voice recordings.

**Request**: 
- `audio`: WAV audio file (5-15 seconds)

**Response**:
```json
{
  "features": {
    "pitch_mean": 150.5,
    "pitch_std": 25.3,
    "mfccs": [1.2, 0.8, ...],
    "jitter": 0.025,
    "shimmer": 0.035,
    "zcr": 0.0892,
    "spectral_centroid": 2100.5,
    "hnr": 12.7
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST /api/predict
AI-powered Parkinson's risk assessment.

**Request**:
```json
{
  "features": {
    "pitch_mean": 150.5,
    "pitch_std": 25.3,
    "mfccs": [1.2, 0.8, ...],
    "jitter": 0.025,
    "shimmer": 0.035,
    "zcr": 0.0892,
    "spectral_centroid": 2100.5,
    "hnr": 12.7
  }
}
```

**Response**:
```json
{
  "prediction": 0,
  "confidence": 85.2,
  "risk_factors": ["Mildly increased frequency variation"],
  "recommendations": ["Continue regular health monitoring"],
  "detailed_analysis": {
    "voice_quality_score": 78,
    "neurological_indicators": ["Normal pitch variation"],
    "severity_assessment": "low"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🎨 UI Components

### Main Interface
- **Header**: Language selector, title, and navigation
- **Recording Section**: Audio controls, waveform visualization, timer
- **Results Section**: Risk assessment, confidence scores, detailed analysis
- **Information Tabs**: Educational content, FAQ, technical details

### Recording Features
- **Real-time Waveform**: Visual feedback during recording
- **Timer Display**: Recording duration with progress bar
- **Audio Playback**: Review recorded audio before analysis
- **Quality Indicators**: File size and recording validation

### Results Display
- **Risk Status**: Clear visual indicators (healthy/at risk)
- **Confidence Score**: Percentage with visual progress bar
- **Voice Quality Score**: Overall assessment metric
- **Risk Factors**: Detailed list of identified concerns
- **Recommendations**: Personalized next steps
- **Feature Breakdown**: Technical acoustic analysis
- **Download Option**: Export results as text file

## 🌍 Internationalization

### Supported Languages
- **English**: Full translation support
- **Hindi**: Complete localization

### Translation Structure
All UI text, labels, error messages, and content are fully translated including:
- Interface elements
- Error messages
- Educational content
- FAQ responses
- Toast notifications

## 🔒 Privacy & Security

## ⚠️ Medical Disclaimer

**IMPORTANT**: This tool is for educational purposes only and should not replace professional medical diagnosis. 

- **Screening Tool**: Preliminary assessment, not definitive diagnosis
- **Consult Professionals**: Always seek medical advice for health concerns
- **Limitations**: Results may be affected by various factors (microphone quality, background noise, health status). The model is primarily trained on English and may be less accurate for other languages or strong accents.
- **Emergency Use**: Not suitable for emergency medical situations

## 🧪 Testing

### Development Testing
```bash
# Run linter
npm run lint

# Start development server
npm run dev
```

### Audio Testing
- Test with different microphone qualities
- Verify recording length validation (3-15 seconds)
- Test background noise handling
- Verify waveform visualization

### Language Testing
- Switch between English and Hindi
- Verify all UI elements translate correctly
- Test error messages in both languages

## 📱 Browser Compatibility

### Supported Browsers
- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Required Features
- Web Audio API
- MediaRecorder API
- Canvas API
- ES6+ JavaScript

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```env
# Optional: API endpoints
NEXT_PUBLIC_API_URL=https://your-domain.com

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Platform Deployment
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Static site deployment
- **AWS**: Custom server deployment
- **Docker**: Containerized deployment

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint configuration
2. **TypeScript**: Strict typing required
3. **Components**: Use shadcn/ui components
4. **Testing**: Test audio functionality thoroughly
5. **Documentation**: Update README for new features

### Feature Requests
- Additional language support
- Enhanced visualizations
- Integration with health platforms
- Advanced AI models

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Z.AI**: AI SDK integration for intelligent analysis
- **shadcn/ui**: Beautiful, accessible UI components
- **Next.js**: React framework for production applications
- **Tailwind CSS**: Utility-first CSS framework

## 📞 Support

For technical issues or questions:
- Create an issue in the repository
- Check the FAQ section in the app
- Review the documentation

---

**Remember**: This is an educational tool. Always consult healthcare professionals for medical concerns about Parkinson's disease.