export const average = (arr: number[]): number => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
};

// Reusable buffer for median calculation to avoid allocations
let medianBuffer: number[] = new Array(200); // Start with a reasonable size

export const median = (arr: number[]): number => {
    if (!arr || arr.length === 0) return 0;

    // Ensure buffer is large enough
    if (medianBuffer.length < arr.length) {
        medianBuffer = new Array(arr.length * 2);
    }

    // Copy data to buffer
    for (let i = 0; i < arr.length; i++) {
        medianBuffer[i] = arr[i];
    }

    // Sort valid portion of buffer
    // using subarray is safer but creates a view, let's just sort the slice logic manually or use subarray which is cheap
    // Array.prototype.sort mutates. We only want to sort the first N elements.
    // JS arrays are dynamic, but we want to avoid GC.
    // Using a subarray (slice) creates a new array (alloc).
    // subarray() on TypedArray is cheap, but these are number[] (Objects).
    // So we must fallback to: copy to buffer -> sort buffer -> take middle.
    // But Array.prototype.sort sorts the *entire* array.
    // We can just use a shared array that we don't care about the tail of, IF we can tell sort to stop... we can't.
    // ACTUALLY: The best way for zero-alloc sort on a subset of a generic Array is tricky without writing a custom QuickSort.
    // Given the constraints and standard JS engine optimization:
    // If we just trim the length of the reused array, it might realloc internally if it grows, but shrinking is usually fine.

    // Let's resize the buffer length. This is generally optimized in V8.
    medianBuffer.length = arr.length;
    medianBuffer.sort((a, b) => a - b);

    const middle = Math.floor(medianBuffer.length / 2);
    if (medianBuffer.length % 2 === 0) {
        return (medianBuffer[middle - 1] + medianBuffer[middle]) / 2;
    }
    return medianBuffer[middle];
};
