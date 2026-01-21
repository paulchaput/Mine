# Peptide Tracker App

A minimalist, beginner-friendly peptide tracking application designed to help you manage your peptide protocols, calculate doses, and track adherence.

## ⚠️ Important Disclaimer

**THIS APP IS FOR TRACKING AND LOGGING PURPOSES ONLY.**

- **Not Medical Advice**: This app does not provide medical advice, diagnosis, or treatment recommendations.
- **Consult Healthcare Professionals**: Always consult with a qualified healthcare professional before starting, stopping, or changing any peptide protocol.
- **Reference Data Only**: All dosing ranges, frequencies, and recommendations are for reference purposes only and may not be appropriate for you.
- **No Liability**: By using this app, you acknowledge that you are solely responsible for your health decisions.
- **Legal Compliance**: Ensure all substances are obtained and used in compliance with local laws and regulations.

## Features

- **📚 Peptide Library**: Browse 20+ pre-loaded peptides with detailed information including dosing ranges, frequencies, and administration routes
- **🧮 Dose Calculator**: Step-by-step wizard to calculate exact syringe units (U-100 insulin syringe) based on vial concentration
- **📊 Cycle Tracker**: Create and manage peptide cycles with automatic progress tracking and daily logging
- **📅 Calendar View**: Visual calendar showing all logged doses and active cycles
- **📖 History & Insights**: Track adherence, streaks, and view complete dose history
- **💾 Data Management**: Export/import your data as JSON for backup and transfer

## Quick Start

### How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - Accept the disclaimer to start using the app

### Production Build

```bash
npm run build
npm run preview
```

## User Guide

### 1️⃣ Browse the Peptide Library

- Search for peptides by name or function
- Filter by category (healing, fat loss, GH release, etc.)
- Tap any peptide to see detailed information including:
  - Reference dose ranges
  - Frequency and cycle duration
  - Syringe unit calculator
  - Administration routes
  - Important notes

### 2️⃣ Calculate Your Dose

1. Select a peptide from the list (or skip to enter manually)
2. Enter:
   - Vial amount in mg
   - BAC water added in mL
   - Target dose (mcg or mg)
3. Get instant results showing:
   - Exact units to draw on U-100 syringe
   - Doses per vial
   - Step-by-step calculation breakdown

### 3️⃣ Track Your Cycles

1. Create a new cycle with:
   - Peptide selection
   - Start date and duration
   - Frequency and dose
2. Log doses daily with one tap
3. View progress, days remaining, and adherence stats
4. Notes and side effects tracking

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **LocalStorage** - Data persistence (no backend needed)
- **Pure CSS** - Minimal, mobile-first styling

## Data Storage

All data is stored locally in your browser's localStorage. Nothing is sent to external servers.

- **Peptide Library**: Pre-loaded reference data
- **Cycles**: Your custom cycles with start/end dates
- **Doses**: Complete log of all doses taken/skipped
- **Settings**: App preferences and disclaimer acceptance

Use the **Data Management** tab in History to export/import your data.

## File Structure

```
peptide-tracker/
├── src/
│   ├── components/        # All UI components
│   │   ├── Disclaimer.jsx
│   │   ├── BottomNav.jsx
│   │   ├── PeptideLibrary.jsx
│   │   ├── DoseCalculator.jsx
│   │   ├── CycleTracker.jsx
│   │   ├── Calendar.jsx
│   │   └── History.jsx
│   ├── data/
│   │   └── seedData.js    # 20+ pre-loaded peptides
│   ├── utils/
│   │   ├── calculations.js  # All dose/cycle calculations
│   │   └── storage.js       # LocalStorage helpers
│   ├── App.jsx
│   └── index.css          # Global styles
├── public/
└── package.json
```

## Calculations

All dose calculations use U-100 insulin syringes where **1 mL = 100 units**.

### Formula:

1. **Concentration** = Vial (mg) ÷ BAC Water (mL) = mg/mL
2. **Dose Volume** = Target Dose (mg) ÷ Concentration = mL
3. **Syringe Units** = Dose Volume (mL) × 100 = units

### Example:

- Vial: 5 mg BPC-157
- BAC Water: 2 mL
- Target Dose: 250 mcg (0.25 mg)

```
1. Concentration = 5 mg ÷ 2 mL = 2.5 mg/mL
2. Dose Volume = 0.25 mg ÷ 2.5 mg/mL = 0.1 mL
3. Syringe Units = 0.1 mL × 100 = 10 units
```

**Result**: Draw **10 units** on your U-100 syringe

## Customization

### Adding New Peptides

Edit `src/data/seedData.js` and add entries to the `peptideLibrary` array:

```javascript
{
  id: 'unique-id',
  name: 'Peptide Name',
  primaryPurpose: 'Main benefit',
  category: 'healing', // or 'fat-loss', 'gh-release', etc.
  vialSizeMg: 5,
  referenceRangeMin: 100,
  referenceRangeMax: 500,
  unit: 'mcg',
  recommendedDose: 250,
  routes: ['SC', 'IM'],
  frequency: 'Daily',
  cycleDurationWeeks: 4,
  restWeeks: 4,
  reconstitutionMl: 2,
  description: 'Detailed description...',
  notes: 'Important notes...'
}
```

### Styling

All styles are in `src/index.css` using CSS custom properties (variables). Modify the `:root` section to change colors, spacing, etc.

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is a reference implementation. Feel free to fork and customize for your needs.

## License

MIT

## Support

For issues or questions, please consult the inline help text throughout the app or refer to this README.

---

**Remember**: This app is a tracking tool only. Always consult healthcare professionals for medical advice.
