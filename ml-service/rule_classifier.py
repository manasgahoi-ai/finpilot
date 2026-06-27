CATEGORIES = {
    "FOOD": ["SWIGGY", "ZOMATO", "RESTAURANT", "FOOD", "CAFE", "HOTEL", "PIZZA", "BURGER", "DOMINOS"],
    "SHOPPING": ["AMAZON", "FLIPKART", "MYNTRA", "AJIO", "MART"],
    "SUBSCRIPTION": ["NETFLIX", "SPOTIFY", "PRIME", "HOTSTAR", "YOUTUBE", "SUBSCRIPTION"],
    "TRANSPORT": ["UBER", "OLA", "RAPIDO", "PETROL", "FUEL", "METRO", "IRCTC"],
    "EMI": ["RENT", "EMI", "LOAN", "MORTGAGE"],
    "INCOME": ["SALARY", "CREDIT", "DEPOSIT", "REFUND"],
    "UTILITIES": ["AIRTEL", "JIO", "VODAFONE", "ELECTRICITY", "BILL", "RECHARGE", "WIFI"],
    "MEDICAL": ["HOSPITAL", "PHARMACY", "MEDICAL", "DOCTOR", "MEDICINE", "APOLLO"],
    "INVESTMENT": ["MUTUAL FUND", "STOCK", "SIP", "ZERODHA", "GROWW"],
    "CASH": ["ATM", "CASH", "WITHDRAWAL"],
}


def classify(description: str) -> str:
    if not description:
        return "OTHER"
    upper = description.upper()
    for category, keywords in CATEGORIES.items():
        for keyword in keywords:
            if keyword in upper:
                return category
    return "OTHER"