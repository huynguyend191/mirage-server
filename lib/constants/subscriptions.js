exports.STATE = Object.freeze({
  COMPLETED: 1,
  PENDING: 2,
  CANCELED: 3
});

exports.TIER = Object.freeze({
  NORMAL: 1,
  SILVER: 2,
  GOLD: 3,
  PLATIUM: 4
});

//TODO might change this to be adjust by Admin

exports.DISCOUNT_RATE = Object.freeze({
  NORMAL: 1, //$
  SILVER: 0.85,
  GOLD: 0.75,
  PLATIUM: 0.65
});

exports.PRICE_PER_MIN = 0.1; //$
