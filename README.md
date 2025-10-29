# 💳 Payments Fraud Detection

## 📘 Overview
The **Payments Fraud Detection System** is a machine learning web application built using **Flask**.  
It predicts whether a transaction is fraudulent based on given input features such as amount, type, and old/new balances.  
The system uses an **XGBoost** model for classification and provides an interactive web interface for user input.

---

## 🧠 Features
- 🧮 Machine Learning model using **XGBoost**
- 🌐 Web interface built with **Flask**
- 📊 Real-time prediction of fraudulent transactions
- 💾 Modular code with separate training and app logic
- ⚡ Easy deployment and local execution

## 🚀 Installation and Setup

Follow these steps to set up and run the project locally:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/keerthanaaarun357/Payments_Fraud_Detection.git
cd Payments_Fraud_Detection
````

### 2️⃣ Create a Virtual Environment

```bash
python -m venv venv
```

### 3️⃣ Activate the Environment

* **Windows (PowerShell):**

  ```bash
  venv\Scripts\activate
  ```
* **macOS/Linux:**

  ```bash
  source venv/bin/activate
  ```

### 4️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 5️⃣ Run the Application

```bash
python app.py
```

### 6️⃣ Open in Browser

Go to:
👉 [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 📈 Future Improvements

* Integrate user authentication
* Store transactions in a database
* Create an API endpoint for prediction
* Deploy to cloud (Render / AWS / Heroku)


