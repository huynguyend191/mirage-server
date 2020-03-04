module.exports = (stringVal) => {
  if (stringVal && stringVal.trim().length > 0) {
    return true;
  } 
  return false;
}