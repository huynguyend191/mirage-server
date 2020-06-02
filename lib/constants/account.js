exports.ROLES = Object.freeze({
  ADMIN: 1,
  TUTOR: 2,
  STUDENT: 3
});

exports.PROFILE_STATUS = Object.freeze({
  ACCEPTED: 1,
  PENDING: 2,
  REJECTED: 3
});

exports.STATES = Object.freeze({
  ACTIVE: 1,
  INACTIVE: 0
});

exports.VERIFICATION = Object.freeze({
  VERIFIED: 1,
  UNVERIFIED: 0
});

exports.STATUS = Object.freeze({
  AVAILABLE: 1,
  BUSY: 0
});

exports.REPORT_REASONS = Object.freeze({
  NUDITY: 'Nudity',
  HARASSMENT: 'Harassment',
  SPAM: 'Spam',
  HATE_SPEECH: 'Hate speech',
  STH_ELSE: 'Something else'
});

exports.REPORT_STATE = Object.freeze({
  RESOLVED: 1,
  PENDING: 2,
  CANCELLED: 3
});

exports.PREFERENCE_TYPE = Object.freeze({
  FAVORITE: 1,
  RECOMMEND: 2
});
