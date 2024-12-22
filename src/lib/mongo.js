export function timestampFromObjectId(objectId) {
  // Ensure the ObjectId is a valid 24-character hexadecimal string
  if (typeof objectId !== "string" || objectId.length !== 24) {
    throw new Error("Invalid ObjectId format");
  }

  // Get the first 8 characters (timestamp in hex)
  const timestampHex = objectId.substring(0, 8);

  // Convert the hex to a decimal number
  const timestamp = parseInt(timestampHex, 16);

  // Convert the timestamp to a Date object
  //   return new Date(timestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds
  return new Date(timestamp);
}

export function objectIdToNumber(objectId) {
  return timestampFromObjectId(objectId).getTime();
}
