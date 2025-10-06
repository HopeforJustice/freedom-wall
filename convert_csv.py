# Read CSV and convert to JavaScript array format
with open('500 names from Freedom Wall(Sheet1).csv', 'r') as f:
    lines = f.readlines()

# Generate the lockData array
js_entries = []
for i, line in enumerate(lines):
    if line.strip():
        parts = line.strip().split(',')
        if len(parts) >= 2:
            name = parts[0].strip()
            date = parts[1].strip()
            js_entry = f'\t{{\n\t\tname: "{name}",\n\t\tdate: "{date}",\n\t\tid: {i},\n\t}},'
            js_entries.append(js_entry)

# Create the complete lockData.js content
js_content = '''// Lock data for each model
// Each entry contains name and date for a lock
export const lockData = [
''' + '\n'.join(js_entries) + '''
];

// Text formatting settings for locks
// TO CHANGE FONT SIZE: Just change the fontSize value below and refresh your browser!
export const textConfig = {
	fontSize: 100, // ← CHANGE THIS NUMBER to adjust font size for ALL locks
	nameColor: "#ffffff",
	dateColor: "#cccccc",
	backgroundColor: "transparent",
	canvasWidth: 512,
	canvasHeight: 256,
	lineSpacing: 40, // ← CHANGE THIS NUMBER to adjust spacing between name and date
	fontFamily: "HandyFont", // Your custom handy.otf font
	fallbackFont: "Arial, sans-serif", // Fallback fonts
};
'''

# Write to lockData.js
with open('src/lockData.js', 'w') as f:
    f.write(js_content)

print(f'Successfully created lockData.js with {len(js_entries)} entries')
