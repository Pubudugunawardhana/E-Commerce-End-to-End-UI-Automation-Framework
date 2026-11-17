/**
 * Extract the number from a price label.
 * Examples: "$29.99" -> 29.99, "Item total: $39.98" -> 39.98
 */
exports.parsePrice = (text) => {
  const match = text.match(/\$(\d+(?:\.\d+)?)/);
  if (!match) {
    throw new Error(`Could not find a price in "${text}"`);
  }
  return parseFloat(match[1]);
};
