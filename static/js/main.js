// Main JavaScript file for fraud detection frontend

// API base URL (adjust if needed)
const API_BASE = '';

// Function to make API calls
async function makeAPICall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(endpoint, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API call failed');
        }

        return result;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Function to handle fraud prediction form submission
async function handlePredictionForm(event) {
    event.preventDefault();
    
    // Get form data
    const form = event.target;
    const formData = new FormData(form);
    
    // Convert form data to object
    const transactionData = {
        type: formData.get('type'),
        amount: parseFloat(formData.get('amount')),
        oldbalanceOrig: parseFloat(formData.get('oldbalanceOrig')),
        newbalanceOrig: parseFloat(formData.get('newbalanceOrig')),
        oldbalanceDest: parseFloat(formData.get('oldbalanceDest')),
        newbalanceDest: parseFloat(formData.get('newbalanceDest')),
        step: parseInt(formData.get('step'))
    };

    // Validate data
    if (!validateTransactionData(transactionData)) {
        showError('Please fill in all required fields with valid values.');
        return;
    }

    // Show loading state
    showLoading(true);

    try {
        // Make prediction API call
        const result = await makeAPICall('/predict', 'POST', transactionData);
        
        // Display results
        displayPredictionResult(result);
        
    } catch (error) {
        showError('Failed to make prediction: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Validate transaction data
function validateTransactionData(data) {
    const requiredFields = ['type', 'amount', 'oldbalanceOrig', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest', 'step'];
    
    for (const field of requiredFields) {
        if (data[field] === null || data[field] === undefined || data[field] === '' || isNaN(data[field]) && typeof data[field] === 'number') {
            return false;
        }
    }
    
    return true;
}

// Display prediction result
function displayPredictionResult(result) {
    const resultContainer = document.getElementById('prediction-result');
    
    if (!resultContainer) {
        console.error('Result container not found');
        return;
    }

    // Create result HTML
    let resultHTML = `
        <div class="result-card ${result.is_fraud ? 'fraud' : 'legitimate'}">
            <h3>Prediction Result</h3>
            <div class="prediction-status">
                <strong>Status:</strong> ${result.is_fraud ? 'FRAUD DETECTED' : 'LEGITIMATE TRANSACTION'}
            </div>
    `;

    if (result.probability) {
        resultHTML += `
            <div class="probability-section">
                <h4>Confidence Scores:</h4>
                <div class="probability-bar">
                    <div class="prob-item">
                        <span>Legitimate:</span>
                        <div class="bar">
                            <div class="fill legitimate" style="width: ${(result.probability.legitimate * 100).toFixed(1)}%"></div>
                        </div>
                        <span>${(result.probability.legitimate * 100).toFixed(1)}%</span>
                    </div>
                    <div class="prob-item">
                        <span>Fraud:</span>
                        <div class="bar">
                            <div class="fill fraud" style="width: ${(result.probability.fraud * 100).toFixed(1)}%"></div>
                        </div>
                        <span>${(result.probability.fraud * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    if (result.risk_level) {
        resultHTML += `
            <div class="risk-level">
                <strong>Risk Level:</strong> 
                <span class="risk-badge ${result.risk_level.toLowerCase()}">${result.risk_level}</span>
            </div>
        `;
    }

    resultHTML += `
            <div class="metadata">
                <small>Prediction made at: ${new Date(result.timestamp).toLocaleString()}</small>
            </div>
        </div>
    `;

    resultContainer.innerHTML = resultHTML;
    resultContainer.style.display = 'block';
}

// Show loading state
function showLoading(isLoading) {
    const loadingElement = document.getElementById('loading');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (loadingElement) {
        loadingElement.style.display = isLoading ? 'block' : 'none';
    }
    
    if (submitButton) {
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Processing...' : 'Predict Fraud';
    }
}

// Show error message
function showError(message) {
    const errorContainer = document.getElementById('error-message');
    
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Check model status
async function checkModelStatus() {
    try {
        const health = await makeAPICall('/health');
        const modelInfo = await makeAPICall('/model-info');
        
        const statusElement = document.getElementById('model-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="status-item">
                    <strong>Model Status:</strong> ${health.model_loaded ? '✅ Loaded' : '❌ Not Loaded'}
                </div>
                <div class="status-item">
                    <strong>Model Type:</strong> ${modelInfo.model_type || 'Unknown'}
                </div>
                <div class="status-item">
                    <strong>Features:</strong> ${modelInfo.feature_count}
                </div>
            `;
        }
    } catch (error) {
        console.error('Failed to check model status:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Attach form submission handler
    const predictionForm = document.getElementById('prediction-form');
    if (predictionForm) {
        predictionForm.addEventListener('submit', handlePredictionForm);
    }
    
    // Check model status on page load
    checkModelStatus();
    
    // Add input validation
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.setCustomValidity('Value must be non-negative');
            } else {
                this.setCustomValidity('');
            }
        });
    });
});

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Add these functions to your existing main.js

document.addEventListener('DOMContentLoaded', function() {
    // Form validation and enhancement
    const form = document.querySelector('.prediction-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
                return false;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('.btn-predict');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Analyzing...';
            submitBtn.disabled = true;
            
            // Re-enable button after 3 seconds (fallback)
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 3000);
        });
    }
    
    // Balance validation
    const oldBalanceOrig = document.getElementById('oldbalanceOrg');
    const newBalanceOrig = document.getElementById('newbalanceOrig');
    const amount = document.getElementById('amount');
    
    if (oldBalanceOrig && newBalanceOrig && amount) {
        // Auto-calculate new balance based on transaction type and amount
        const transactionType = document.getElementById('type');
        
        function updateBalance() {
            const oldBal = parseFloat(oldBalanceOrig.value) || 0;
            const transAmount = parseFloat(amount.value) || 0;
            const type = transactionType.value;
            
            if (type && oldBal >= 0 && transAmount > 0) {
                let newBal = oldBal;
                
                switch(type) {
                    case 'PAYMENT':
                    case 'TRANSFER':
                    case 'CASH_OUT':
                    case 'DEBIT':
                        newBal = Math.max(0, oldBal - transAmount);
                        break;
                    case 'CASH_IN':
                        newBal = oldBal + transAmount;
                        break;
                }
                
                // Only auto-fill if the field is empty or has default value
                if (newBalanceOrig.value === '' || newBalanceOrig.value === '0') {
                    newBalanceOrig.value = newBal.toFixed(2);
                }
            }
        }
        
        amount.addEventListener('input', updateBalance);
        transactionType.addEventListener('change', updateBalance);
        oldBalanceOrig.addEventListener('input', updateBalance);
    }
    
    // API prediction function (alternative to form submission)
    window.predictFraud = async function(data) {
        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Prediction error:', error);
            return { error: error.message };
        }
    };
    
    // Animate probability bars on result page
    const probBars = document.querySelectorAll('.prob-fill');
    if (probBars.length > 0) {
        // Animate bars after page load
        setTimeout(() => {
            probBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        }, 500);
    }
});

function validateForm() {
    const requiredFields = [
        'step', 'type', 'amount', 'oldbalanceOrg', 
        'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && (field.value === '' || field.value === null)) {
            field.style.borderColor = '#ff6b6b';
            isValid = false;
            
            // Reset border color after user starts typing
            field.addEventListener('input', function() {
                this.style.borderColor = '#ddd';
            }, { once: true });
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields.');
    }
    
    return isValid;
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}