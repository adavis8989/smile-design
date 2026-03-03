#!/bin/bash
# Download face-api.js model files for local serving
# These models are required for face detection and landmark recognition

MODEL_DIR="public/models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

mkdir -p "$MODEL_DIR"

echo "Downloading face-api.js models..."

# Tiny Face Detector model
curl -sL "$BASE_URL/tiny_face_detector_model-shard1" -o "$MODEL_DIR/tiny_face_detector_model-shard1"
curl -sL "$BASE_URL/tiny_face_detector_model-weights_manifest.json" -o "$MODEL_DIR/tiny_face_detector_model-weights_manifest.json"

# Face Landmark 68 Tiny model
curl -sL "$BASE_URL/face_landmark_68_tiny_model-shard1" -o "$MODEL_DIR/face_landmark_68_tiny_model-shard1"
curl -sL "$BASE_URL/face_landmark_68_tiny_model-weights_manifest.json" -o "$MODEL_DIR/face_landmark_68_tiny_model-weights_manifest.json"

echo "Models downloaded to $MODEL_DIR"
ls -la "$MODEL_DIR"
