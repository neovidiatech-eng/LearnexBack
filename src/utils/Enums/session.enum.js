export const sessionStatus = Object.freeze({
    SCHEDULED: "SCHEDULED",
    LIVE: "LIVE",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
});

const SESSION_TRANSITIONS = {
  [sessionStatus.SCHEDULED]: [sessionStatus.LIVE, sessionStatus.CANCELLED],
  [sessionStatus.LIVE]: [sessionStatus.COMPLETED],
  [sessionStatus.COMPLETED]: [],
  [sessionStatus.CANCELLED]: [],
};

export const canTransitionSession = (from, to) =>
  SESSION_TRANSITIONS[from]?.includes(to) ?? false;