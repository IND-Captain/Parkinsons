#!/usr/bin/env python3
"""
Parkinson's Disease Detection - ML Training Script
====================================================

This script trains a robust classifier for Parkinson's disease detection 
using voice features from UCI datasets.

Author: ML Engineer
Date: 2024
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, classification_report, confusion_matrix
)
from sklearn.impute import SimpleImputer
from imblearn.over_sampling import SMOTE
import joblib
import warnings
import urllib.request
import zipfile
import os
import shap
from pathlib import Path

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# Set random seeds for reproducibility
np.random.seed(42)

class ParkinsonsTrainer:
    """
    A comprehensive trainer for Parkinson's disease detection using voice features.
    """
    
    def __init__(self):
        self.dataset1_url = "https://archive.ics.uci.edu/ml/machine-learning-databases/parkinsons/parkinsons.data"
        self.dataset2_url = "https://archive.ics.uci.edu/ml/machine-learning-databases/parkinsons/telemonitoring/parkinsons_updrs.data"
        self.model_path = "parkinsons_model.pkl"
        self.scaler_path = "feature_scaler.pkl"
        
    def download_dataset(self, url, filename):
        """
        Download dataset from UCI repository.
        """
        print(f"Downloading dataset from: {url}")
        try:
            urllib.request.urlretrieve(url, filename)
            print(f"Successfully downloaded: {filename}")
            return True
        except Exception as e:
            print(f"Error downloading {filename}: {e}")
            return False
    
    def load_dataset1(self):
        """
        Load and process the first Parkinson's dataset.
        """
        print("\n" + "="*60)
        print("LOADING DATASET 1: Parkinson's Dataset")
        print("="*60)
        
        # Download and load dataset
        if not self.download_dataset(self.dataset1_url, "parkinsons.data"):
            return None, None
            
        # Load the dataset
        try:
            # The first column is 'name', which we can use as an index or drop.
            # The first row is the header.
            df = pd.read_csv('parkinsons.data')
            print(f"Dataset 1 loaded successfully with shape: {df.shape}")
            return df, 'dataset1'
        except Exception as e:
            print(f"Error loading dataset 1: {e}")
            return None, None
    
    def load_dataset2(self):
        """
        Load and process the second Parkinson's dataset.
        """
        print("\n" + "="*60)
        print("LOADING DATASET 2: Parkinson's Disease Classification")
        print("="*60)
        
        # Download and load dataset
        if not self.download_dataset(self.dataset2_url, "parkinsons_classification.data"):
            return None, None
            
        try:
            df = pd.read_csv('parkinsons_classification.data')
            print(f"Dataset 2 loaded successfully with shape: {df.shape}")
            
            # Display first few rows and info
            print("\nDataset 2 Info:")
            print(df.info())
            print("\nFirst 5 rows:")
            print(df.head())
            
            return df, 'dataset2'
            
        except Exception as e:
            print(f"Error loading dataset 2: {e}")
            return None, None
    
    def preprocess_features(self, df, dataset_name):
        """
        Preprocess and engineer features from the dataset.
        """
        print(f"\nPreprocessing features for {dataset_name}...")
        
        # Create a copy to avoid SettingWithCopyWarning
        df_processed = df.copy()
        
        if dataset_name == 'dataset1':
            # Dataset 1 specific preprocessing
            # Drop the name column as it's not a feature
            if 'name' in df_processed.columns:
                df_processed = df_processed.drop('name', axis=1)

            # Extract relevant voice features
            voice_features = [
                'MDVP:Fo(Hz)',      # Fundamental frequency
                'MDVP:Fhi(Hz)',      # Maximum fundamental frequency  
                'MDVP:Flo(Hz)',      # Minimum fundamental frequency
                'MDVP:Jitter(%)',    # Jitter
                'MDVP:Jitter(Abs)',   # Absolute jitter
                'MDVP:Shimmer',      # Shimmer
                'MDVP:Shimmer(dB)',  # Shimmer in dB
                'NHR',              # Harmonics-to-noise ratio
                'HNR',              # Harmonics-to-noise ratio
                'RPDE',             # Recurrence period density entropy
                'DFA',              # Detrended fluctuation analysis
                'spread1', 'spread2', # Pitch variation measures
                'D2',               # Pitch variation measure
                'PPE'               # Pitch period entropy
            ]
            
            # Select only available columns
            available_features = [col for col in voice_features if col in df_processed.columns]
            X = df_processed[available_features]
            y = df_processed['status']  # Target variable (0=healthy, 1=Parkinson's)
            
            print(f"Selected {len(available_features)} features: {available_features}")
            
        elif dataset_name == 'dataset2':
            # Dataset 2 specific preprocessing
            # This dataset might have different feature names
            # We'll use all numeric features except the target
            numeric_columns = df_processed.select_dtypes(include=[np.number]).columns.tolist()
            
            # Remove ID columns if present
            feature_columns = [col for col in numeric_columns if 'id' not in col.lower() and 'name' not in col.lower()]
            
            # Assume target is the last column or a column with 'status' or 'class' in name
            target_column = None
            for col in df_processed.columns:
                if 'status' in col.lower() or 'class' in col.lower() or 'target' in col.lower():
                    target_column = col
                    break
            
            if target_column:
                feature_columns = [col for col in feature_columns if col != target_column]
            else:
                # If no clear target found, use the last column
                feature_columns = feature_columns[:-1]
                target_column = df_processed.columns[-1]
            
            X = df_processed[feature_columns]
            y = df_processed[target_column]
            
            print(f"Selected {len(feature_columns)} features from dataset 2")
            print(f"Target column: {target_column}")
            print(f"Feature columns: {feature_columns[:5]}...")  # Show first 5
        
        else:
            raise ValueError(f"Unknown dataset: {dataset_name}")
        
        # Handle missing values
        print("Handling missing values...")
        imputer = SimpleImputer(strategy='median')
        X_imputed = pd.DataFrame(imputer.fit_transform(X), columns=X.columns)
        
        # Check for class imbalance
        print(f"Class distribution: {dict(y.value_counts())}")
        
        return X_imputed, y
    
    def visualize_data_distribution(self, X, y):
        """
        Create visualizations of the data distribution.
        """
        print("\nCreating data distribution visualizations...")
        
        # Create a figure with subplots
        fig, axes = plt.subplots(3, 2, figsize=(15, 18)) # Increased grid size
        fig.suptitle('Parkinson\'s Dataset - Data Distribution Analysis', fontsize=20, fontweight='bold')
        
        # Plot 1: Class distribution
        class_counts = pd.Series(y).value_counts()
        axes[0, 0].bar(class_counts.index, class_counts.values, color=['skyblue', 'lightcoral'])
        axes[0, 0].set_title('Class Distribution (0=Healthy, 1=Parkinson\'s)')
        axes[0, 0].set_ylabel('Count')
        axes[0, 0].set_xlabel('Class')
        
        # Add percentage labels
        for i, count in enumerate(class_counts.values):
            percentage = (count / len(y)) * 100
            axes[0, 0].text(i, count + 10, f'{percentage:.1f}%', ha='center')
        
        # Plot 2: Feature correlation heatmap (first 10 features)
        if len(X.columns) > 0:
            # Select first 10 numerical features for correlation
            feature_subset = X.iloc[:, :10]
            correlation_matrix = feature_subset.corr()
            
            im = axes[0, 1].imshow(correlation_matrix, cmap='coolwarm', aspect='auto')
            axes[0, 1].set_title('Feature Correlation Matrix (First 10 Features)')
            axes[0, 1].set_xticks(range(len(feature_subset.columns)))
            axes[0, 1].set_yticks(range(len(feature_subset.columns)))
            axes[0, 1].set_xticklabels(feature_subset.columns, rotation=45, ha='right')
            axes[0, 1].set_yticklabels(feature_subset.columns)
            plt.colorbar(im, ax=axes[0, 1])
        
        # Plot 3: Distribution of key features
        key_features = ['MDVP:Fo(Hz)', 'NHR', 'HNR'] if 'MDVP:Fo(Hz)' in X.columns else list(X.columns[:3])
        
        for i, feature in enumerate(key_features):
            if feature in X.columns:
                row, col = (1, i % 2) if i < 2 else (2, 0)
                axes[row, col].hist(X[feature], bins=30, alpha=0.7, color='skyblue', edgecolor='black')
                axes[row, col].set_title(f'Distribution of {feature}')
                axes[row, col].set_xlabel(feature)
                axes[row, col].set_ylabel('Frequency')
        
        # Plot 4: Box plots for key features by class
        for i, feature in enumerate(key_features):
            if feature in X.columns:
                df_viz = pd.concat([X[feature], y], axis=1)
                df_viz.columns = [feature, 'class']
                row, col = (1, i % 2) if i < 2 else (2, 1)
                # Create boxplot
                healthy_data = df_viz[df_viz['class'] == 0][feature]
                parkinsons_data = df_viz[df_viz['class'] == 1][feature]
                
                bp_data = [healthy_data, parkinsons_data]
                axes[row, col].boxplot(bp_data, labels=['Healthy', 'Parkinson\'s'])
                axes[row, col].set_title(f'{feature} by Class')
                axes[row, col].set_ylabel(feature)
        
        plt.tight_layout()
        plt.savefig('data_distribution.png', dpi=300, bbox_inches='tight')
        plt.show()
        print("Data distribution plots saved as 'data_distribution.png'")
    
    def train_random_forest(self, X_train, y_train, X_test, y_test, feature_names):
        """
        Train and tune Random Forest classifier.
        """
        print("\n" + "="*60)
        print("TRAINING RANDOM FOREST CLASSIFIER")
        print("="*60)
        
        # Define parameter grid for GridSearchCV
        param_grid = {
            'n_estimators': [50, 100, 200, 300],
            'max_depth': [5, 10, 15, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'max_features': ['sqrt', 'log2', None]
        }
        
        # Create Random Forest classifier
        rf = RandomForestClassifier(random_state=42, n_jobs=-1)
        
        # Perform GridSearchCV with 5-fold cross-validation
        print("Performing hyperparameter tuning with GridSearchCV...")
        grid_search = GridSearchCV(
            estimator=rf,
            param_grid=param_grid,
            cv=5,
            scoring='accuracy',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        # Get best parameters
        best_params = grid_search.best_params_
        print(f"\nBest Random Forest Parameters: {best_params}")
        
        # Train model with best parameters
        best_rf = RandomForestClassifier(**best_params, random_state=42, n_jobs=-1)
        best_rf.fit(X_train, y_train)
        
        # Make predictions
        y_pred = best_rf.predict(X_test)
        y_pred_proba = best_rf.predict_proba(X_test)[:, 1]  # Probability of class 1
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        print(f"\nRandom Forest Performance Metrics:")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"F1-Score: {f1:.4f}")
        print(f"ROC AUC: {roc_auc:.4f}")
        
        # Print detailed classification report
        print(f"\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': feature_names,
            'importance': best_rf.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\nTop 10 Most Important Features:")
        print(feature_importance.head(10))
        
        return best_rf, {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'roc_auc': roc_auc,
            'best_params': best_params,
            'feature_importance': feature_importance
        }
    
    def train_xgboost(self, X_train, y_train, X_test, y_test, feature_names):
        """
        Train and tune XGBoost classifier.
        """
        print("\n" + "="*60)
        print("TRAINING XGBOOST CLASSIFIER")
        print("="*60)
        
        # Define parameter grid for XGBoost
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [3, 5, 7, 9],
            'learning_rate': [0.01, 0.1, 0.2],
            'subsample': [0.8, 0.9, 1.0],
            'colsample_bytree': [0.8, 0.9, 1.0]
        }
        
        # Create XGBoost classifier
        xgb = XGBClassifier(
            random_state=42,
            n_jobs=-1,
            eval_metric='logloss',
            use_label_encoder=False
        )
        
        # Perform GridSearchCV
        print("Performing hyperparameter tuning with GridSearchCV...")
        grid_search = GridSearchCV(
            estimator=xgb,
            param_grid=param_grid,
            cv=5,
            scoring='accuracy',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        # Get best parameters
        best_params = grid_search.best_params_
        print(f"\nBest XGBoost Parameters: {best_params}")
        
        # Train model with best parameters
        best_xgb = XGBClassifier(**best_params, random_state=42, n_jobs=-1)
        best_xgb.fit(X_train, y_train)
        
        # Make predictions
        y_pred = best_xgb.predict(X_test)
        y_pred_proba = best_xgb.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        print(f"\nXGBoost Performance Metrics:")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"F1-Score: {f1:.4f}")
        print(f"ROC AUC: {roc_auc:.4f}")
        
        # Print detailed classification report
        print(f"\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': feature_names,
            'importance': best_xgb.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\nTop 10 Most Important Features:")
        print(feature_importance.head(10))
        
        return best_xgb, {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'roc_auc': roc_auc,
            'best_params': best_params,
            'feature_importance': feature_importance
        }
    
    def evaluate_with_cv(self, X, y, model, model_name):
        """
        Evaluate model using 5-fold cross-validation.
        """
        print(f"\nPerforming 5-fold cross-validation for {model_name}...")
        
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        
        # Calculate cross-validation scores
        cv_scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')
        
        print(f"{model_name} CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        print(f"Individual CV scores: {[f'{score:.4f}' for score in cv_scores]}")
        
        return cv_scores
    
    def save_model(self, model, scaler, model_name, metrics):
        """
        Save the trained model and scaler.
        """
        print(f"\nSaving {model_name} model...")
        
        # Save the model
        joblib.dump(model, self.model_path, compress=3)
        print(f"Model saved as: {self.model_path}")
        
        # Save the scaler
        joblib.dump(scaler, self.scaler_path, compress=3)
        print(f"Scaler saved as: {self.scaler_path}")
        
        # Save model metadata
        metadata = {
            'model_type': model_name,
            'features_used': list(metrics['feature_importance']['feature']),
            'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
            'performance_metrics': {k: v for k, v in metrics.items() if k != 'feature_importance'}
        }
        
        metadata_path = f"{model_name.lower()}_metadata.pkl"
        joblib.dump(metadata, metadata_path)
        print(f"Metadata saved as: {metadata_path}")

    def save_explainer_and_stats(self, model, X_train_scaled, feature_names):
        """Saves SHAP explainer and training data statistics."""
        print("\nCreating and saving SHAP explainer...")
        explainer = shap.TreeExplainer(model)
        joblib.dump(explainer, 'shap_explainer.pkl')
        print("SHAP explainer saved as: shap_explainer.pkl")

        print("Saving training data stats for explanations...")
        training_stats = {'mean': np.mean(X_train_scaled, axis=0), 'std': np.std(X_train_scaled, axis=0), 'columns': feature_names}
        joblib.dump(training_stats, 'training_stats.pkl')
        print("Training stats saved as: training_stats.pkl")

    def save_ood_stats(self, X_train_scaled):
        print("\nCalculating and saving statistics for OOD detection...")
        train_mean = np.mean(X_train_scaled, axis=0)
        joblib.dump(train_mean, 'training_data_mean.pkl')
        print("OOD stats (mean) saved as: training_data_mean.pkl")
    
    def generate_final_report(self, rf_metrics, xgb_metrics):
        """
        Generate a comprehensive final report.
        """
        print("\n" + "="*80)
        print("FINAL TRAINING REPORT")
        print("="*80)
        
        print("\nDataset Information:")
        print("- Two UCI Parkinson's datasets integrated")
        print("- Voice features: pitch, jitter, shimmer, HNR, MFCCs")
        print("- Target: Binary classification (0=Healthy, 1=Parkinson's)")
        
        print("\nModel Comparison:")
        print(f"Random Forest - Accuracy: {rf_metrics['accuracy']:.4f}, F1: {rf_metrics['f1']:.4f}, AUC: {rf_metrics['roc_auc']:.4f}")
        print(f"XGBoost      - Accuracy: {xgb_metrics['accuracy']:.4f}, F1: {xgb_metrics['f1']:.4f}, AUC: {xgb_metrics['roc_auc']:.4f}")
        
        # Determine best model
        if xgb_metrics['accuracy'] > rf_metrics['accuracy']:
            best_model = "XGBoost"
            best_accuracy = xgb_metrics['accuracy']
            best_f1 = xgb_metrics['f1']
            best_auc = xgb_metrics['roc_auc']
        else:
            best_model = "Random Forest"
            best_accuracy = rf_metrics['accuracy']
            best_f1 = rf_metrics['f1']
            best_auc = rf_metrics['roc_auc']
        
        print(f"\nBest Model: {best_model}")
        print(f"Best Accuracy: {best_accuracy:.4f}")
        print(f"Best F1-Score: {best_f1:.4f}")
        print(f"Best ROC AUC: {best_auc:.4f}")
        
        if best_accuracy >= 0.90:
            print(f"\n🎉 SUCCESS: Target accuracy of 90%+ achieved!")
            print("Model is ready for deployment.")
        else:
            print(f"\n⚠️  WARNING: Accuracy {best_accuracy:.4f} is below 90% target.")
            print("Consider additional feature engineering or data collection.")
        
        return best_model, best_accuracy
    
    def run_training_pipeline(self):
        """
        Run the complete training pipeline.
        """
        print("🚀 Starting Parkinson's Disease Detection Training Pipeline")
        print("=" * 80)
        
        # Load datasets
        df1, name1 = self.load_dataset1() # We will focus on dataset 1
        df2, name2 = self.load_dataset2()
        
        if df1 is None and df2 is None:
            print("❌ Failed to load both datasets. Exiting.")
            return
        
        # Use dataset 1 as primary (more comprehensive voice features)
        if df1 is not None: # Focus on the first dataset which is suitable for classification
            print(f"\nUsing {name1} as the primary dataset for classification.")
            X, y = self.preprocess_features(df1, name1)
            
            # Store feature names before data is converted to numpy array
            feature_names = X.columns.tolist()
            
            # Visualize data distribution
            self.visualize_data_distribution(X, y)
            
            # Handle class imbalance with SMOTE
            print("\nApplying SMOTE for class balance...")
            smote = SMOTE(random_state=42)
            X_resampled, y_resampled = smote.fit_resample(X, y)
            
            print(f"Original dataset shape: {X.shape}")
            print(f"Resampled dataset shape: {X_resampled.shape}")
            print(f"Class distribution after SMOTE: {dict(pd.Series(y_resampled).value_counts())}")
            
            # Split the data
            X_train, X_test, y_train, y_test = train_test_split(
                X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled
            )
            
            print(f"Training set shape: {X_train.shape}")
            print(f"Test set shape: {X_test.shape}")
            
            # Scale features
            print("\nScaling features...")
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Save statistics for OOD detection
            self.save_ood_stats(X_train_scaled)
            
            # Train Random Forest
            rf_model, rf_metrics = self.train_random_forest(X_train_scaled, y_train, X_test_scaled, y_test, feature_names)
            
            # Train XGBoost
            xgb_model, xgb_metrics = self.train_xgboost(X_train_scaled, y_train, X_test_scaled, y_test, feature_names)
            
            # Save the best model
            if xgb_metrics['accuracy'] > rf_metrics['accuracy']:
                best_model = xgb_model
                self.save_model(best_model, scaler, "XGBoost", xgb_metrics)
                self.save_explainer_and_stats(best_model, X_train_scaled, feature_names)
            else:
                best_model = rf_model
                self.save_model(best_model, scaler, "RandomForest", rf_metrics)
                self.save_explainer_and_stats(best_model, X_train_scaled, feature_names)
            
            # Generate final report
            self.generate_final_report(rf_metrics, xgb_metrics)
            
            print(f"\n✅ Training completed successfully!")
            print(f"📁 Model saved as: {self.model_path}")
            print(f"📁 Scaler saved as: {self.scaler_path}")
            print("\nModel is ready for integration into the web application.")
        
        else:
            print("❌ No valid dataset loaded. Exiting.")

def main():
    """
    Main function to run the training pipeline.
    """
    trainer = ParkinsonsTrainer()
    trainer.run_training_pipeline()

if __name__ == "__main__":
    main()