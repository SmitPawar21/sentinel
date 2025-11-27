let logBuffer = [];

// addLog(log) → push to buffer
export const addLog = (log) => {
    logBuffer.push(log);
}

export const bufferFull = () => {
    return logBuffer.length >= process.env.MAX_BATCH;
}

// getBuffer() → return snapshot of current logs
export const getBuffer = () => {
    const snapshot = logBuffer;
    logBuffer = [];
    return snapshot;
}

export const bufferEmpty = () => {
    return (!logBuffer.length);
}

// clearBuffer() → empty the buffer
export const clearBuffer = () => {
    logBuffer = [];
}