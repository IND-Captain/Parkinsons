import shap
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import streamlit as st

def plot_shap_summary(explainer, X_scaled, feature_names):
    """Generates and displays a SHAP summary bar chart."""
    shap_values = explainer(X_scaled)
    
    fig, ax = plt.subplots()
    shap.summary_plot(shap_values.values, feature_names=feature_names, plot_type="bar", show=False)
    st.pyplot(fig)

def plot_shap_force_plot(explainer, X_scaled, feature_names):
    """Generates and displays a SHAP force plot for a single prediction."""
    shap_values = explainer(X_scaled)
    
    # SHAP force plot requires a JS visualization, so we use st.components.v1
    force_plot_html = shap.force_plot(
        explainer.expected_value, 
        shap_values.values[0], 
        feature_names,
        link="logit",
        matplotlib=True
    )
    st.components.v1.html(force_plot_html.html(), height=150)

def get_feature_status(X_scaled, training_stats):
    """
    Determines the status (Normal, Elevated, Abnormal) of each feature
    by comparing it to the training data distribution.
    """
    feature_names = training_stats['columns']
    mean = training_stats['mean']
    std = training_stats['std']
    
    status_list = []
    for i, feature in enumerate(feature_names):
        value = X_scaled[0, i]
        z_score = (value - mean[i]) / (std[i] + 1e-6)
        
        status = "Normal"
        if abs(z_score) > 2.5:
            status = "Abnormal"
        elif abs(z_score) > 1.5:
            status = "Elevated"
            
        status_list.append({
            'Feature': feature,
            'Value': f"{value:.3f}",
            'Status': status,
            'Z-Score': f"{z_score:.2f}"
        })
    return pd.DataFrame(status_list)

def generate_plain_language_explanation(explainer, X_scaled, feature_names, prediction):
    """
    Generates a human-readable explanation of the prediction.
    """
    shap_values = explainer(X_scaled)
    
    # Get the top 3 features contributing to the prediction
    feature_impact = pd.DataFrame({
        'feature': feature_names,
        'shap_value': shap_values.values[0]
    })
    
    if prediction == 1: # At Risk
        explanation = "The model's prediction of 'At Risk' was primarily influenced by the following factors:\n"
        top_features = feature_impact.sort_values('shap_value', ascending=False).head(3)
        for _, row in top_features.iterrows():
            explanation += f"- **{row['feature']}**: This feature had a significant impact, pushing the prediction towards a higher risk score.\n"
        explanation += "\nThese patterns are similar to those seen in the voice recordings of individuals with Parkinson's in our training data."
    else: # Likely Healthy
        explanation = "The model's prediction of 'Likely Healthy' was based on these key observations:\n"
        top_features = feature_impact.sort_values('shap_value', ascending=True).head(3)
        for _, row in top_features.iterrows():
            explanation += f"- **{row['feature']}**: This feature showed patterns consistent with healthy voice samples, pushing the prediction towards a lower risk score.\n"
        explanation += "\nOverall, your voice did not exhibit the key biomarkers strongly associated with Parkinson's risk in our training data."
        
    return explanation