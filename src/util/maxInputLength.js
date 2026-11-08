/**
 * Validate a user-supplied limit on the length of the selector to parse.
 *
 * No limit applies by default, so falling back on an invalid value, as
 * resolveMaxNestingDepth() does, would silently turn off a guard the caller
 * asked for. An invalid value is a configuration mistake and throws instead.
 *
 * @param {unknown} value the limit provided through the `maxInputLength` option
 * @returns {number} a non-negative integer limit, or Infinity for no limit
 */
export default function resolveMaxInputLength(value) {
  if (value === undefined || value === Infinity) {
    return Infinity;
  }
  if (Number.isSafeInteger(value) && value >= 0) {
    return value;
  }
  throw new TypeError(
    `maxInputLength must be a non-negative integer or Infinity, received ${String(value)}.`,
  );
}
