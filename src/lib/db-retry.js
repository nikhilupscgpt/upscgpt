/**
 * Executes a database operation with exponential backoff retry logic.
 * Useful for handling Prisma connection pool timeouts (P2024) or closed connections (P1017)
 * common in serverless environments like Neon.
 * 
 * @param {Function} operation - The async database operation to perform.
 * @param {number} maxRetries - Maximum number of retry attempts.
 * @param {number} baseDelayMs - Initial delay before first retry in milliseconds.
 * @returns {Promise<any>} The result of the operation.
 */
export async function runWithRetry(operation, maxRetries = 3, baseDelayMs = 1000) {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      const isConnectionError = 
        error?.code === 'P1017' || // Server closed the connection
        error?.code === 'P2024' || // Connection pool timeout
        error?.message?.includes('connection') ||
        error?.message?.includes('timeout');

      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }

      attempt++;
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s...
      console.warn(`[DB Retry] Attempt ${attempt}/${maxRetries} failed with ${error?.code || 'error'}. Retrying in ${delayMs}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
