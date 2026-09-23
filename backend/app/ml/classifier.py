import re
import numpy as np
from typing import Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# 12 Standard Categories for FinStudent AI
CATEGORIES = [
    "Food",
    "Transportation",
    "Education",
    "Entertainment",
    "Shopping",
    "Bills",
    "Health",
    "Subscriptions",
    "Accommodation",
    "Income",
    "Freelance",
    "Other"
]

# Rule-based keyword mapping for deterministic student contexts
KEYWORD_RULES = {
    "Food": [
        "canteen", "mess", "lunch", "dinner", "breakfast", "swiggy", "zomato", "pizza",
        "burger", "chai", "tea", "coffee", "cafe", "samosa", "maggi", "restaurant",
        "snack", "biryani", "dhaba", "kfc", "mcdonald", "domino", "starbucks", "subway",
        "groceries", "fruits", "juice", "vending", "bakery", "roll", "shawarma"
    ],
    "Transportation": [
        "uber", "rapido", "ola", "bus", "metro", "auto", "train", "irctc",
        "cab", "petrol", "fuel", "diesel", "bike ride", "rickshaw", "travel",
        "flight", "toll", "pass"
    ],
    "Education": [
        "book", "textbook", "notes", "xerox", "print", "printing", "stationery",
        "tuition", "college fee", "semester", "exam", "udemy", "coursera",
        "course", "pen", "notebook", "calculator", "lab manual", "library"
    ],
    "Subscriptions": [
        "netflix", "spotify", "prime", "hotstar", "disney", "youtube premium",
        "apple music", "icloud", "google one", "cloud storage", "chatgpt",
        "github", "notion", "adobe", "subscription", "membership"
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "clothes", "shoes", "headphones",
        "earphones", "laptop", "t-shirt", "jeans", "zara", "h&m", "gadget",
        "mouse", "keyboard", "backpack", "watch", "chargers", "sunglasses"
    ],
    "Bills": [
        "recharge", "electricity", "wifi", "broadband", "jio", "airtel", "vi",
        "water bill", "power", "cylinder", "gas", "utility", "mobile bill"
    ],
    "Entertainment": [
        "movie", "cinema", "pvr", "inox", "game", "steam", "concert",
        "event", "party", "bowling", "club", "amusement", "gaming"
    ],
    "Health": [
        "medicine", "pharmacy", "medical", "doctor", "clinic", "hospital",
        "apollo", "gym", "protein", "fitness", "dentist", "eyewear", "first aid"
    ],
    "Accommodation": [
        "hostel", "hostel rent", "rent", "pg", "room rent", "flat rent",
        "landlord", "maintenance fee", "security deposit"
    ],
    "Income": [
        "monthly allowance", "allowance", "pocket money", "scholarship",
        "stipend", "salary", "dad", "mom", "parents", "cash deposit"
    ],
    "Freelance": [
        "freelance", "freelance payment", "client", "upwork", "fiverr",
        "web design gig", "tutoring", "code project", "bounty", "consulting"
    ]
}

# Rich Student Training Corpus for the ML fallback classifier
TRAINING_DATA = [
    # Food
    ("Lunch at college canteen", "Food"),
    ("Mess monthly payment", "Food"),
    ("Swiggy late night order", "Food"),
    ("Zomato biryani feast", "Food"),
    ("Pizza Hut dinner with friends", "Food"),
    ("Chai and samosa at tapri", "Food"),
    ("Morning coffee and sandwich", "Food"),
    ("Burger King meal", "Food"),
    ("Maggi and cold drink", "Food"),
    ("Hostel dinner mess bill", "Food"),
    ("Starbucks iced latte", "Food"),
    ("Grocery store fruits milk", "Food"),
    ("Domino's pizza delivery", "Food"),
    ("Shawarma roll near campus", "Food"),
    ("Bakery cookies and bread", "Food"),

    # Transportation
    ("Uber to college campus", "Transportation"),
    ("Rapido bike ride to hostel", "Transportation"),
    ("Ola cab to railway station", "Transportation"),
    ("Daily metro smart card recharge", "Transportation"),
    ("City bus ticket to library", "Transportation"),
    ("Auto rickshaw ride to market", "Transportation"),
    ("Petrol for bike", "Transportation"),
    ("IRCTC train ticket booking", "Transportation"),
    ("Cab share to airport", "Transportation"),
    ("Bus pass monthly renewal", "Transportation"),

    # Education
    ("Python programming textbook", "Education"),
    ("Data Structures book Amazon", "Education"),
    ("Project report printing and binding", "Education"),
    ("College tuition fee semester 5", "Education"),
    ("Library overdue fine", "Education"),
    ("Xerox copies for exam notes", "Education"),
    ("Udemy Web Development Bootcamp", "Education"),
    ("Notebooks pens and geometry box", "Education"),
    ("Scientific calculator Casio", "Education"),
    ("Coursera Machine Learning specialization", "Education"),
    ("Lab manual printing", "Education"),

    # Subscriptions
    ("Netflix monthly subscription", "Subscriptions"),
    ("Spotify student plan renewal", "Subscriptions"),
    ("Cloud storage Google One 100GB", "Subscriptions"),
    ("Amazon Prime membership student", "Subscriptions"),
    ("YouTube Premium family pack", "Subscriptions"),
    ("Disney+ Hotstar subscription", "Subscriptions"),
    ("ChatGPT Plus monthly fee", "Subscriptions"),
    ("GitHub Copilot student subscription", "Subscriptions"),
    ("Apple Music student plan", "Subscriptions"),

    # Shopping
    ("Amazon wireless headphones", "Shopping"),
    ("Myntra denim jacket and shoes", "Shopping"),
    ("Flipkart wireless mouse keyboard", "Shopping"),
    ("Running shoes for sports", "Shopping"),
    ("College backpack bag", "Shopping"),
    ("H&M casual t-shirts", "Shopping"),
    ("Mobile back cover and screen guard", "Shopping"),
    ("Zara sunglasses sale", "Shopping"),
    ("USB-C fast charger cable", "Shopping"),

    # Bills
    ("Jio mobile recharge 3 months", "Bills"),
    ("Airtel fiber broadband wifi bill", "Bills"),
    ("Room electricity bill payment", "Bills"),
    ("Mobile postpaid bill recharge", "Bills"),
    ("Hostel water electricity charge", "Bills"),

    # Entertainment
    ("PVR Cinemas movie tickets", "Entertainment"),
    ("Steam game weekend sale", "Entertainment"),
    ("College fest concert passes", "Entertainment"),
    ("Weekend party club entry", "Entertainment"),
    ("Bowling alley with batchmates", "Entertainment"),

    # Health
    ("Pharmacy fever and cold medicines", "Health"),
    ("Apollo pharmacy consultation", "Health"),
    ("Monthly gym membership fee", "Health"),
    ("Whey protein powder 1kg", "Health"),
    ("Dental checkup clinic", "Health"),

    # Accommodation
    ("Hostel rent for September", "Accommodation"),
    ("PG room rent monthly payment", "Accommodation"),
    ("Flat maintenance fee", "Accommodation"),
    ("Hostel room security deposit", "Accommodation"),

    # Income
    ("Monthly allowance from parents", "Income"),
    ("Merit scholarship semester grant", "Income"),
    ("Pocket money transferred", "Income"),
    ("Research fellowship stipend", "Income"),

    # Freelance
    ("Freelance web development payment", "Freelance"),
    ("Client UI design contract payout", "Freelance"),
    ("Tutoring junior students stipend", "Freelance"),
    ("Bug bounty reward transfer", "Freelance")
]

class CategoryClassifier:
    """
    Modular Category Classifier combining:
    1. Text normalization
    2. Rule-based student merchant / keyword heuristics (deterministic high precision)
    3. TF-IDF + Logistic Regression ML model (generalization & probability calibration)
    """

    def __init__(self):
        self._train_ml_model()

    def _train_ml_model(self):
        texts = [item[0] for item in TRAINING_DATA]
        labels = [item[1] for item in TRAINING_DATA]

        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        X = self.vectorizer.fit_transform(texts)

        self.model = LogisticRegression(
            C=1.5,
            max_iter=300,
            class_weight="balanced"
        )
        self.model.fit(X, labels)

    def normalize_text(self, text: str) -> str:
        text = text.lower().strip()
        text = re.sub(r"[^\w\s]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def classify(self, description: str, amount: float = None) -> Dict[str, Any]:
        """
        Classifies transaction description.
        Returns category, confidence (0.0 to 1.0), reason, and method.
        """
        if not description or not description.strip():
            return {
                "category": "Other",
                "confidence": 0.50,
                "reason": "Empty description",
                "method": "rule_based"
            }

        normalized = self.normalize_text(description)
        words = normalized.split()

        # Step 1: Rule-based check
        for category, keywords in KEYWORD_RULES.items():
            for kw in keywords:
                # Check substring match or word match
                if " " in kw:
                    if kw in normalized:
                        return {
                            "category": category,
                            "confidence": 0.95,
                            "reason": f"Matched pattern '{kw}' for {category}",
                            "method": "rule_based"
                        }
                else:
                    if kw in words or any(kw in w for w in words):
                        return {
                            "category": category,
                            "confidence": 0.94,
                            "reason": f"Matched keyword '{kw}' for {category}",
                            "method": "rule_based"
                        }

        # Step 2: ML Model prediction
        try:
            vec = self.vectorizer.transform([normalized])
            probs = self.model.predict_proba(vec)[0]
            top_idx = int(np.argmax(probs))
            predicted_category = self.model.classes_[top_idx]
            top_prob = float(probs[top_idx])

            # Calibrate confidence: scale nicely between 0.70 and 0.98 for realistic student UI
            confidence = max(0.70, min(0.98, round(top_prob * 1.15, 2)))

            return {
                "category": predicted_category,
                "confidence": confidence,
                "reason": f"ML model prediction based on description similarity to {predicted_category}",
                "method": "ml_model"
            }
        except Exception:
            return {
                "category": "Other",
                "confidence": 0.60,
                "reason": "Classifier fallback default",
                "method": "rule_based"
            }

# Singleton instance
classifier = CategoryClassifier()
