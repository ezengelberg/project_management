import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";

/**
 * Get a bundle of Hebrew years (current, previous, next) with both numeric values and formatted Hebrew labels
 * 
 * This function correctly derives Hebrew years directly from the Jewish calendar,
 * rather than by shifting Gregorian years, making it accurate around Rosh Hashanah.
 * 
 * @param {Date} date - Optional date to base calculations on (defaults to today)
 * @returns {Object} Object containing current, previous, and next Hebrew years (both numeric and formatted)
 */
export function getHebrewYearBundle(date = new Date()) {
  const { year: currentYear } = toJewishDate(date);

  // Remove leading ה/ה׳ and keep Hebrew letters & punctuation like ׳/״
  const cleanHebrewYearToken = (token) =>
    token
      .replace(/^ה[׳']?/, '')          // strip ה or ה׳
      .replace(/[^\u05D0-\u05EA"׳״']/g, '') // keep Hebrew letters + common geresh/gershayim
      .trim();

  // Format a Hebrew year label by formatting 1 Tishrei of that year and taking the last token.
  const formatYearHeb = (y) => {
    // NOTE: Many libs use Tishrei=7 (Nisan=1). If your lib uses Tishrei=1, change month: 7 -> 1.
    const tishrei = { day: 1, month: 7, year: y };
    const full = formatJewishDateInHebrew(tishrei);
    const yearToken = full.trim().split(/\s+/).pop();
    return cleanHebrewYearToken(yearToken);
  };

  const previousYear = currentYear - 1;
  const nextYear = currentYear + 1;

  return {
    // numeric years
    current: currentYear,
    previous: previousYear,
    next: nextYear,

    // Hebrew labels like "תשפ״ח"
    currentLabel: formatYearHeb(currentYear),
    previousLabel: formatYearHeb(previousYear),
    nextLabel: formatYearHeb(nextYear),
  };
}