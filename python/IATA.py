import pandas as pd
import json

# Read the CSV file
csv_file_path = 'IATA.csv'  # Replace with your actual file path
data = pd.read_csv(csv_file_path)

# Select only the relevant columns
modified_data = data[['code', 'name', 'country', 'city', 'state', 'city_code']]

# Generate the desired output format
result = {
    "airportData": []
}
for index, row in modified_data.iterrows():
    # Extract the necessary information
    iata_code = row['code'][:3]  # First three characters of the code
    city = row['city'] if pd.notna(row['city']) else "Unknown"  # Handle NaN values
    country = row['country'] if pd.notna(row['country']) else "Unknown"  # Handle NaN values
    name = row['name'] if pd.notna(row['name']) else "Unknown"  # Handle NaN values
    
    # Create the formatted string
    formatted_string = f"{iata_code}-{city}-{country}-{name}"
    result["airportData"].append(formatted_string)

# Print the result
print(result)

# Save the result to a JSON file
json_file_path = 'airports.json'  # Specify the name of the JSON file
with open(json_file_path, 'w') as json_file:
    json.dump(result, json_file, indent=4)  # Write the list to the JSON file with indentation for readability

print(f"Data has been saved to {json_file_path}")