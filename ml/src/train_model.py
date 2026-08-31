import os
import pandas as pd

import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

from xgboost import XGBRegressor


# ============================================================
# 1. PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH = os.path.join(BASE_DIR, "data", "yield_crop.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_yield_model.joblib")

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# 2. LOAD DATA
# ============================================================

print("Loading dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Dataset shape before cleaning: {df.shape}")
print("\nColumns:")
print(df.columns.tolist())


# ============================================================
# 3. CLEAN COLUMN NAMES
# ============================================================

df.columns = df.columns.str.strip()

# Remove duplicate rows
df = df.drop_duplicates()

print(f"\nShape after removing duplicates: {df.shape}")


# ============================================================
# 4. REQUIRED COLUMNS
# ============================================================

features = [
    "State",
    "Crop",
    "Season",
    "Area",
    "Annual_Rainfall",
    "Fertilizer",
    "Pesticide"
]

target = "Yield"

missing_columns = [
    col for col in features + [target]
    if col not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing required columns: {missing_columns}\n"
        f"Available columns: {df.columns.tolist()}"
    )


# ============================================================
# 5. CONVERT NUMERIC COLUMNS
# ============================================================

numeric_columns = [
    "Area",
    "Annual_Rainfall",
    "Fertilizer",
    "Pesticide",
    "Yield"
]

for col in numeric_columns:
    df[col] = pd.to_numeric(df[col], errors="coerce")


# ============================================================
# 6. HANDLE MISSING VALUES
# ============================================================

# Remove rows where target Yield is missing
df = df.dropna(subset=["Yield"])

print(f"\nShape after removing missing Yield: {df.shape}")


# ============================================================
# 7. REMOVE EXTREME YIELD OUTLIERS
#    IQR METHOD
# ============================================================

Q1 = df["Yield"].quantile(0.25)
Q3 = df["Yield"].quantile(0.75)

IQR = Q3 - Q1

lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

df = df[
    (df["Yield"] >= lower_bound) &
    (df["Yield"] <= upper_bound)
]

print(f"Yield outlier limits: {lower_bound:.4f} to {upper_bound:.4f}")
print(f"Shape after removing yield outliers: {df.shape}")


# ============================================================
# 8. SEPARATE FEATURES AND TARGET
# ============================================================

X = df[features]
y = df[target]


# ============================================================
# 9. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print(f"\nTraining samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")


# ============================================================
# 10. PREPROCESSING
# ============================================================

categorical_features = [
    "State",
    "Crop",
    "Season"
]

numeric_features = [
    "Area",
    "Annual_Rainfall",
    "Fertilizer",
    "Pesticide"
]


numeric_transformer = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median")
        )
    ]
)


categorical_transformer = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent")
        ),
        (
            "onehot",
            OneHotEncoder(
                handle_unknown="ignore"
            )
        )
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            numeric_transformer,
            numeric_features
        ),
        (
            "categorical",
            categorical_transformer,
            categorical_features
        )
    ]
)


# ============================================================
# 11. XGBOOST REGRESSOR
# ============================================================

model = XGBRegressor(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=42,
    n_jobs=-1
)


# ============================================================
# 12. COMPLETE ML PIPELINE
# ============================================================

pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            model
        )
    ]
)


# ============================================================
# 13. TRAIN MODEL
# ============================================================

print("\nTraining XGBoost model...")

pipeline.fit(
    X_train,
    y_train
)

print("Training completed!")


# ============================================================
# 14. PREDICTIONS
# ============================================================

y_pred = pipeline.predict(X_test)


# ============================================================
# 15. EVALUATION
# ============================================================

r2 = r2_score(y_test, y_pred)

mae = mean_absolute_error(
    y_test,
    y_pred
)

rmse = mean_squared_error(
    y_test,
    y_pred
) ** 0.5


print("\n==============================")
print("MODEL EVALUATION")
print("==============================")

print(f"R² Score : {r2:.4f}")
print(f"MAE      : {mae:.4f}")
print(f"RMSE     : {rmse:.4f}")


# ============================================================
# 16. SAVE MODEL PIPELINE
# ============================================================

joblib.dump(
    pipeline,
    MODEL_PATH
)

print("\n==============================")
print("MODEL SAVED")
print("==============================")

print(MODEL_PATH)