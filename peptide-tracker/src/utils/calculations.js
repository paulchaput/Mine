/**
 * Peptide dosage calculation utilities
 * All calculations are for U-100 insulin syringes (1 mL = 100 units)
 */

/**
 * Convert mcg to mg
 * @param {number} mcg - Micrograms
 * @returns {number} Milligrams
 */
export const mcgToMg = (mcg) => mcg / 1000;

/**
 * Convert mg to mcg
 * @param {number} mg - Milligrams
 * @returns {number} Micrograms
 */
export const mgToMcg = (mg) => mg * 1000;

/**
 * Calculate concentration in mg/mL
 * @param {number} vialMg - Total mg in vial
 * @param {number} reconstitutionMl - mL of BAC water added
 * @returns {number} Concentration in mg/mL
 */
export const calculateConcentration = (vialMg, reconstitutionMl) => {
  if (!vialMg || !reconstitutionMl || reconstitutionMl === 0) return 0;
  return vialMg / reconstitutionMl;
};

/**
 * Calculate dose volume in mL
 * @param {number} targetDoseMg - Target dose in mg
 * @param {number} concentrationMgPerMl - Concentration in mg/mL
 * @returns {number} Volume in mL
 */
export const calculateDoseVolume = (targetDoseMg, concentrationMgPerMl) => {
  if (!targetDoseMg || !concentrationMgPerMl || concentrationMgPerMl === 0) return 0;
  return targetDoseMg / concentrationMgPerMl;
};

/**
 * Calculate syringe units for U-100 insulin syringe
 * @param {number} volumeMl - Volume in mL
 * @returns {number} Units on U-100 syringe
 */
export const calculateUnits = (volumeMl) => {
  if (!volumeMl) return 0;
  return volumeMl * 100;
};

/**
 * Complete dose calculation from vial to syringe units
 * @param {number} vialMg - Total mg in vial
 * @param {number} reconstitutionMl - mL of BAC water
 * @param {number} targetDoseMg - Desired dose in mg
 * @returns {object} Full calculation breakdown
 */
export const calculateFullDose = (vialMg, reconstitutionMl, targetDoseMg) => {
  const concentration = calculateConcentration(vialMg, reconstitutionMl);
  const volumeMl = calculateDoseVolume(targetDoseMg, concentration);
  const units = calculateUnits(volumeMl);
  const dosesInVial = vialMg / targetDoseMg;

  return {
    concentration,
    volumeMl,
    units: Math.round(units * 10) / 10, // Round to 1 decimal
    dosesInVial: Math.floor(dosesInVial),
    formula: {
      step1: `Concentration = ${vialMg} mg ÷ ${reconstitutionMl} mL = ${concentration.toFixed(2)} mg/mL`,
      step2: `Dose Volume = ${targetDoseMg} mg ÷ ${concentration.toFixed(2)} mg/mL = ${volumeMl.toFixed(3)} mL`,
      step3: `Syringe Units = ${volumeMl.toFixed(3)} mL × 100 = ${units.toFixed(1)} units`,
      step4: `Total Doses = ${vialMg} mg ÷ ${targetDoseMg} mg = ${Math.floor(dosesInVial)} doses`
    }
  };
};

/**
 * Calculate remaining doses in vial
 * @param {number} vialMg - Original vial size
 * @param {number} doseMg - Dose size
 * @param {number} dosesTaken - Number of doses already taken
 * @returns {number} Remaining doses
 */
export const calculateRemainingDoses = (vialMg, doseMg, dosesTaken) => {
  const totalDoses = Math.floor(vialMg / doseMg);
  return Math.max(0, totalDoses - dosesTaken);
};

/**
 * Validate dose against reference range
 * @param {number} dose - Dose to validate
 * @param {number} minRange - Minimum reference
 * @param {number} maxRange - Maximum reference
 * @returns {object} Validation result
 */
export const validateDose = (dose, minRange, maxRange) => {
  if (!dose) return { valid: false, message: 'Enter a dose' };
  if (dose < minRange) {
    return {
      valid: true,
      warning: true,
      message: `Below typical range (${minRange}-${maxRange})`
    };
  }
  if (dose > maxRange) {
    return {
      valid: true,
      warning: true,
      message: `Above typical range (${minRange}-${maxRange})`
    };
  }
  return { valid: true, message: 'Within reference range' };
};

/**
 * Format units for display
 * @param {number} units - Units to format
 * @returns {string} Formatted string
 */
export const formatUnits = (units) => {
  if (units < 0.1) return 'Too small to measure accurately';
  if (units > 100) return `${Math.round(units)} units (exceeds 1mL syringe)`;
  return `${units.toFixed(1)} units`;
};

/**
 * Calculate cycle end date
 * @param {Date} startDate - Cycle start
 * @param {number} weeks - Duration in weeks
 * @returns {Date} End date
 */
export const calculateCycleEndDate = (startDate, weeks) => {
  const end = new Date(startDate);
  end.setDate(end.getDate() + (weeks * 7));
  return end;
};

/**
 * Calculate rest end date
 * @param {Date} cycleEndDate - When cycle ends
 * @param {number} restWeeks - Rest period in weeks
 * @returns {Date} When next cycle can start
 */
export const calculateRestEndDate = (cycleEndDate, restWeeks) => {
  const end = new Date(cycleEndDate);
  end.setDate(end.getDate() + (restWeeks * 7));
  return end;
};

/**
 * Get days remaining in cycle
 * @param {Date} endDate - Cycle end date
 * @returns {number} Days remaining (0 if past)
 */
export const getDaysRemaining = (endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

/**
 * Calculate adherence percentage
 * @param {number} plannedDoses - Total planned doses
 * @param {number} takenDoses - Doses actually taken
 * @returns {number} Percentage (0-100)
 */
export const calculateAdherence = (plannedDoses, takenDoses) => {
  if (!plannedDoses) return 0;
  return Math.min(100, Math.round((takenDoses / plannedDoses) * 100));
};

/**
 * Parse frequency string to days per week
 * @param {string} frequency - e.g., "Daily", "2x per week", "5 on/2 off"
 * @returns {number} Average doses per week
 */
export const parseFrequencyToDosesPerWeek = (frequency) => {
  const lower = frequency.toLowerCase();

  if (lower.includes('daily') || lower === '7x per week') return 7;
  if (lower.includes('5 on') || lower === '5 days per week') return 5;
  if (lower.includes('3x') || lower === '3 per week') return 3;
  if (lower.includes('2x') || lower === '2 per week' || lower.includes('twice')) return 2;
  if (lower.includes('weekly') || lower === '1x per week') return 1;
  if (lower.includes('as needed')) return 0;

  // Try to extract number
  const match = lower.match(/(\d+)x/);
  if (match) return parseInt(match[1]);

  return 7; // Default to daily
};

/**
 * Calculate total doses needed for a cycle
 * @param {number} dosesPerWeek - Doses per week
 * @param {number} weeks - Cycle duration in weeks
 * @returns {number} Total doses needed
 */
export const calculateTotalDosesNeeded = (dosesPerWeek, weeks) => {
  return dosesPerWeek * weeks;
};

/**
 * Calculate vials needed for cycle
 * @param {number} totalDosesNeeded - Total doses
 * @param {number} dosesPerVial - Doses in one vial
 * @returns {number} Vials needed (rounded up)
 */
export const calculateVialsNeeded = (totalDosesNeeded, dosesPerVial) => {
  return Math.ceil(totalDosesNeeded / dosesPerVial);
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Format relative date (e.g., "in 5 days", "3 days ago")
 * @param {Date} date - Date to format
 * @returns {string} Relative date string
 */
export const formatRelativeDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};
