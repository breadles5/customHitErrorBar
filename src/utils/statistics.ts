export const average = (arr: number[]): number => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
};

export const standardDeviation = (arr: number[]): number => {
    if (!arr || arr.length === 0) return 0;
    const avg = average(arr);
    const squareDiffs = arr.map((value) => {
        const diff = value - avg;
        const sqrDiff = diff * diff;
        return sqrDiff;
    });
    const avgSquareDiff = average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
};
