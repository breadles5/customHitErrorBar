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
  const count = Math.min(hitErrorCount, MAX_HIT_ERRORS);
  if (count <= 1) return 0;

  const mean = calculateRingAverage();
  let sumSquaredDiff = 0;

  for (let i = 0; i < count; i++) {
    const diff = hitErrorRing[i] - mean;
    sumSquaredDiff += diff * diff;
  }

  return Math.sqrt(sumSquaredDiff / (count - 1));
};

// Handle messages from main thread
self.onmessage = (e) => {
  const { type, data } = e.data;
  let hitError;

  switch (type) {
    case "addHitError":
      hitError = Number(data);
      if (!isNaN(hitError)) {
        hitErrorRing[hitErrorIndex] = hitError;
        hitErrorIndex = (hitErrorIndex + 1) % MAX_HIT_ERRORS;
        hitErrorCount++;

        // Calculate and send statistics
        const average = calculateRingAverage();
        const standardDeviation = calculateSD();

        self.postMessage({
          type: "statistics",
          data: {
            average,
            standardDeviation,
            count: Math.min(hitErrorCount, MAX_HIT_ERRORS),
          },
        });
      }
      break;

    case "reset":
      // Reset all values
      hitErrorIndex = 0;
      hitErrorCount = 0;
      hitErrorRing.fill(0);

      self.postMessage({
        type: "statistics",
        data: {
          average: 0,
          standardDeviation: 0,
          count: 0,
        },
      });
      break;
  }
};
