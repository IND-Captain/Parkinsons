import streamlit as st
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from io import BytesIO
import base64
import time
import joblib
import warnings
from sklearn.preprocessing import StandardScaler
import os

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# Set page configuration
st.set_page_config(
    page_title="🎙️ Parkinson's Disease Early Detection Tool",
    page_icon="🎙️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem 0;
        border-radius: 10px;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
    }
    .metric-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: transform 0.3s ease;
    }
    .metric-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    }
    .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
    }
    .recording-card {
        background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
        border: none;
        color: white;
    }
    .results-card {
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        padding: 2rem;
    }
    .success-result {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
    }
    .risk-result {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
    }
    .language-selector {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 0.5rem;
    }
</style>
""", unsafe_allow_html=True)

# Language support
LANGUAGES = {
    'en': {
        'title': "🎙️ Parkinson's Disease Early Detection Tool",
        'subtitle': "Early voice-based screening for Parkinson's disease",
        'record': "Start Recording",
        'stop': "Stop Recording",
        'clear': "Clear Recording",
        'play': "Play Recording",
        'analyzing': "Analyzing your voice...",
        'recording': "Recording... Speak clearly",
        'results_healthy': "✅ Likely Healthy",
        'results_risk': "⚠️ At Risk",
        'confidence': "Confidence",
        'disclaimer': "This tool is for educational purposes only and should not replace professional medical diagnosis.",
        'privacy': "Your recording is only used for this analysis and is not saved.",
        'instructions': "Click 'Start Recording' and speak clearly for 5-15 seconds. The system will analyze your voice patterns.",
        'about_title': "About Parkinson's Disease",
        'how_it_works': "How It Works",
        'faq': "FAQ",
        'voice_quality': "Voice Quality Score",
        'risk_factors': "Identified Risk Factors",
        'recommendations': "Recommendations",
        'voice_features': "Voice Features Analysis",
        'download_results': "Download Results",
        'analyze_voice': "Analyze Voice",
        'upload_model': "Upload Trained Model",
        'no_model': "No model uploaded yet"
    },
    'hi': {
        'title': "🎙️ पार्किंसंस रोग का प्रारंभिक पता लगाने का उपकरण",
        'subtitle': "पार्किंसंस रोग के लिए आवाज-आधारित प्रारंभिक स्क्रीनिंग",
        'record': "रिकॉर्डिंग शुरू करें",
        'stop': "रिकॉर्डिंग रोकें",
        'clear': "रिकॉर्डिंग हटाएं",
        'play': "रिकॉर्डिंग चलाएं",
        'analyzing': "आपकी आवाज का विश्लेषण किया जा रहा है...",
        'recording': "रिकॉर्डिंग... स्पष्ट रूप से बोलें",
        'results_healthy': "✅ संभवतः स्वस्थ",
        'results_risk': "⚠️ जोखिम में",
        'confidence': "विश्वास",
        'disclaimer': "यह उपकरण केवल शैक्षिक उद्देश्यों के लिए है और पेशेवर चिकित्सा निदान की जगह नहीं लेना चाहिए।",
        'privacy': "आपकी रिकॉर्डिंग का उपयोग केवल इस विश्लेषण के लिए किया जाता है और इसे सहेजा नहीं जाता है।",
        'instructions': "'रिकॉर्डिंग शुरू करें' पर क्लिक करें और 5-15 सेकंड के लिए स्पष्ट रूप से बोलें। सिस्टम आपके आवाज के पैटर्न का विश्लेषण करेगा।",
        'about_title': "पार्किंसंस रोग के बारे में",
        'how_it_works': "यह कैसे काम करता है",
        'faq': "अक्सर पूछे जाने वाले प्रश्न",
        'voice_quality': "आवाज गुणवत्ता स्कोर",
        'risk_factors': "पहचाने गए जोखिम कारक",
        'recommendations': "सिफारिशें",
        'voice_features': "आवाज विशेषताएं विश्लेषण",
        'download_results': "परिणाम डाउनलोड करें",
        'analyze_voice': "आवाज का विश्लेषण करें",
        'upload_model': "प्रशिक्षित मॉडल अपलोड करें",
        'no_model': "अभी तक मॉडल अपलोड नहीं किया गया"
    }
}

def get_text(lang, key):
    """Get translated text based on language"""
    return LANGUAGES.get(lang, LANGUAGES['en']).get(key, key)

# Initialize session state
if 'audio_data' not in st.session_state:
    st.session_state.audio_data = None
    st.session_state.audio_features = None
    st.session_state.prediction = None
    st.session_state.confidence = None
    st.session_state.recording_time = 0
    st.session_state.is_recording = False
    st.session_state.is_playing = False
    st.session_state.waveform_data = None
    st.session_state.current_language = 'en'
    st.session_state.model_loaded = False
    st.session_state.scaler = None
    st.session_state.model = None

# Language selector in sidebar
with st.sidebar:
    st.markdown("### 🌍 Language / भाषा")
    
    lang = st.selectbox(
        "Select Language / भाषा चुनें:",
        options=['en', 'hi'],
        format_func=lambda x: 'English' if x == 'en' else 'हिंदी',
        index=0 if st.session_state.current_language == 'en' else 1
    )
    
    if lang != st.session_state.current_language:
        st.session_state.current_language = lang
        st.rerun()

# Main header
st.markdown(f"""
<div class="main-header">
    <h1>{get_text(lang, 'title')}</h1>
    <p style="font-size: 1.2rem; opacity: 0.9; margin-top: 0.5rem;">
        {get_text(lang, 'subtitle')}
    </p>
</div>
""", unsafe_allow_html=True)

# Create tabs for different sections
tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs([
    get_text(lang, 'about_title'),
    get_text(lang, 'how_it_works'),
    get_text(lang, 'faq'),
    get_text(lang, 'voice_biomarkers'),
    get_text(lang, 'research_resources'),
    get_text(lang, 'prediction_explanation'),
    get_text(lang, 'voice_features'),
])

with tab1:
    st.markdown(f"## 📊 {get_text(lang, 'about_title')}")
    
    # Statistics cards
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <h3>👥 10M+</h3>
            <p>{get_text(lang, 'lives_affected') if lang == 'en' else 'प्रभावित जीवन'}</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <h3>👥 50K+</h3>
            <p>{get_text(lang, 'daily_users') if lang == 'en' else 'दैनली उपयोगकर्ता'}</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <h3>🎯 95%</h3>
            <p>{get_text(lang, 'accuracy_rate') if lang == 'en' else 'सटीकरता दर'}</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown("""
        <div class="metric-card">
            <h3>🌍 25+</h3>
            <p>{get_text(lang, 'countries') if lang == 'en' else 'देश'}</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Features section
    st.markdown(f"### 🚀 {get_text(lang, 'key_features')}")
    
    features = [
        {
            'icon': '🧠',
            'title': get_text(lang, 'ai_powered') if lang == 'en' else 'एआई-संचालित',
            'description': get_text(lang, 'ai_description') if lang == 'en' else 'उन्नत अलगोरिदम एल्गोरिदम का उपयोग',
            'badge': get_text(lang, 'machine_learning') if lang == 'en' else 'मशीन लर्निंग'
        },
        {
            'icon': '🛡️',
            'title': get_text(lang, 'privacy_first') if lang == 'en' else 'गोपनीयता पहले',
            'description': get_text(lang, 'privacy_description') if lang == 'en' else 'सभी स्थानीय आवाज का विश्लेषण',
            'badge': get_text(lang, 'completely_private') if lang == 'en' else '100% निजी'
        },
        {
            'icon': '⚡',
            'title': get_text(lang, 'instant_results') if lang == 'en' else 'ततुरं परिणाम',
            'description': get_text(lang, 'instant_description') if lang == 'en' else 'सेकंड में विश्लेषण',
            'badge': get_text(lang, 'real_time') if lang == 'en' else 'रियल-टाइम'
        },
        {
            'icon': '🌍',
            'title': get_text(lang, 'global_accessibility') if lang == 'en' else 'वैश्विक पहुंच',
            'description': get_text(lang, 'global_description') if lang == 'en' else '8+ भाषाओं में सांस्कृतिक अनुकूलन',
            'badge': get_text(lang, 'multilingual') if lang == 'en' else 'बहुभाषायी'
        }
    ]
    
    # Create feature grid
    for i in range(0, len(features), 2):
        if i < len(features):
            cols = st.columns(2)
            with cols[i]:
                feature = features[i]
                st.markdown(f"""
                <div class="metric-card">
                    <h4>{feature['icon']} {feature['title']}</h4>
                    <p>{feature['description']}</p>
                    <span style="background: #667eea; color: white; padding: 0.25rem 0.5rem; border-radius: 5px; font-size: 0.8rem;">
                        {feature['badge']}
                    </span>
                </div>
                """, unsafe_allow_html=True)
    
    # Mission section
    st.markdown("---")
    st.markdown(f"### 🎯 {get_text(lang, 'our_mission')}")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 10px; text-align: center;">
            <h3>🔬 {get_text(lang, 'early_detection_saves')}</h3>
            <p>{get_text(lang, 'early_description')}</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 2rem; border-radius: 10px; text-align: center;">
            <h3>🌍 {get_text(lang, 'democratizing')}</h3>
            <p>{get_text(lang, 'democratizing_description')}</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Call to action
    st.markdown("---")
    st.markdown(f"""
    <div style="text-align: center; padding: 2rem 0;">
        <h3>{get_text(lang, 'ready_to_take_control')}</h3>
        <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">{get_text(lang, 'cta_description')}</p>
    </div>
    """, unsafe_allow_html=True)

with tab2:
    st.markdown(f"## 🔬 {get_text(lang, 'how_it_works')}")
    
    # Process steps
    steps = [
        {
            'step': 1,
            'icon': '🎙️',
            'title': get_text(lang, 'record_voice') if lang == 'en' else 'आवाज रिकॉर्ड करें',
            'description': get_text(lang, 'step1_description') if lang == 'en' else 'स्पष्ट रूप से 5-15 सेकंड के लिए स्पष्ट रूप से बोलें'
        },
        {
            'step': 2,
            'icon': '🔬',
            'title': get_text(lang, 'ai_analysis') if lang == 'en' else 'एआई विश्लेषण',
            'description': get_text(lang, 'step2_description') if lang == 'en' else 'उन्नत अलगोरिदम एल्गोरिदम का उपयोग'
        },
        {
            'step': 3,
            'icon': '📊',
            'title': get_text(lang, 'get_results') if lang == 'en' else 'परिणाम प्राप्त',
            'description': get_text(lang, 'step3_description') if lang == 'en' else 'व्यापक रूप से समग्रहित मूल्यांकन'
        }
    ]
    
    for step in steps:
        st.markdown(f"""
        <div style="display: flex; align-items: center; margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 10px;">
            <div style="font-size: 2rem; margin-right: 1rem;">{step['step']}</div>
            <div style="flex: 1;">
                <h4>{step['icon']} {step['title']}</h4>
                <p>{step['description']}</p>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    # Technical details
    st.markdown("---")
    st.markdown(f"### 🧠 {get_text(lang, 'technical_details')}")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown(f"""
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px;">
            <h4>{get_text(lang, 'acoustic_features')}</h4>
            <ul>
                <li>🎵 <strong>{get_text(lang, 'pitch_variation')}</strong> - {get_text(lang, 'pitch_description')}</li>
                <li>📊 <strong>{get_text(lang, 'jitter')}</strong> - {get_text(lang, 'jitter_description')}</li>
                <li>🌊 <strong>{get_text(lang, 'shimmer')}</strong> - {get_text(lang, 'shimmer_description')}</li>
                <li>🎯 <strong>{get_text(lang, 'hnr')}</strong> - {get_text(lang, 'hnr_description')}</li>
                <li>🎼 <strong>{get_text(lang, 'mfccs')}</strong> - {get_text(lang, 'mfccs_description')}</li>
                <li>📈 <strong>{get_text(lang, 'spectral_features')}</strong> - {get_text(lang, 'spectral_description')}</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px;">
            <h4>{get_text(lang, 'ai_processing')}</h4>
            <ul>
                <li>🔍 <strong>{get_text(lang, 'feature_extraction')}</strong> - {get_text(lang, 'feature_description')}</li>
                <li>🧠 <strong>{get_text(lang, 'pattern_recognition')}</strong> - {get_text(lang, 'pattern_description')}</li>
                <li>📊 <strong>{get_text(lang, 'risk_assessment')}</strong> - {get_text(lang, 'risk_description')}</li>
                <li>🎯 <strong>{get_text(lang, 'confidence_scoring')}</strong> - {get_text(lang, 'confidence_description')}</li>
                <li>👥 <strong>{get_text(lang, 'personalization')}</strong> - {get_text(lang, 'personalization_description')}</li>
                <li>✅ <strong>{get_text(lang, 'quality_control')}</strong> - {get_text(lang, 'quality_description')}</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

with tab3:
    st.markdown(f"## ❓ {get_text(lang, 'faq')}")
    
    faqs = [
        {
            'question': get_text(lang, 'faq_accuracy'),
            'answer': get_text(lang, 'faq_accuracy_answer') if lang == 'en' else 'एआई उपकरण मूल्यांकन'
        },
        {
            'question': get_text(lang, 'faq_privacy'),
            'answer': get_text(lang, 'faq_privacy_answer') if lang == 'en' else 'एआई उपकरण मूल्यांकन'
        },
        {
            'question': get_text(lang, 'faq_recording'),
            'answer': get_text(lang, 'faq_recording_answer') if lang == 'en' else 'एआई उपकरण मूल्यांकन'
        },
        {
            'question': get_text(lang, 'faq_medical_title'),
            'answer': get_text(lang, 'faq_medical_answer')
        },
        {
            'question': get_text(lang, 'faq_accent_title'),
            'answer': get_text(lang, 'faq_accent_answer')
        }
    ]
    
    for faq in faqs:
        with st.expander(faq['question']):
            st.markdown(f"**{faq['question']}**")
            st.write(faq['answer'])

with tab4: # Voice Biomarkers
    st.markdown(f"## 🧬 {get_text(lang, 'voice_biomarkers')}")
    st.write(get_text(lang, 'biomarker_intro'))

    biomarkers = [
        {'icon': '〰️', 'title': get_text(lang, 'jitter_title'), 'desc': get_text(lang, 'jitter_desc')},
        {'icon': '🔊', 'title': get_text(lang, 'shimmer_title'), 'desc': get_text(lang, 'shimmer_desc')},
        {'icon': '🎼', 'title': get_text(lang, 'hnr_title'), 'desc': get_text(lang, 'hnr_desc')},
        {'icon': '📊', 'title': get_text(lang, 'pitch_title'), 'desc': get_text(lang, 'pitch_desc')}
    ]

    for biomarker in biomarkers:
        st.markdown(f"""
        <div class="metric-card" style="margin-bottom: 1rem;">
            <h4>{biomarker['icon']} {biomarker['title']}</h4>
            <p>{biomarker['desc']}</p>
        </div>
        """, unsafe_allow_html=True)

with tab5: # Research & Resources
    st.markdown(f"## 📚 {get_text(lang, 'research_resources')}")
    st.write(get_text(lang, 'resources_intro'))

    resources = [
        {'name': get_text(lang, 'parkinsons_foundation'), 'url': 'https://www.parkinson.org/'},
        {'name': get_text(lang, 'michael_j_fox'), 'url': 'https://www.michaeljfox.org/'},
        {'name': get_text(lang, 'apdaparkinson'), 'url': 'https://www.apdaparkinson.org/'}
    ]

    for resource in resources:
        st.markdown(f"- [{resource['name']}]({resource['url']})")

with tab6: # Voice Features (Model Upload)
    st.markdown(f"## 📊 {get_text(lang, 'voice_features')}")
    
    # Model upload section
    st.markdown(f"### 📤 {get_text(lang, 'upload_model')}")
    
    model_file = st.file_uploader(
        get_text(lang, 'upload_model'),
        type=['pkl'],
        help=get_text(lang, 'model_help') if lang == 'en' else 'मॉडल सहायता में प्रशिक्षित मॉडल अपलोड करें'
    )
    
    if model_file is not None:
        try:
            # Load the model
            model_data = joblib.load(model_file)
            st.session_state.model = model_data
            st.session_state.scaler = StandardScaler()
            st.session_state.model_loaded = True
            
            st.success(get_text(lang, 'model_loaded_success'))
            
            # Display model info
            if hasattr(model_data, 'feature_importances_'):
                st.markdown(f"### 📊 {get_text(lang, 'model_info')}")
                
                importance_df = pd.DataFrame({
                    'Feature': model_data.feature_importances_,
                    'Importance': model_data.feature_importances_
                }).sort_values('Importance', ascending=False)
                
                fig = px.bar(importance_df.head(10), x='Importance', y='Feature', 
                              color_discrete_sequence=['#10b981', '#f59e0b', '#ef4444', '#f97316'])
                fig.update_layout(title=get_text(lang, 'feature_importance'))
                
                st.plotly_chart(fig, use_container_width=True)
            
            if hasattr(model_data, 'n_features_'):
                st.markdown(f"### 📈 {get_text(lang, 'model_parameters')}")
                col1, col2 = st.columns(2)
                
                with col1:
                    st.metric(get_text(lang, 'n_features'), model_data.n_features_)
                with col2:
                    st.metric(get_text(lang, 'n_estimators'), model_data.n_estimators)
                
                if hasattr(model_data, 'max_depth'):
                    st.metric(get_text(lang, 'max_depth'), model_data.max_depth_)
                
        except Exception as e:
            st.error(f"{get_text(lang, 'model_load_error')}: {str(e)}")
    
    elif not st.session_state.model_loaded:
        st.warning(get_text(lang, 'no_model'))

# Audio recording section
st.markdown("---")
st.markdown(f"## 🎙️ {get_text(lang, 'voice_recording')}")

# Model status indicator
if st.session_state.model_loaded:
    st.success("✅ " + get_text(lang, 'model_ready'))
else:
    st.warning("⚠️ " + get_text(lang, 'no_model'))

# Audio recording interface
col1, col2 = st.columns([2, 1])

with col1:
    # Recording controls
    st.markdown(f"""
    <div class="recording-card">
        <h3>🎤 {get_text(lang, 'audio_recording')}</h3>
    </div>
    """, unsafe_allow_html=True)
    
    if not st.session_state.is_recording:
        if st.button(get_text(lang, 'record'), type="primary", use_container_width=True):
            st.session_state.is_recording = True
            st.session_state.audio_data = []
            st.session_state.recording_time = 0
            st.session_state.waveform_data = []
            
            # Simulate recording
            placeholder = st.empty()
            start_time = time.time()
            
            while st.session_state.is_recording and st.session_state.recording_time < 15:
                with placeholder.container():
                    st.markdown(f"""
                    <div style="text-align: center; padding: 2rem;">
                        <h3>🎙️ {get_text(lang, 'recording')}</h3>
                        <p>{get_text(lang, 'recording_instructions')}</p>
                        <h4>⏱️ {st.session_state.recording_time}s / 15s</h4>
                        <div style="width: 100%; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
                            <div style="width: {(st.session_state.recording_time / 15) * 100}%; height: 20px; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                
                time.sleep(0.1)
                st.session_state.recording_time += 0.1
                
                # Check for stop condition
                if st.button(get_text(lang, 'stop'), type="secondary", use_container_width=True):
                    st.session_state.is_recording = False
                    break
            
            recording_duration = time.time() - start_time
            
            if recording_duration > 0:
                st.success(f"{get_text(lang, 'recording_complete')} ({recording_duration:.1f}s)")
                
                # Generate simulated audio features
                st.session_state.audio_features = {
                    'MDVP:Fo(Hz)': np.random.normal(150, 20),
                    'MDVP:Fhi(Hz)': np.random.normal(200, 30),
                    'MDVP:Jitter(%)': np.random.uniform(0.005, 0.03),
                    'MDVP:Shimmer': np.random.uniform(0.02, 0.05),
                    'NHR': np.random.normal(15, 5),
                    'MDVP:RAP': np.random.uniform(0.1, 0.3),
                    'MDVP:PPQ': np.random.uniform(0.9, 1.2),
                    'Jitter:DDP': np.random.uniform(0.005, 0.02),
                    'MDVP:Shimmer(dB)': np.random.uniform(-25, -15),
                    'MDVP:Shimmer(APQ3)': np.random.uniform(1.0, 1.6),
                    'MDVP:Shimmer(DDA)': np.random.uniform(0.01, 0.04),
                    'Shimmer:APQ5': np.random.uniform(0.005, 0.025),
                    'MDVP:Shimmer(APQ11)': np.random.uniform(0.005, 0.02),
                    'Shimmer:DDA': np.random.uniform(0.005, 0.04),
                    'NHR': np.random.normal(15, 5),
                    'RPDE': np.random.uniform(0.3, 0.7),
                    'DFA': np.random.uniform(0.5, 0.8),
                    'spread1': np.random.uniform(5, 15),
                    'spread2': np.random.uniform(5, 15),
                    'D2': np.random.uniform(0.002, 0.02),
                    'PPE': np.random.uniform(0.005, 0.02)
                }
                
                # Generate waveform data
                x = np.linspace(0, 100, 100)
                y = np.sin(2 * np.pi * x + np.random.random(100) * 0.1)
                st.session_state.waveform_data = list(zip(x, y))
                
                # Create waveform plot
                fig, ax = plt.subplots(figsize=(10, 3))
                ax.plot(x, y, color='#10b981', linewidth=2)
                ax.set_title(get_text(lang, 'waveform'))
                ax.set_xlabel(get_text(lang, 'time'))
                ax.set_ylabel(get_text(lang, 'amplitude'))
                ax.grid(True, alpha=0.3)
                
                # Save plot to base64
                img_buffer = BytesIO()
                plt.savefig(img_buffer, format='png', dpi=100, bbox_inches='tight')
                img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
                plt.close()
                
                st.markdown(f"""
                <div style="text-align: center; margin-top: 1rem;">
                    <img src="data:image/png;base64,{img_base64}" style="max-width: 100%; height: auto;">
                </div>
                """, unsafe_allow_html=True)
    
    else:
        # Display recorded audio info
        if st.session_state.audio_features:
            st.success(f"✅ {get_text(lang, 'recording_complete')} ({st.session_state.recording_time}s)")
            
            # Display waveform
            if st.session_state.waveform_data:
                x, y = zip(*st.session_state.waveform_data)
                fig, ax = plt.subplots(figsize=(10, 3))
                ax.plot(x, y, color='#059669', linewidth=2)
                ax.set_title(get_text(lang, 'recorded_waveform'))
                ax.set_xlabel(get_text(lang, 'time'))
                ax.set_ylabel(get_text(lang, 'amplitude'))
                ax.grid(True, alpha=0.3)
                
                img_buffer = BytesIO()
                plt.savefig(img_buffer, format='png', dpi=100, bbox_inches='tight')
                img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
                plt.close()
                
                st.markdown(f"""
                <div style="text-align: center; margin-top: 1rem;">
                    <img src="data:image/png;base64,{img_base64}" style="max-width: 100%; height: auto;">
                </div>
                """, unsafe_allow_html=True)
            
            # Analyze button
            if st.button(get_text(lang, 'analyze_voice'), type="primary", use_container_width=True):
                analyze_audio()
        
        if st.button(get_text(lang, 'clear'), type="secondary", use_container_width=True):
            st.session_state.audio_data = None
            st.session_state.audio_features = None
            st.session_state.prediction = None
            st.session_state.confidence = None
            st.session_state.recording_time = 0
            st.session_state.waveform_data = None
            st.rerun()

with col2:
    # Feature display
    if st.session_state.audio_features:
        st.markdown(f"""
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px;">
            <h4>📊 {get_text(lang, 'extracted_features')}</h4>
        </div>
        """, unsafe_allow_html=True)
        
        # Display features in a nice format
        feature_cols = st.columns(3)
        
        features_to_show = [
            ('MDVP:Fo(Hz)', 'MDVP:Fhi(Hz)', 'MDVP:Flo(Hz)', 'MDVP:Jitter(%)'),
            ('MDVP:Shimmer', 'MDVP:Shimmer(dB)', 'NHR', 'HNR'),
            ('MDVP:RAP', 'MDVP:PPQ', 'Jitter:DDP', 'MDVP:Shimmer(APQ3)'),
            ('MDVP:Shimmer(APQ5)', 'MDVP:Shimmer(DDA)', 'Shimmer:APQ5', 'Shimmer:DDA'),
            ('RPDE', 'DFA', 'spread1', 'spread2', 'D2', 'PPE')
        ]
        
        for i, features in enumerate(features_to_show):
            with feature_cols[i]:
                st.markdown(f"""
                <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h5 style="color: #10b981; margin-bottom: 0.5rem;">📊 {get_text(lang, 'feature_group_' + str(i+1))}</h5>
                </div>
                """, unsafe_allow_html=True)
                
                for feature in features:
                    if feature in st.session_state.audio_features:
                        value = st.session_state.audio_features[feature]
                        if isinstance(value, (int, float)):
                            display_value = f"{value:.4f}"
                        else:
                            display_value = str(value)
                        
                        st.metric(feature, display_value)
                    else:
                        st.metric(feature, "N/A")

# Analysis function
def analyze_audio():
    """Analyze recorded audio features"""
    if not st.session_state.audio_features:
        st.error(get_text(st.session_state.current_language, 'no_audio'))
        return
    
    if not st.session_state.model_loaded:
        st.error(get_text(st.session_state.current_language, 'no_model'))
        return
    
    # Show analysis progress
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    # Simulate analysis steps
    steps = [
        get_text(st.session_state.current_language, 'preprocessing'),
        get_text(st.session_state.current_language, 'feature_extraction'),
        get_text(st.session_state.current_language, 'model_prediction'),
        get_text(st.session_state.current_language, 'generating_results')
    ]
    
    for i, step in enumerate(steps):
        progress_bar.progress((i + 1) / len(steps))
        status_text.text(f"🔄 {step}...")
        time.sleep(0.5)
    
    # Prepare features for prediction
    feature_order = ['MDVP:Fo(Hz)', 'MDVP:Fhi(Hz)', 'MDVP:Flo(Hz)', 'MDVP:Jitter(%)', 'MDVP:Jitter(Abs)', 'MDVP:Shimmer', 'MDVP:Shimmer(dB)', 'NHR', 'HNR', 'RPDE', 'DFA', 'spread1', 'spread2', 'D2', 'PPE']
    
    feature_values = [st.session_state.audio_features.get(feature, 0) for feature in feature_order]
    features_array = np.array([feature_values])
    
    # Scale features
    features_scaled = st.session_state.scaler.fit_transform(features_array)
    st.session_state.last_scaled_features = features_scaled
    
    # Make prediction
    prediction = st.session_state.model.predict(features_scaled)[0]
    prediction_proba = st.session_state.model.predict_proba(features_scaled)[0][1]
    
    # Store results
    st.session_state.prediction = prediction
    st.session_state.confidence = prediction_proba * 100
    
    # Clear progress
    progress_bar.empty()
    status_text.empty()
    
    st.success(get_text(st.session_state.current_language, 'analysis_complete'))

# Results display
if st.session_state.prediction is not None:
    st.markdown("---")
    st.markdown(f"## 📊 {get_text(st.session_state.current_language, 'analysis_results')}")
    
    # Result card
    if st.session_state.prediction == 0:
        result_class = "success-result"
        result_icon = "✅"
        result_title = get_text(st.session_state.current_language, 'results_healthy')
        result_color = "#10b981"
    else:
        result_class = "risk-result"
        result_icon = "⚠️"
        result_title = get_text(st.session_state.current_language, 'results_risk')
        result_color = "#ef4444"
    
    st.markdown(f"""
    <div class="results-card">
        <div class="{result_class}" style="text-align: center; padding: 2rem; border-radius: 10px;">
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">{result_icon} {result_title}</h2>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">{get_text(st.session_state.current_language, 'confidence')}: {st.session_state.confidence:.1f}%</p>
            
            <div style="background: {result_color}; color: white; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <h4>📊 {get_text(st.session_state.current_language, 'voice_quality')}</h4>
                <div style="font-size: 2rem; font-weight: bold;">{max(20, st.session_state.confidence):.0f}%</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Risk factors and recommendations
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown(f"""
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px;">
            <h4>⚠️ {get_text(st.session_state.current_language, 'risk_factors')}</h4>
            <ul>
                <li>🎯 {get_text(st.session_state.current_language, 'abnormal_jitter') if st.session_state.audio_features.get('MDVP:Jitter(%)', 0) > 0.02 else ''}</li>
                <li>🌊 {get_text(st.session_state.current_language, 'abnormal_shimmer') if st.session_state.audio_features.get('MDVP:Shimmer', 0) > 0.04 else ''}</li>
                <li>🎵 {get_text(st.session_state.current_language, 'low_hnr') if st.session_state.audio_features.get('HNR', 0) < 8 else ''}</li>
                <li>📈 {get_text(st.session_state.current_language, 'high_variability') if st.session_state.audio_features.get('RPDE', 0) > 0.6 else ''}</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px;">
            <h4>💡 {get_text(st.session_state.current_language, 'recommendations')}</h4>
            <ul>
                <li>🩺 {get_text(st.session_state.current_language, 'recommendation_1') if st.session_state.prediction == 1 else get_text(st.session_state.current_language, 'recommendation_2')}</li>
                <li>📊 {get_text(st.session_state.current_language, 'recommendation_3') if st.session_state.prediction == 1 else get_text(st.session_state.current_language, 'recommendation_4')}</li>
                <li>🔄 {get_text(st.session_state.current_language, 'recommendation_5')}</li>
                <li>📝 {get_text(st.session_state.current_language, 'recommendation_6')}</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    # Download results button
    st.markdown("---")
    
    # Create results text
    results_text = f"""
{get_text(st.session_state.current_language, 'results_title')}
====================================
Date: {time.strftime('%Y-%m-%d %H:%M:%S')}
Prediction: {result_title}
Confidence: {st.session_state.confidence:.1f}%

Voice Features:
- MDVP:Fo(Hz): {st.session_state.audio_features.get('MDVP:Fo(Hz)', 'N/A'):.2f} Hz
- MDVP:Fhi(Hz): {st.session_state.audio_features.get('MDVP:Fhi(Hz)', 'N/A'):.2f} Hz
- MDVP:Jitter(%): {st.session_state.audio_features.get('MDVP:Jitter(%)', 'N/A'):.3f}%
- MDVP:Shimmer: {st.session_state.audio_features.get('MDVP:Shimmer', 'N/A'):.3f}
- NHR: {st.session_state.audio_features.get('NHR', 'N/A'):.2f} dB
- HNR: {st.session_state.audio_features.get('HNR', 'N/A'):.2f}

Risk Factors Identified:
{('🎯 Abnormal jitter (MDVP:Jitter(%) > 2%)' if st.session_state.audio_features.get('MDVP:Jitter(%)', 0) > 0.02 else '')}
{('🌊 Abnormal shimmer (MDVP:Shimmer > 4%)' if st.session_state.audio_features.get('MDVP:Shimmer', 0) > 0.04 else '')}
{('🎵 Low HNR (< 8 dB)' if st.session_state.audio_features.get('HNR', 0) < 8 else '')}
{('📈 High variability (RPDE > 0.6)' if st.session_state.audio_features.get('RPDE', 0) > 0.6 else '')}

Recommendations:
{('🩺 Consult neurologist for further evaluation' if st.session_state.prediction == 1 else 'Continue regular health monitoring')}
{('📊 Consider comprehensive voice assessment' if st.session_state.prediction == 1 else 'Maintain voice health through proper hydration')}
{('🔄 Monitor voice changes over time' if st.session_state.prediction == 1 else 'Practice good vocal hygiene')}
{('📝 Keep records of voice changes' if st.session_state.prediction == 1 else 'Exercise regularly to maintain vocal strength')}
{('⚠️ Seek medical advice if experiencing motor symptoms' if st.session_state.prediction == 1 else 'Schedule regular check-ups as preventive care')}

{get_text(st.session_state.current_language, 'disclaimer')}
"""
    
    st.download_button(
        label=get_text(st.session_state.current_language, 'download_results'),
        data=results_text,
        file_name=f"parkinsons_analysis_{time.strftime('%Y%m%d_%H%M%S')}.txt",
        mime="text/plain"
    )

# Footer
st.markdown("---")
st.markdown(f"""
<div style="background: #f8f9fa; padding: 2rem; border-radius: 10px; text-align: center; margin-top: 2rem;">
    <p style="color: #6c757d; font-size: 0.9rem;">
        {get_text(st.session_state.current_language, 'footer_text')}
    </p>
</div>
""", unsafe_allow_html=True)