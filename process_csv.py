import csv
import random

# Read the CSV file with different encoding handling
try:
    with open('500 names from Freedom Wall(Sheet1).csv', 'r', encoding='utf-8') as f:
        lines = f.readlines()
except UnicodeDecodeError:
    with open('500 names from Freedom Wall(Sheet1).csv', 'r', encoding='latin-1') as f:
        lines = f.readlines()

# Parse and process the data
processed_lines = []
years = list(range(2009, 2026))  # 2009 to 2025

for i, line in enumerate(lines):
    if line.strip():
        parts = line.strip().split(',')
        if len(parts) >= 2:
            name = parts[0].strip().upper()
            # Clean up any special characters
            name = ''.join(c for c in name if c.isalpha() or c.isspace())
            # Distribute years evenly with some randomness
            year = years[i % len(years)]
            processed_lines.append(f'{name},{year},\n')

# Shuffle to mix up the year distribution
random.shuffle(processed_lines)

# Write back to file
with open('500 names from Freedom Wall(Sheet1).csv', 'w', encoding='utf-8') as f:
    f.writelines(processed_lines)

print('Successfully capitalized names and redistributed years from 2009-2025')
print(f'Processed {len(processed_lines)} entries')
