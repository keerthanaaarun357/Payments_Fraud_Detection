from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load the trained model and encoder when the app starts
try:
    model = joblib.load('fraud_detection_model.pkl')
    encoder = joblib.load('label_encoder.pkl')
    feature_names = joblib.load('feature_names.pkl')
    print("Model loaded successfully!")
    print("Features expected:", feature_names)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    encoder = None
    feature_names = None

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/predict')
def predict_form():
    return render_template('predict.html')

@app.route('/submit', methods=['POST'])
def submit():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Get form data
        data = request.get_json() if request.is_json else request.form
        
        features = {
            'step': float(data.get('step', 0)),
            'type': data.get('type', 'PAYMENT'), 
            'amount': float(data.get('amount', 0)),
            'oldbalanceOrg': float(data.get('oldbalanceOrg', 0)),
            'newbalanceOrig': float(data.get('newbalanceOrig', 0)),
            'oldbalanceDest': float(data.get('oldbalanceDest', 0)),
            'newbalanceDest': float(data.get('newbalanceDest', 0))
        }
        
        # Create DataFrame for prediction
        df_input = pd.DataFrame([features])
        
        # Encode the 'type' column
        try:
            df_input['type'] = encoder.transform(df_input['type'])
        except ValueError as e:
            # Handle unknown transaction types
            print(f"Unknown transaction type: {features['type']}")
            return jsonify({'error': f'Unknown transaction type: {features["type"]}'}), 400
        
        # Make prediction
        prediction = model.predict(df_input)[0]
        probability = model.predict_proba(df_input)[0]
        
        # Prepare result
        result = {
            'prediction': 'Fraud' if prediction == 1 else 'Not Fraud',
            'probability_not_fraud': float(probability[0]),
            'probability_fraud': float(probability[1]),
            'confidence': float(max(probability)),
            'input_data': features
        }
        
        return render_template('submit.html', result=result)
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def api_predict():
    """API endpoint for predictions"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.get_json()
        
        # Extract features
        features = {
            'step': float(data.get('step', 0)),
            'type': data.get('type', 'PAYMENT'),
            'amount': float(data.get('amount', 0)),
            'oldbalanceOrg': float(data.get('oldbalanceOrg', 0)),
            'newbalanceOrig': float(data.get('newbalanceOrig', 0)),
            'oldbalanceDest': float(data.get('oldbalanceDest', 0)),
            'newbalanceDest': float(data.get('newbalanceDest', 0))
        }
        
        # Create DataFrame
        df_input = pd.DataFrame([features])
        
        # Encode type
        df_input['type'] = encoder.transform(df_input['type'])
        
        # Predict
        prediction = model.predict(df_input)[0]
        probability = model.predict_proba(df_input)[0]
        
        return jsonify({
            'prediction': int(prediction),
            'is_fraud': bool(prediction),
            'probability_fraud': float(probability[1]),
            'probability_not_fraud': float(probability[0])
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)