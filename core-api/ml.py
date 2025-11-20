# core-api/ml.py
import numpy as np
from sklearn.linear_model import LinearRegression

class CarbonPredictor:
    def __init__(self):
        self.model = None
        self.is_trained = False

    def train_mock_model(self):
        """Trains a simple regression model on startup."""
        print("🧠 Training ML Model...")
        X = []
        y = []
        # Synthetic training data
        for _ in range(100):
            img = np.random.randint(10000, 5000000) 
            script = np.random.randint(10000, 2000000)
            total = img + script + np.random.randint(1000, 50000)
            annual_impact = (script * 0.000012) + (img * 0.000004) + (total * 0.000001)
            X.append([total, img, script])
            y.append(annual_impact)

        self.model = LinearRegression()
        self.model.fit(X, y)
        self.is_trained = True
        print("✅ Model Trained Successfully")

    def predict_annual_kg(self, total_bytes, image_bytes, script_bytes):
        if not self.is_trained:
            self.train_mock_model()
        features = [[total_bytes, image_bytes, script_bytes]]
        prediction = self.model.predict(features)
        return round(prediction[0], 2)

    def analyze_improvements(self, total_bytes, image_bytes, script_bytes, co2_grams):
        """
        Generates a prioritized action plan based on resource breakdown.
        """
        actions = []
        
        # 1. Analyze IMAGES
        img_ratio = image_bytes / total_bytes if total_bytes > 0 else 0
        if img_ratio > 0.40: # If images are > 40% of page weight
            savings = co2_grams * 0.30 # Estimate 30% saving potential
            actions.append({
                "priority": "High",
                "title": "Optimize Image Assets",
                "desc": "Your website is Image-Heavy. Converting JPEGs/PNGs to modern WebP format can reduce size by 30-50%.",
                "impact": f"Save ~{round(savings, 3)}g CO2 per visit"
            })
        
        # 2. Analyze SCRIPTS
        script_ratio = script_bytes / total_bytes if total_bytes > 0 else 0
        if script_ratio > 0.30: # If scripts are > 30%
            savings = co2_grams * 0.15
            actions.append({
                "priority": "Medium",
                "title": "Minify & Defer JavaScript",
                "desc": "Heavy script execution increases CPU usage. Minify your bundles and use 'defer' attributes.",
                "impact": f"Save ~{round(savings, 3)}g CO2 per visit"
            })

        # 3. General Hosting (If not checked already)
        actions.append({
            "priority": "Low",
            "title": "Switch to Green Hosting",
            "desc": "Migrating to a renewable-energy powered host (like in France or Sweden) reduces carbon intensity by up to 90%.",
            "impact": "High Long-term Impact"
        })

        return actions

# Singleton Instance
predictor = CarbonPredictor()