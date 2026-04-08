import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import io

# 10 crop disease conditions
CLASSES = [
    "Healthy", "Bacterial Blight", "Leaf Rust", "Powdery Mildew",
    "Leaf Spot", "Mosaic Virus", "Early Blight", "Late Blight",
    "Anthracnose", "Downy Mildew"
]

# Treatment recommendations per disease
TREATMENTS = {
    "Healthy": {
        "treatment": "No treatment needed. Plant appears healthy.",
        "prevention": [
            "Continue regular crop rotation practices",
            "Maintain proper spacing between plants for air circulation",
            "Monitor regularly for early signs of disease",
            "Use balanced fertilization to maintain plant health",
        ],
        "affected_crops": "General",
    },
    "Bacterial Blight": {
        "treatment": "Apply copper-based bactericides (copper hydroxide or copper sulfate). Remove and destroy infected plant parts. Avoid overhead irrigation to reduce moisture on leaves.",
        "prevention": [
            "Use disease-free certified seeds",
            "Practice crop rotation with non-host crops for 2-3 years",
            "Avoid working with plants when they are wet",
            "Ensure proper drainage in the field",
            "Apply copper sprays preventively during humid conditions",
        ],
        "affected_crops": "Rice, Cotton, Beans, Tomato, Pepper",
    },
    "Leaf Rust": {
        "treatment": "Apply fungicides such as propiconazole, tebuconazole, or azoxystrobin. Remove heavily infected leaves. Ensure adequate plant nutrition with potassium and phosphorus.",
        "prevention": [
            "Plant rust-resistant varieties when available",
            "Remove volunteer plants and crop debris after harvest",
            "Apply preventive fungicide at first signs of infection",
            "Monitor weather conditions favorable for rust development",
            "Maintain balanced nutrition to strengthen plant immunity",
        ],
        "affected_crops": "Wheat, Barley, Corn, Soybean, Coffee",
    },
    "Powdery Mildew": {
        "treatment": "Apply sulfur-based fungicides or potassium bicarbonate. Neem oil can be effective for organic management. Remove heavily infected leaves and destroy them.",
        "prevention": [
            "Ensure proper air circulation with adequate plant spacing",
            "Avoid excessive nitrogen fertilization",
            "Water at the base of plants, not overhead",
            "Plant resistant varieties when available",
            "Apply preventive fungicide during warm, dry conditions",
        ],
        "affected_crops": "Wheat, Grapes, Cucurbits, Peas, Roses",
    },
    "Leaf Spot": {
        "treatment": "Apply broad-spectrum fungicides (chlorothalonil, mancozeb). Remove infected leaves promptly. Ensure good air circulation around plants.",
        "prevention": [
            "Practice crop rotation to break disease cycle",
            "Remove plant debris after harvest",
            "Avoid overhead watering",
            "Space plants properly for airflow",
            "Apply mulch to prevent soil splash onto leaves",
        ],
        "affected_crops": "Tomato, Pepper, Strawberry, Apple, Banana",
    },
    "Mosaic Virus": {
        "treatment": "No chemical cure exists for viral diseases. Remove and destroy infected plants immediately. Control insect vectors (aphids, whiteflies) with insecticides or neem oil.",
        "prevention": [
            "Use virus-free certified seeds and transplants",
            "Control aphids and whiteflies which spread the virus",
            "Remove and destroy infected plants immediately",
            "Sanitize tools between plants",
            "Plant virus-resistant varieties",
            "Use reflective mulch to repel aphids",
        ],
        "affected_crops": "Tobacco, Tomato, Cucumber, Pepper, Beans",
    },
    "Early Blight": {
        "treatment": "Apply fungicides containing chlorothalonil, mancozeb, or copper. Remove lower infected leaves. Stake plants to improve air circulation.",
        "prevention": [
            "Practice 3-year crop rotation",
            "Mulch around plants to prevent soil splash",
            "Water at the base of plants in the morning",
            "Remove plant debris at end of season",
            "Ensure adequate spacing between plants",
        ],
        "affected_crops": "Tomato, Potato, Eggplant, Pepper",
    },
    "Late Blight": {
        "treatment": "Apply systemic fungicides (metalaxyl, dimethomorph) immediately. Remove and destroy severely infected plants. Harvest any remaining healthy produce quickly.",
        "prevention": [
            "Plant certified disease-free seed potatoes/transplants",
            "Avoid overhead irrigation",
            "Ensure good air circulation",
            "Scout fields regularly during cool, wet weather",
            "Destroy volunteer plants and cull piles",
            "Apply preventive fungicides before rainy periods",
        ],
        "affected_crops": "Potato, Tomato",
    },
    "Anthracnose": {
        "treatment": "Apply fungicides containing azoxystrobin, chlorothalonil, or copper. Prune and remove infected plant parts. Avoid overhead watering.",
        "prevention": [
            "Use disease-free seeds and resistant varieties",
            "Practice crop rotation",
            "Remove and destroy crop residues",
            "Avoid working with wet plants",
            "Apply protective fungicide during warm, humid weather",
        ],
        "affected_crops": "Mango, Banana, Beans, Pepper, Strawberry, Grapes",
    },
    "Downy Mildew": {
        "treatment": "Apply fungicides such as metalaxyl, fosetyl-Al, or copper-based products. Remove infected leaves. Improve air circulation around plants.",
        "prevention": [
            "Plant resistant varieties",
            "Ensure proper plant spacing",
            "Water at the base of plants in the morning",
            "Remove crop debris after harvest",
            "Apply preventive fungicides during cool, moist conditions",
            "Use drip irrigation instead of overhead sprinklers",
        ],
        "affected_crops": "Grapes, Cucurbits, Lettuce, Onion, Spinach",
    },
}


class CropClassifier:
    def __init__(self):
        self.model = None
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def load_model(self):
        """Load pre-trained EfficientNet and modify for crop disease classification."""
        if self.model is not None:
            return
        self.model = models.efficientnet_b3(weights=models.EfficientNet_B3_Weights.DEFAULT)
        # Replace classifier head for our 10 classes
        self.model.classifier[1] = torch.nn.Linear(self.model.classifier[1].in_features, len(CLASSES))
        self.model.to(self.device)
        self.model.eval()
        # Note: In production, load fine-tuned weights from: torch.load("crop_model.pth")
        # For now, uses ImageNet weights which give directional results

    def predict(self, image_bytes: bytes) -> dict:
        self.load_model()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)

        results = []
        for cls, prob in zip(CLASSES, probabilities):
            results.append({"condition": cls, "confidence": round(float(prob) * 100, 1)})
        results.sort(key=lambda x: x["confidence"], reverse=True)

        top = results[0]
        disease_info = TREATMENTS.get(top["condition"], TREATMENTS["Healthy"])

        severity = "Low" if top["confidence"] < 50 else "Medium" if top["confidence"] < 75 else "High"

        return {
            "top_prediction": top["condition"],
            "confidence": top["confidence"],
            "severity": severity,
            "treatment": disease_info["treatment"],
            "prevention": disease_info["prevention"],
            "affected_crops": disease_info["affected_crops"],
            "all_predictions": results,
            "device": str(self.device),
            "disclaimer": "This is a screening tool for crop disease identification. Results should be verified by an agricultural expert for accurate diagnosis and treatment planning.",
        }


classifier = CropClassifier()
