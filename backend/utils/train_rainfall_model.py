"""
Train Rainfall Prediction Model
Based on your dataset columns: Temperature, Humidity, Wind_Speed, Cloud_Cover, Pressure, Rain
"""

import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# --------------------------------------------------
# Resolve paths safely
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'weather_forecast_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, '..', 'models', 'rainfall_model.pkl')

# Load dataset
print("Loading dataset...")
df = pd.read_csv(CSV_PATH)


print(f"Dataset shape: {df.shape}")
print(f"\nColumns: {df.columns.tolist()}")
print(f"\nFirst few rows:")
print(df.head())

# Check class distribution
print(f"\nTarget distribution:")
print(df['Rain'].value_counts())

# Prepare features and target
X = df[['Temperature', 'Humidity', 'Wind_Speed', 'Cloud_Cover', 'Pressure']]
y = df['Rain']

# Encode target: 'rain' -> 1, 'no rain' -> 0
le = LabelEncoder()
y_encoded = le.fit_transform(y)

print(f"\nFeature columns: {X.columns.tolist()}")
print(f"Target classes: {le.classes_}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

print(f"\nTraining set: {X_train.shape[0]} samples")
print(f"Test set: {X_test.shape[0]} samples")

# Train Random Forest model
print("\nTraining Random Forest Classifier...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    class_weight='balanced'  # Handle imbalanced data
)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n{'='*60}")
print(f"MODEL EVALUATION")
print(f"{'='*60}")
print(f"Accuracy: {accuracy:.2%}")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))
print(f"\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Feature importance
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print(f"\nFeature Importance:")
print(feature_importance)

# --------------------------------------------------
# Save model safely
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'rainfall_model.pkl')

# Create models directory if not exists
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(model, MODEL_PATH)
print(f"\n✓ Model saved to: {MODEL_PATH}")

# Test prediction
print(f"\n{'='*60}")
print(f"TEST PREDICTION")
print(f"{'='*60}")

# Sample test case
test_sample = pd.DataFrame([{
    'Temperature': 23.72,
    'Humidity': 89.59,
    'Wind_Speed': 1.34,
    'Cloud_Cover': 50.50,
    'Pressure': 1032.38
}])

prediction = model.predict(test_sample)
probability = model.predict_proba(test_sample)

print(f"Test input: {test_sample.to_dict('records')[0]}")
print(f"Prediction: {le.classes_[prediction[0]]}")
print(f"Probability: {probability[0][1]*100:.1f}% chance of rain")

print(f"\n{'='*60}")
print(f"Model is ready to use!")
print(f"{'='*60}")
