import csv
import json

# Step 1: Read the CSV and keep only Country and Currency Code
filtered_data = []

with open('currencies.csv', mode='r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        country = row['Entity'].strip()
        currency_code = row['AlphabeticCode'].strip()
        if country and currency_code:
            filtered_data.append({
                'country': country,
                'currency_code': currency_code
            })

# Step 2: Sort the currency codes alphabetically and remove duplicates
currency_codes = sorted(list(set([entry['currency_code'] for entry in filtered_data])))

# Step 3: Write the currency codes into a JSON file
with open('currencies.json', mode='w', encoding='utf-8') as jsonfile:
    json.dump({"currencies": currency_codes}, jsonfile, indent=2)

print("Done! Created 'currencies.json' with sorted currency codes.")
