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

// export function objectIdToNumber(objectId) {
//   return timestampFromObjectId(objectId).getTime();
// }

export function objectIdToNumber(objectId) {
  // Extract the timestamp as milliseconds
  const timestamp = timestampFromObjectId(objectId).getTime();

  // Get the last 6 characters (counter in hex)
  const counterHex = objectId.substring(16, 24); // Last 6 characters

  // Convert the hex counter value to decimal
  const counter = parseInt(counterHex, 16);

  // console.log({ counter });

  // Combine timestamp and counter and return as a number
  // Ensure the counter part is always 6 characters long (pad with leading zeros if necessary)
  return Number(String(timestamp) + String(counter).slice(-6).padStart(6, "0"));
}
