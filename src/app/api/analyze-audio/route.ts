import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

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

// Simulated audio processing functions (in a real implementation, you'd use librosa)
function extractPitchFeatures(audioData: Float32Array, sampleRate: number): { mean: number; std: number } {
  // Simple pitch detection using zero-crossing and autocorrelation
  const pitches: number[] = []
  const frameSize = Math.floor(sampleRate * 0.025) // 25ms frames
  const hopSize = Math.floor(frameSize * 0.5)
  
  for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
    const frame = audioData.slice(i, i + frameSize)
    const pitch = estimatePitch(frame, sampleRate)
    if (pitch > 50 && pitch < 500) { // Reasonable voice pitch range
      pitches.push(pitch)
    }
  }
  
  if (pitches.length === 0) {
    return { mean: 150, std: 20 } // Default values
  }
  
  const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length
  const variance = pitches.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / pitches.length
  const std = Math.sqrt(variance)
  
  return { mean, std }
}

function estimatePitch(frame: Float32Array, sampleRate: number): number {
  // Simple autocorrelation-based pitch detection
  const minPeriod = Math.floor(sampleRate / 500) // Max 500 Hz
  const maxPeriod = Math.floor(sampleRate / 50)  // Min 50 Hz
  
  let bestPeriod = minPeriod
  let bestCorrelation = 0
  
  for (let period = minPeriod; period <= maxPeriod; period++) {
    let correlation = 0
    for (let i = 0; i < frame.length - period; i++) {
      correlation += frame[i] * frame[i + period]
    }
    
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation
      bestPeriod = period
    }
  }
  
  return sampleRate / bestPeriod
}

function extractMFCCs(audioData: Float32Array, sampleRate: number): number[] {
  // Simplified MFCC extraction (real implementation would use FFT and mel filter banks)
  const numCoeffs = 13
  const mfccs: number[] = []
  
  for (let i = 0; i < numCoeffs; i++) {
    // Simulate MFCC coefficients with some variation
    const baseValue = Math.sin(i * 0.5) * 10 + Math.random() * 2
    mfccs.push(baseValue)
  }
  
  return mfccs
}

function extractJitter(audioData: Float32Array, sampleRate: number): number {
  // Jitter: frequency variation between consecutive periods
  const pitches: number[] = []
  const frameSize = Math.floor(sampleRate * 0.025)
  const hopSize = Math.floor(frameSize * 0.5)
  
  for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
    const frame = audioData.slice(i, i + frameSize)
    const pitch = estimatePitch(frame, sampleRate)
    if (pitch > 50 && pitch < 500) {
      pitches.push(pitch)
    }
  }
  
  if (pitches.length < 2) return 0.01
  
  let jitterSum = 0
  for (let i = 1; i < pitches.length; i++) {
    jitterSum += Math.abs(pitches[i] - pitches[i-1]) / pitches[i-1]
  }
  
  return jitterSum / (pitches.length - 1)
}

function extractShimmer(audioData: Float32Array): number {
  // Shimmer: amplitude variation between consecutive periods
  if (audioData.length < 2) return 0.01
  
  let shimmerSum = 0
  let count = 0
  
  for (let i = 1; i < audioData.length; i++) {
    const prev = Math.abs(audioData[i-1])
    const curr = Math.abs(audioData[i])
    if (prev > 0.001) { // Avoid division by very small numbers
      shimmerSum += Math.abs(curr - prev) / prev
      count++
    }
  }
  
  return count > 0 ? shimmerSum / count : 0.01
}

function extractZCR(audioData: Float32Array): number {
  // Zero-crossing rate
  let zcr = 0
  for (let i = 1; i < audioData.length; i++) {
    if ((audioData[i-1] >= 0) !== (audioData[i] >= 0)) {
      zcr++
    }
  }
  return zcr / audioData.length
}

function extractSpectralCentroid(audioData: Float32Array, sampleRate: number): number {
  // Simplified spectral centroid (brightness measure)
  let numerator = 0
  let denominator = 0
  
  for (let i = 0; i < audioData.length; i++) {
    const magnitude = Math.abs(audioData[i])
    const frequency = (i * sampleRate) / audioData.length
    numerator += frequency * magnitude
    denominator += magnitude
  }
  
  return denominator > 0 ? numerator / denominator : 1000
}

function extractHNR(audioData: Float32Array): number {
  // Harmonics-to-noise ratio (simplified)
  const frameSize = Math.floor(audioData.length / 10)
  let hnrSum = 0
  let count = 0
  
  for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
    const frame = audioData.slice(i, i + frameSize)
    
    // Calculate energy in harmonics (simplified)
    let harmonicEnergy = 0
    let noiseEnergy = 0
    
    for (let j = 1; j < frame.length; j++) {
      const diff = Math.abs(frame[j] - frame[j-1])
      if (diff < 0.1) {
        harmonicEnergy += Math.abs(frame[j])
      } else {
        noiseEnergy += diff
      }
    }
    
    const hnr = harmonicEnergy / (noiseEnergy + 0.001)
    hnrSum += hnr
    count++
  }
  
  return count > 0 ? hnrSum / count : 10
}

function extractAudioFeatures(audioData: Float32Array, sampleRate: number): AudioFeatures {
  const pitch = extractPitchFeatures(audioData, sampleRate)
  const mfccs = extractMFCCs(audioData, sampleRate)
  const jitter = extractJitter(audioData, sampleRate)
  const shimmer = extractShimmer(audioData)
  const zcr = extractZCR(audioData)
  const spectralCentroid = extractSpectralCentroid(audioData, sampleRate)
  const hnr = extractHNR(audioData)
  
  return {
    pitch_mean: pitch.mean,
    pitch_std: pitch.std,
    mfccs,
    jitter,
    shimmer,
    zcr,
    spectral_centroid: spectralCentroid,
    hnr
  }
}

function convertWAVToFloat32(buffer: Buffer): Float32Array {
  // Simple WAV to Float32 conversion (assuming 16-bit PCM)
  const float32Array = new Float32Array(buffer.length / 2)
  
  for (let i = 0; i < buffer.length; i += 2) {
    const sample = (buffer.readInt16LE(i) / 32768.0) // Convert to -1 to 1 range
    float32Array[i / 2] = sample
  }
  
  return float32Array
}

function simulateMLPrediction(features: AudioFeatures): { prediction: number; confidence: number } {
  // Simulate ML model prediction based on features
  // In a real implementation, this would load and use a trained scikit-learn model
  
  // Create a simple scoring system based on known Parkinson's voice characteristics
  let riskScore = 0
  
  // Higher jitter is associated with Parkinson's
  if (features.jitter > 0.03) riskScore += 0.2
  else if (features.jitter > 0.02) riskScore += 0.1
  
  // Higher shimmer is associated with Parkinson's
  if (features.shimmer > 0.04) riskScore += 0.2
  else if (features.shimmer > 0.03) riskScore += 0.1
  
  // Lower HNR is associated with Parkinson's
  if (features.hnr < 5) riskScore += 0.2
  else if (features.hnr < 8) riskScore += 0.1
  
  // Pitch variation
  if (features.pitch_std > 50) riskScore += 0.15
  else if (features.pitch_std > 30) riskScore += 0.05
  
  // Add some randomness to simulate model uncertainty
  riskScore += (Math.random() - 0.5) * 0.2
  
  // Convert to prediction and confidence
  const confidence = Math.min(95, Math.max(60, 50 + riskScore * 100))
  const prediction = riskScore > 0.3 ? 1 : 0 // 1 = Parkinson's risk, 1 = Healthy
  
  return { prediction, confidence }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }
    
    // Check file size (should be less than 10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }
    
    // Check minimum duration (at least 3 seconds)
    const minSize = 3 * 22050 * 2 // 3 seconds * 22050 Hz * 2 bytes per sample
    if (audioFile.size < minSize) {
      return NextResponse.json(
        { error: 'Recording too short. Please record for at least 3 seconds.' },
        { status: 400 }
      )
    }
    
    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Convert to Float32Array for processing
    const audioData = convertWAVToFloat32(buffer)
    
    // Check if audio is not silent
    const maxAmplitude = audioData.reduce((max, current) => {
      return Math.max(max, Math.abs(current));
    }, 0);
    if (maxAmplitude < 0.01) {
      return NextResponse.json(
        { error: 'Audio is too quiet or silent. Please speak clearly and check your microphone.' },
        { status: 400 }
      )
    }
    
    // Check for clipping (audio too loud)
    const clippingThreshold = 0.98;
    let clippedSamples = 0;
    for (const sample of audioData) {
      if (Math.abs(sample) >= clippingThreshold) {
        clippedSamples++;
      }
    }
    if ((clippedSamples / audioData.length) > 0.01) { // If more than 1% of samples are clipped
      return NextResponse.json(
        { error: 'Audio is too loud and may be distorted. Please move away from the microphone and try again.' },
        { status: 400 }
      )
    }

    // Extract features
    const sampleRate = 22050 // Standard sample rate for voice analysis
    const features = extractAudioFeatures(audioData, sampleRate)
    
    // Make prediction
    const { prediction, confidence } = simulateMLPrediction(features)
    
    // Return results
    return NextResponse.json({
      prediction,
      confidence,
      features,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Audio analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze audio. Please try again.' },
      { status: 500 }
    )
  }
}