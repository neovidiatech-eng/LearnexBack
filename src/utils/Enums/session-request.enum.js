export const requestStatus = Object.freeze({
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
});

// الطلب بيتغير مرة واحدة بس من PENDING، وبعدها نهائي
const REQUEST_TRANSITIONS = {
  [requestStatus.PENDING]: [
    requestStatus.ACCEPTED,
    requestStatus.REJECTED,
    requestStatus.CANCELLED,
    requestStatus.EXPIRED,
  ],
  [requestStatus.ACCEPTED]: [],
  [requestStatus.REJECTED]: [],
  [requestStatus.CANCELLED]: [],
  [requestStatus.EXPIRED]: [],
};

export const canTransitionRequest = (from, to) =>
  REQUEST_TRANSITIONS[from]?.includes(to) ?? false;
