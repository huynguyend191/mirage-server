exports.validateString = (stringVal) => {
  if (stringVal && stringVal.trim().length > 0) {
    return true;
  } 
  return false;
}

exports.validateEmail = (emailVal) => {
  const emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (emailVal && emailPattern.test(emailVal)) {
    return true;
  }
  return false;
}

exports.validateNumber = (numVal) => {
  if (Number.isInteger(numVal)) {
    return true;
  }
  return false;
}