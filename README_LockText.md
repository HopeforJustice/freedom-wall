# Lock Text Management System

## Overview
This system allows you to manage text for each lock model separately using a data file approach. Each lock displays a name on the first line and a date on the second line.

## File Structure

### `/src/lockData.js`
This file contains all the lock information and text formatting settings.

#### Lock Data Format:
```javascript
{
    name: "John & Sarah",    // Name displayed on first line
    date: "2023-06-15",     // Date displayed on second line
    id: 0                   // Lock ID (0-4 for your 5 locks)
}
```

#### Text Configuration:
- `fontSize`: Size of the name text
- `nameColor`: Color of the name (first line)
- `dateColor`: Color of the date (second line)
- `lineSpacing`: Space between name and date lines

## How to Add/Edit Lock Text

### Method 1: Edit the Data File
1. Open `/src/lockData.js`
2. Modify the `lockData` array
3. Change names, dates, or add new entries
4. Save the file
5. Reload the page or click "Refresh All Lock Data" in GUI

### Method 2: Use GUI Controls
1. Open the "Text Controls" panel
2. Use "Lock Data Management" → "Selected Lock ID" to choose which lock to edit
3. Use "Manual Text Override" to change text for selected lock
4. Use "Global" controls to adjust positioning/scaling for all locks

## GUI Controls Explained

### Lock Data Management
- **Selected Lock ID**: Choose which lock (0-4) to edit manually
- **Refresh All Lock Data**: Reload text from the data file

### Manual Text Override
- **Custom Text**: Override text for selected lock
- **Font Size**: Change text size for selected lock
- **Text Color**: Change color for selected lock

### Global Controls
- **Positioning**: Move all text planes at once
- **Rotation**: Rotate all text planes at once
- **Scale**: Resize all text planes at once
- **Show All Text**: Toggle visibility of all text

## Adding More Locks

1. Add more entries to the `lockData` array in `/src/lockData.js`
2. Increase the loop count in the model loading section of `script.js`
3. Load additional model files if needed

## Example Lock Data Entry

```javascript
{
    name: "Alex & Maria",
    date: "2023-11-03", 
    id: 3
}
```

This will display:
```
Alex & Maria
2023-11-03
```

## Tips

- Keep names short to fit well on the locks
- Use consistent date formats (YYYY-MM-DD recommended)
- The text automatically centers on each lock
- Use the wireframe helper (green outline) to see text positioning
- Text appears above each lock by default (Y position 1.1)
