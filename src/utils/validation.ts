import { ValidateAble } from "../models/project.js";

export function validateProject(validateAbleInput: ValidateAble): boolean {
    let isValid = true;
    if (validateAbleInput.required) {
      isValid = isValid && validateAbleInput.value.toString().trim().length !== 0;
    }
    if (
      validateAbleInput.minLength != null &&
      typeof validateAbleInput.value === "string"
    ) {
      isValid =
        isValid && validateAbleInput.value.length >= validateAbleInput.minLength;
    }
    if (
      validateAbleInput.maxLength != null &&
      typeof validateAbleInput.value === "string"
    ) {
      isValid =
        isValid && validateAbleInput.value.length <= validateAbleInput.maxLength;
    }
    if (
      validateAbleInput.min != null &&
      typeof validateAbleInput.value === "number"
    ) {
      isValid = isValid && validateAbleInput.value >= validateAbleInput.min;
    }
    if (
      validateAbleInput.max != null &&
      typeof validateAbleInput.value === "number"
    ) {
      isValid = isValid && validateAbleInput.value <= validateAbleInput.max;
    }
    return isValid;
  }
  
  