import pickle
import cv2
import torch
import numpy as np
import torchvision.models as models
import torchvision.transforms as transforms
from flask import Flask, request, jsonify
import os
from flask_cors import CORS

# -----------------------------------
# Initialize Flask App
# -----------------------------------
app = Flask(__name__)
CORS(app)

# -----------------------------------
# Load trained ML model (.pkl)
# -----------------------------------

with open("lung_cancer_model.pkl", "rb") as f:
    model = pickle.load(f)

print("Logistic Regression model loaded")

# -----------------------------------
# Load ResNet18 Feature Extractor
# -----------------------------------

from torchvision.models import resnet18, ResNet18_Weights

resnet = resnet18(weights=ResNet18_Weights.DEFAULT)
feature_extractor = torch.nn.Sequential(*list(resnet.children())[:-1])
feature_extractor.eval()

print("ResNet18 loaded")

# -----------------------------------
# Image Preprocessing
# -----------------------------------

transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485,0.456,0.406],
        std=[0.229,0.224,0.225]
    )
])

# -----------------------------------
# Feature Extraction Function
# -----------------------------------

def extract_features(image_path):

    img = cv2.imread(image_path)

    if img is None:
        raise ValueError("Invalid image file")

    img = cv2.resize(img,(224,224))

    img = transform(img).unsqueeze(0)

    with torch.no_grad():
        features = feature_extractor(img)

    return features.flatten().numpy()

# -----------------------------------
# Prediction Function
# -----------------------------------

def predict_image(image_path):

    feature = extract_features(image_path)

    feature = feature.reshape(1,-1)

    prediction = model.predict(feature)[0]

    if prediction == 1:
        return "Cancerous"
    else:
        return "Non-Cancerous"

# -----------------------------------
# API Endpoint
# -----------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    temp_path = "temp_image.png"
    file.save(temp_path)

    try:
        result = predict_image(temp_path)
    except Exception as e:
        return jsonify({"error": str(e)})

    os.remove(temp_path)

    return jsonify({
        "prediction": result
    })

@app.route("/")
def home():
    return "Lung Cancer Detection API is running"

# -----------------------------------
# Run Server
# -----------------------------------

if __name__ == "__main__":
    app.run(debug=True)