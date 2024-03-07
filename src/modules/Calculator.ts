export function DateToNumber(year: number, month: number, day: number): number {
    return year * 10000 + month * 100 + day;
}

export function isNumber(value: string): boolean {
    let DecimalPointUsed = false;

    value = value.replaceAll(',', '.');

    for (let i = 0; i < value.length; i++) {
        if ((value.charAt(i) >= '0' && value.charAt(i) <= '9') || (i === 0 && value[i] === '-' && value.length > 1)) continue;
        if (value.charAt(i) === '.' && i !== 0 && i !== value.length - 1 && !DecimalPointUsed) {
            DecimalPointUsed = true;
            continue;
        }

        console.log("false");
        return false;
    }

    return true;
}