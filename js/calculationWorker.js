// Calculation worker for hit error statistics
const MAX_HIT_ERRORS = 50;
const hitErrorRing = new Array(MAX_HIT_ERRORS).fill(0);
let hitErrorIndex = 0;
let hitErrorCount = 0;

// Calculate average of hit errors
const calculateRingAverage = () => {
    const count = Math.min(hitErrorCount, MAX_HIT_ERRORS);
    if (count === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < count; i++) {
        sum += hitErrorRing[i];
    }
    return sum / count;
};

// Calculate standard deviation
const calculateSD = () => {
    if (hitErrorCount === 0) return 0;
    
    const count = Math.min(hitErrorCount, MAX_HIT_ERRORS);
    const mean = calculateRingAverage();
    let variance = 0;
    
    for (let i = 0; i < count; i++) {
        variance += Math.pow(hitErrorRing[i] - mean, 2);
    }
    
    return Math.sqrt(variance / count);
};

// Handle messages from main thread
self.onmessage = (e) => {
    const { type, data } = e.data;
    
    switch (type) {
        case 'addHitError':
            // Update ring buffer
            hitErrorRing[hitErrorIndex] = data.hitError;
            hitErrorIndex = (hitErrorIndex + 1) % MAX_HIT_ERRORS;
            hitErrorCount++;
            
            // Calculate new statistics
            const average = calculateRingAverage();
            const standardDeviation = calculateSD();
            
            // Send results back to main thread
            self.postMessage({
                type: 'statistics',
                data: {
                    average,
                    standardDeviation
                }
            });
            break;
            
        case 'reset':
            hitErrorRing.fill(0);
            hitErrorIndex = 0;
            hitErrorCount = 0;
            self.postMessage({
                type: 'statistics',
                data: {
                    average: 0,
                    standardDeviation: 0
                }
            });
            break;
    }
};
