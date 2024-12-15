// Description: This file contains helper functions used for validating user input

// validTrimInput: function to validate the type of input, trim it and return
// Smaple Usage:
//  let someVariable = '  some string  ';
//  someVarable = validTrimInput(someVariable, 'string');
//  console.log(someVariable === 'some string'); // true
//
//  If someVariable is not a string, it will throw an error;
//  Supported types: int, nat, posint, number, boolean, string, object, !array, array, undefined
export function validTrimInput(input, type) {
  let validTypes = [
    "int",
    "nat",
    "posint",
    "number",
    "boolean",
    "string",
    "object",
    "!array",
    "array",
    "undefined"
  ];

  if (!validTypes.includes(type)) {
    throw new Error("Invalid type name given to validTrimInput");
  }

  if (
    type === "int" ||
    type === "nat" ||
    type === "posint" ||
    type === "number"
  ) {
    if (typeof input !== "number") {
      throw new Error("input must be a number");
    }
    switch (type) {
      case "int":
        if (input % 1 !== 0) {
          throw new Error("Not an integer");
        }
      case "nat":
        if (input % 1 !== 0 || input < 0) {
          throw new Error("Not a natural number");
        }
      case "posint":
        if (input % 1 !== 0 || input < 1) {
          throw new Error("Not a positive integer");
        }
    }
    type = "number";
  }

  if (type === "array" && !Array.isArray(input)) {
    throw new Error("Input should be an array");
    // type = 'object';
  }

  if (type === "!array" && Array.isArray(input)) {
    throw new Error("Input should be a non-array object");
    // type = 'object';
  }

  if (type === "array" || type === "!array") {
    type = "object";
  }

  if (typeof input !== type) {
    throw new Error("input must be of primitve type: " + type);
  }

  if ((typeof input === "number" && isNaN(input)) || input === null) {
    // undefined is actually already taken care of
    throw new Error("input cannot be NaN or null");
  }

  if (type === "string") {
    input = input.trim();

    if (input.length === 0) {
      throw new Error("input must not be empty or just white spaces");
    }
  }

  return input;
}

// validInputDate: function to validate the input from <input type="date">
// only valid date format "yyyy-mm-dd"
export function validInputDate(input) {
  input = validTrimInput(input, "string");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    throw new Error("Invalid date format from user post input");
  }

  let inputDate = new Date(input);
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  inputDate.setUTCHours(1, 0, 0, 0);
  // console.log(today);
  // console.log(inputDate);
  if (today > inputDate) {
    throw new Error("Plan cannot be in the past");
  }

  return input;
}
