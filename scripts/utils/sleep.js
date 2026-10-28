/**
 * Resolves after the given amount of milliseconds
 * @param {number} ms
 * @returns {Promise<void>}
 */
export default function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
