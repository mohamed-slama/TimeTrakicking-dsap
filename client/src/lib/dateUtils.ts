import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  isValid,
  getWeek,
  getYear,
  getMonth,
} from "date-fns";

/**
 * Format a date with a specified format string
 */
export const formatDate = (date: Date | string, formatString: string = "yyyy-MM-dd"): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (!isValid(dateObj)) return "Invalid date";
  return format(dateObj, formatString);
};

/**
 * Get start and end dates for various time periods
 */
export const getDateRange = (
  period: "today" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth" | "thisYear",
  date: Date = new Date()
): { startDate: Date; endDate: Date } => {
  switch (period) {
    case "today":
      return {
        startDate: date,
        endDate: date,
      };
    case "thisWeek":
      return {
        startDate: startOfWeek(date),
        endDate: endOfWeek(date),
      };
    case "lastWeek":
      const lastWeekDate = subWeeks(date, 1);
      return {
        startDate: startOfWeek(lastWeekDate),
        endDate: endOfWeek(lastWeekDate),
      };
    case "thisMonth":
      return {
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
      };
    case "lastMonth":
      const lastMonthDate = subMonths(date, 1);
      return {
        startDate: startOfMonth(lastMonthDate),
        endDate: endOfMonth(lastMonthDate),
      };
    case "thisYear":
      return {
        startDate: startOfYear(date),
        endDate: endOfYear(date),
      };
    default:
      return {
        startDate: startOfWeek(date),
        endDate: endOfWeek(date),
      };
  }
};

/**
 * Get the week number (1-53) for a given date
 */
export const getWeekNumber = (date: Date): number => {
  return getWeek(date);
};

/**
 * Get date info as an object
 */
export const getDateInfo = (date: Date): { year: number; month: number; week: number } => {
  return {
    year: getYear(date),
    month: getMonth(date) + 1, // getMonth returns 0-11
    week: getWeekNumber(date),
  };
};

/**
 * Convert a date string to year, month, week
 */
export const dateToYearMonthWeek = (
  dateString: string
): { year: number; month: number; week: number } => {
  const date = new Date(dateString);
  if (!isValid(date)) {
    const now = new Date();
    return {
      year: getYear(now),
      month: getMonth(now) + 1,
      week: getWeekNumber(now),
    };
  }
  return getDateInfo(date);
};

/**
 * Calculate the duration in days between two dates
 */
export const calculateDuration = (
  startDate: Date | string,
  endDate: Date | string
): { days: number; weeks: number; months: number } => {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) {
    return { days: 0, weeks: 0, months: 0 };
  }

  return {
    days: differenceInDays(end, start),
    weeks: differenceInWeeks(end, start),
    months: differenceInMonths(end, start),
  };
};

/**
 * Get an array of month names
 */
export const getMonthNames = (): { value: number; label: string }[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2000, i, 1), "MMMM"),
  }));
};

/**
 * Get an array of week numbers for a given year
 */
export const getWeeksInYear = (year: number): { value: number; label: string }[] => {
  // Most years have 52 weeks, some have 53
  const weeksCount = getWeek(new Date(year, 11, 31));
  
  return Array.from({ length: weeksCount }, (_, i) => ({
    value: i + 1,
    label: `Week ${i + 1}`,
  }));
};

/**
 * Format a date range as a string
 */
export const formatDateRange = (
  startDate: Date | string,
  endDate: Date | string,
  formatString: string = "MMM d, yyyy"
): string => {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) {
    return "Invalid date range";
  }

  return `${format(start, formatString)} - ${format(end, formatString)}`;
};

/**
 * Check if a date is within a range
 */
export const isDateInRange = (
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean => {
  const checkDate = typeof date === "string" ? new Date(date) : date;
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (!isValid(checkDate) || !isValid(start) || !isValid(end)) {
    return false;
  }

  return checkDate >= start && checkDate <= end;
};
