from ultralytics import YOLO
import json
import cv2
import numpy as np
import base64

model = YOLO("best.pt")

with open("nutrition_lookup.json", "r") as f:
    nutrition_lookup = json.load(f)

CLASS_NAMES = [
    "candy", "egg tart", "french fries", "chocolate", "biscuit",
    "popcorn", "pudding", "ice cream", "cheese butter", "cake",
    "wine", "milkshake", "coffee", "juice", "milk", "tea",
    "almond", "red beans", "cashew", "dried cranberries", "soy",
    "walnut", "peanut", "egg", "apple", "date", "apricot",
    "avocado", "banana", "strawberry", "cherry", "blueberry",
    "raspberry", "mango", "olives", "peach", "lemon", "pear",
    "fig", "pineapple", "grape", "kiwi", "melon", "orange",
    "watermelon", "steak", "pork", "chicken duck", "sausage",
    "fried meat", "lamb", "sauce", "crab", "fish", "shellfish",
    "shrimp", "soup", "bread", "corn", "hamburg", "pizza",
    "hanamaki baozi", "wonton dumplings", "pasta", "noodles",
    "rice", "pie", "tofu", "eggplant", "potato", "garlic",
    "cauliflower", "tomato", "kelp", "seaweed", "spring onion",
    "rape", "ginger", "okra", "lettuce", "pumpkin", "cucumber",
    "white radish", "carrot", "asparagus", "bamboo shoots",
    "broccoli", "celery stick", "cilantro mint", "snow peas",
    "cabbage", "bean sprouts", "onion", "pepper", "green beans",
    "French beans", "king oyster mushroom", "shiitake",
    "enoki mushroom", "oyster mushroom", "white button mushroom",
    "salad", "other ingredients"
]

# Rough weight per item (grams) when using bounding boxes instead of masks
# These are realistic single-serving estimates per food class
ITEM_WEIGHTS = {
    "carrot":       40,
    "chicken duck": 180,
    "potato":       80,
    "broccoli":     85,
    "tomato":       90,
    "green beans":  60,
    "french fries": 100,
    "steak":        200,
    "rice":         180,
    "egg":          55,
    "banana":       120,
    "apple":        150,
    "pizza":        150,
    "bread":        60,
    "pasta":        200,
    "noodles":      200,
    "salad":        120,
    "corn":         100,
    "soup":         250,
    "fish":         150,
    "shrimp":       80,
    "pork":         150,
    "lamb":         150,
    "sausage":      80,
    "cake":         100,
    "chocolate":    30,
    "milk":         240,
    "juice":        240,
    "coffee":       240,
    "tea":          240,
}
DEFAULT_ITEM_WEIGHT = 80  # grams fallback

def predict(image_path):
    results = model(image_path, conf=0.30)  # slightly higher conf to reduce false positives
    r = results[0]

    detections = []
    total = {"calories": 0.0, "fat": 0.0, "carbs": 0.0, "protein": 0.0}

    img_h, img_w = r.orig_shape[0], r.orig_shape[1]
    img_area = img_h * img_w

    for i, (cls, conf) in enumerate(zip(r.boxes.cls, r.boxes.conf)):
        food_name = CLASS_NAMES[int(cls)]
        confidence = float(conf)

        # ── Weight estimation via bounding box area ratio ──
        box      = r.boxes.xyxy[i]
        box_w    = float(box[2] - box[0])
        box_h    = float(box[3] - box[1])
        box_area = box_w * box_h
        area_ratio = box_area / img_area

        # Use known per-item weight, scaled slightly by box size ratio
        base_weight = ITEM_WEIGHTS.get(food_name, DEFAULT_ITEM_WEIGHT)
        # If the box covers > 30% of image it's the main dish — boost weight
        if area_ratio > 0.30:
            weight_g = base_weight * 1.5
        elif area_ratio < 0.05:
            weight_g = base_weight * 0.6
        else:
            weight_g = base_weight

        nutrition = nutrition_lookup.get(food_name)

        item = {
            "food":       food_name,
            "confidence": round(confidence, 2),
            "weight_g":   round(weight_g, 1),
            "calories":   0.0,
            # ── Fix: use fat/carbs/protein (not fat_g etc.) to match frontend ──
            "fat":        0.0,
            "carbs":      0.0,
            "protein":    0.0,
        }

        if nutrition:
            item["calories"] = round(weight_g * nutrition["calories_per_g"], 1)
            item["fat"]      = round(weight_g * nutrition["fat_per_g"],      1)
            item["carbs"]    = round(weight_g * nutrition["carb_per_g"],     1)
            item["protein"]  = round(weight_g * nutrition["protein_per_g"],  1)

            total["calories"] += item["calories"]
            total["fat"]      += item["fat"]
            total["carbs"]    += item["carbs"]
            total["protein"]  += item["protein"]

        detections.append(item)

    # Round totals
    total = {k: round(v, 1) for k, v in total.items()}

    return {
        "detections": detections,
        "total":      total,
        "image":      None,   # disabled — frontend uses original clean image
    }