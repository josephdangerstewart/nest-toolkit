/**
 * A year is a leap year iff
 * 1. It is divisible by 4 UNLESS
 * 2. It is also divisible by 100 UNLESS
 * 3. It is also divisible by 400
 */
function isLeapYear(year: number): boolean {
	return (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);
}

const monthsWith30Days = {
	4: 'April',
	6: 'June',
	9: 'September',
	11: 'November'
}

export function isValidDate(date: string): [isValid: boolean, error: string] {
	const dateParts = /([0-9]{4})\-([0-9]{2})\-([0-9]{2})/.exec(date);
	if (!dateParts) {
		return [false, 'Invalid date. Must be in format YYYY-MM-DD.'];
	}

	const [,yearRaw, monthRaw, dateRaw] = dateParts;
	const [year, month, day] = [parseInt(yearRaw), parseInt(monthRaw), parseInt(dateRaw)];

	if (year < 0) {
		return [false, 'Invalid date. Year must be greater than 0'];
	}

	
	if (month < 1 || month > 12) {
		return [false, 'Invalid date. Month must be between 1 and 12 inclusive'];
	}

	if (day < 1 || day > 31) {
		return [false, 'Invalid date. Must be between 1 and 31 inclusive'];
	}

	if (day === 31 && monthsWith30Days[month]) {
		return [false, `Invalid date. Month ${monthsWith30Days[month]} only has 30 days`];
	}

	const daysInFebruary = isLeapYear(year) ? 29 : 28;
	if (day > daysInFebruary && month === 2) {
		return [false, `Invalid date. In ${year}, February only has ${daysInFebruary} days`];
	}

	return [true, null];
}
