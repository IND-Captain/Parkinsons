import { NextRequest, NextResponse } from 'next/server'

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

// The features our Python model expects, in the correct order.
const MODEL_FEATURES = [
  'MDVP:Fo(Hz)', 'MDVP:Fhi(Hz)', 'MDVP:Flo(Hz)', 'MDVP:Jitter(%)',
  'MDVP:Jitter(Abs)', 'MDVP:Shimmer', 'MDVP:Shimmer(dB)', 'NHR', 'HNR',
  'RPDE', 'DFA', 'spread1', 'spread2', 'D2', 'PPE'
];

// A mapping from our JS feature names to the Python model's feature names.
const featureNameMapping: { [key: string]: string } = {
  pitch_mean: 'MDVP:Fo(Hz)',
  // Add other mappings if JS names differ from Python names.
};

interface PredictionRequest {
  features: AudioFeatures
  patientInfo?: {
    age?: number
    gender?: 'male' | 'female' | 'other'
    medicalHistory?: string[]
  }
}

interface PredictionResponse {
  prediction: number // 0 = Healthy, 1 = Parkinson's Risk
  confidence: number // 0-100%
  risk_factors: string[]
  recommendations: string[]
  detailed_analysis: {
    voice_quality_score: number
    neurological_indicators: string[]
    severity_assessment: 'low' | 'moderate' | 'high'
  }
}

async function getModelPrediction(features: AudioFeatures): Promise<PredictionResponse> {
  try {
    // Map the JS features to the order expected by the Python model.
    // This is a simplified mapping. A real implementation would need to ensure all 15 features are present.
    const orderedFeatures = [
      features.pitch_mean,       // MDVP:Fo(Hz)
      features.pitch_mean * 1.2, // MDVP:Fhi(Hz) - Simulated
      features.pitch_mean * 0.8, // MDVP:Flo(Hz) - Simulated
      features.jitter,           // MDVP:Jitter(%)
      features.jitter / 100,     // MDVP:Jitter(Abs) - Simulated
      features.shimmer,          // MDVP:Shimmer
      features.shimmer * 10,     // MDVP:Shimmer(dB) - Simulated
      0.015,                     // NHR - Simulated default
      features.hnr,              // HNR
      0.5,                       // RPDE - Simulated default
      0.7,                       // DFA - Simulated default
      -5.0,                      // spread1 - Simulated default
      0.2,                       // spread2 - Simulated default
      2.0,                       // D2 - Simulated default
      0.2                        // PPE - Simulated default
    ];

    const response = await fetch('http://127.0.0.1:5001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: orderedFeatures }),
    });

    if (!response.ok) {
      throw new Error(`Model server responded with status: ${response.status}`);
    }

    const result = await response.json();

    // Return a structure compatible with the frontend
    return {
      prediction: result.prediction,
      confidence: result.confidence,
      risk_factors: result.prediction === 1 ? ['Voice patterns match risk profile'] : [],
      recommendations: result.prediction === 1 ? ['Consult a medical professional for a formal diagnosis.'] : ['Continue regular health monitoring.'],
      detailed_analysis: {
        voice_quality_score: 100 - (result.confidence / 2), // Example score
        neurological_indicators: [],
        severity_assessment: result.confidence > 75 ? 'high' : result.confidence > 50 ? 'moderate' : 'low'
      }
    };
  } catch (error) {
    console.error('Error connecting to model server:', error);
    throw new Error('Could not get prediction from model server.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json()
    
    if (!body.features) {
      return NextResponse.json(
        { error: 'Audio features are required' },
        { status: 400 }
      )
    }
    
    // Validate required features
    const requiredFeatures = ['pitch_mean', 'pitch_std', 'mfccs', 'jitter', 'shimmer', 'zcr', 'spectral_centroid', 'hnr']
    for (const feature of requiredFeatures) {
      if (!(feature in body.features)) {
        return NextResponse.json(
          { error: `Missing required feature: ${feature}` },
          { status: 400 }
        )
      }
    }
    
    // Get prediction from our Python model server
    const result = await getModelPrediction(body.features)
    
    // Add timestamp and metadata
    const response = {
      ...result,
      timestamp: new Date().toISOString(),
      analysis_method: 'ai_enhanced',
      disclaimer: 'This analysis is for educational purposes only and should not replace professional medical diagnosis.'
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to generate prediction. Please try again.' },
      { status: 500 }
    )
  }
}