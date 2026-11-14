import os
import re
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
# Enable CORS for all routes so frontend on any port can communicate seamlessly
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Find spam_model.pkl in root or local directory
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATHS = [
    BASE_DIR.parent / "spam_model.pkl",
    BASE_DIR / "spam_model.pkl",
    Path("spam_model.pkl").resolve()
]

model = None
model_path_used = None

for p in MODEL_PATHS:
    if p.exists():
        try:
            model = joblib.load(p)
            model_path_used = str(p)
            print(f"[Backend] Successfully loaded model from: {model_path_used}")
            break
        except Exception as e:
            print(f"[Backend] Error loading {p}: {e}")

if model is None:
    print("[Backend] WARNING: spam_model.pkl not found!")

# Common keywords often found in spam messages for explanatory context
COMMON_SPAM_SIGNALS = [
    "free", "win", "winner", "winning", "cash", "prize", "urgent", "claim",
    "call", "call now", "txt", "reply", "stop", "guaranteed", "credit", "loan",
    "congratulations", "selected", "awarded", "reward", "exclusive", "offer",
    "account", "verify", "alert", "password", "bank", "refund", "100%", "click here"
]

SAMPLE_MESSAGES = [
    {
        "id": "spam-1",
        "category": "spam",
        "title": "Lottery Win",
        "text": "Congratulations! You have won a $1,000 Walmart Gift Card. Call 0800-123-456 now to claim your code. T&Cs apply."
    },
    {
        "id": "spam-2",
        "category": "spam",
        "title": "Urgent Bank Notice",
        "text": "URGENT: Your bank account has been temporarily suspended due to unusual activity. Verify now at http://secure-verify.net to restore access."
    },
    {
        "id": "spam-3",
        "category": "spam",
        "title": "Free Ringtone / Credit",
        "text": "Free entry in 2 a wkly comp to win a £1000 cup final ticket! Txt POD to 87121 to enter. Standard rates apply."
    },
    {
        "id": "ham-1",
        "category": "ham",
        "title": "Meeting Friend",
        "text": "Hey, are we still meeting up for coffee around 4:30 PM today? Let me know if that time still works for you."
    },
    {
        "id": "ham-2",
        "category": "ham",
        "title": "Family Update",
        "text": "Mom called to ask if you're coming home for dinner this Sunday. Don't forget to give her a quick call back!"
    },
    {
        "id": "ham-3",
        "category": "ham",
        "title": "Package Arrival",
        "text": "Hi Alex, your delivery package was left by the front porch next to the planter. Have a great evening!"
    }
]

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "model_path": model_path_used,
        "classes": list(model.classes_) if model is not None else []
    })

@app.route("/api/samples", methods=["GET"])
def get_samples():
    return jsonify({
        "samples": SAMPLE_MESSAGES
    })

@app.route("/api/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({
            "error": "Trained ML model is not loaded. Ensure spam_model.pkl exists."
        }), 500

    data = request.get_json(silent=True) or {}
    message = data.get("message", "")

    if not isinstance(message, str) or not message.strip():
        return jsonify({
            "error": "Please provide a valid, non-empty SMS message text."
        }), 400

    cleaned_msg = message.strip()

    try:
        # Run real model prediction
        prediction_label = model.predict([cleaned_msg])[0]  # returns 'spam' or 'ham'
        
        # Calculate probabilities
        probabilities = {}
        confidence = 0.0
        
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba([cleaned_msg])[0]
            classes = list(model.classes_)
            for cls_name, prob_val in zip(classes, probs):
                probabilities[cls_name] = round(float(prob_val) * 100, 2)
            
            # Confidence is the probability of the predicted class
            pred_idx = classes.index(prediction_label) if prediction_label in classes else 0
            confidence = round(float(probs[pred_idx]) * 100, 2)
        else:
            confidence = 100.0
            probabilities = {
                "ham": 100.0 if prediction_label == "ham" else 0.0,
                "spam": 100.0 if prediction_label == "spam" else 0.0
            }

        # Analyze detected trigger signals
        lower_msg = cleaned_msg.lower()
        detected_signals = [sig for sig in COMMON_SPAM_SIGNALS if re.search(r'\b' + re.escape(sig) + r'\b', lower_msg)]

        # Text statistics
        words = cleaned_msg.split()
        stats = {
            "characters": len(cleaned_msg),
            "words": len(words),
            "uppercase_letters": sum(1 for c in cleaned_msg if c.isupper()),
            "digits": sum(1 for c in cleaned_msg if c.isdigit()),
            "uppercase_ratio": round((sum(1 for c in cleaned_msg if c.isupper()) / max(len(cleaned_msg), 1)) * 100, 1)
        }

        is_spam = (prediction_label.lower() == "spam")

        return jsonify({
            "success": True,
            "message": cleaned_msg,
            "prediction": "SPAM" if is_spam else "HAM",
            "label": prediction_label.lower(),
            "is_spam": is_spam,
            "confidence": confidence,
            "probabilities": {
                "spam": probabilities.get("spam", 0.0),
                "ham": probabilities.get("ham", 0.0)
            },
            "stats": stats,
            "detected_triggers": detected_signals
        })

    except Exception as e:
        return jsonify({
            "error": f"Failed to perform classification: {str(e)}"
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"[Backend] Starting Flask server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
