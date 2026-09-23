import re
from typing import List, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict

# Common student subscription / recurring merchant mappings
MERCHANT_CLEAN_PATTERNS = [
    (r"(?i)\bnetflix.*", "Netflix"),
    (r"(?i)\bspotify.*", "Spotify"),
    (r"(?i)\byoutube\s*premium.*", "YouTube Premium"),
    (r"(?i)\bprime\s*video|\bamazon\s*prime.*", "Amazon Prime"),
    (r"(?i)\bdisney\+?\s*hotstar.*", "Disney+ Hotstar"),
    (r"(?i)\bapple\s*music|\bicloud.*", "Apple iCloud/Music"),
    (r"(?i)\bgoogle\s*(one|storage|cloud).*", "Google Cloud Storage"),
    (r"(?i)\bgithub.*", "GitHub Copilot"),
    (r"(?i)\bchatgpt|\bopenai.*", "ChatGPT Plus"),
    (r"(?i)\bjio\s*(recharge|fiber)?.*", "Jio Fiber/Mobile"),
    (r"(?i)\bairtel\s*(broadband|recharge)?.*", "Airtel Broadband"),
    (r"(?i)\bgym\b.*|\bfitness\b.*", "Gym Membership"),
    (r"(?i)\bhostel\s*rent|\bpg\s*rent|\broom\s*rent.*", "Hostel / Room Rent")
]

class RecurringDetector:
    """
    Recurring Expense and Subscription Pattern Detector for Student Accounts.
    - Normalizes merchant names
    - Clusters transactions by merchant and approximate amount
    - Identifies cadence (Monthly: 25-35 days, Weekly: 6-8 days)
    """

    def normalize_merchant(self, description: str) -> str:
        clean = description.strip()
        for pattern, replacement in MERCHANT_CLEAN_PATTERNS:
            if re.search(pattern, clean):
                return replacement

        # Generic cleanup: remove numbers, card suffixes, payment codes
        clean = re.sub(r"(?i)(payment|subscription|monthly|renewal|pvt|ltd|india|bill)", "", clean)
        clean = re.sub(r"[0-9#\-_]", " ", clean)
        clean = re.sub(r"\s+", " ", clean).strip()
        return clean.title() if clean else description.title()

    def detect_recurring(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyzes a list of transaction dicts:
        [{'id': int, 'date': datetime, 'description': str, 'amount': float, 'category': str}]
        Returns detected recurring expense profiles.
        """
        if not transactions or len(transactions) < 2:
            return []

        # Group by normalized merchant
        grouped = defaultdict(list)
        for tx in transactions:
            if tx.get("type", "expense") != "expense":
                continue
            norm_merchant = self.normalize_merchant(tx["description"])
            grouped[norm_merchant].append(tx)

        detected = []

        for merchant, items in grouped.items():
            if len(items) < 2:
                continue

            # Sort items by date ascending
            items_sorted = sorted(items, key=lambda x: x["date"])
            amounts = [x["amount"] for x in items_sorted]
            dates = [x["date"] for x in items_sorted]

            # Check if amounts are very similar (within 5% or exact)
            avg_amount = sum(amounts) / len(amounts)
            amount_variance = max(abs(a - avg_amount) for a in amounts)
            if amount_variance > (0.10 * avg_amount) and len(amounts) > 2:
                continue

            # Check intervals between consecutive transactions
            intervals_days = []
            for i in range(1, len(dates)):
                d1 = dates[i-1]
                d2 = dates[i]
                diff = abs((d2 - d1).days)
                intervals_days.append(diff)

            avg_interval = sum(intervals_days) / len(intervals_days) if intervals_days else 0

            frequency = "Unknown"
            confidence = 0.80

            if 24 <= avg_interval <= 35:
                frequency = "Monthly"
                confidence = 0.95
            elif 6 <= avg_interval <= 9:
                frequency = "Weekly"
                confidence = 0.90
            elif 80 <= avg_interval <= 100:
                frequency = "Quarterly"
                confidence = 0.85
            elif len(items_sorted) >= 2 and any(p in merchant.lower() for p in ["netflix", "spotify", "rent", "cloud", "gym"]):
                # Known subscription merchant with multiple occurrences
                frequency = "Monthly"
                confidence = 0.92
            else:
                continue

            category = items_sorted[-1].get("category") or items_sorted[-1].get("final_category", "Subscriptions")
            if "rent" in merchant.lower():
                category = "Accommodation"
            elif "gym" in merchant.lower():
                category = "Health"

            detected.append({
                "merchant": merchant,
                "category": category,
                "amount": round(avg_amount, 2),
                "frequency": frequency,
                "occurrences": len(items_sorted),
                "last_detected": items_sorted[-1]["date"],
                "confidence": confidence,
                "is_active": True
            })

        return detected

recurring_detector = RecurringDetector()
