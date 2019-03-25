const setTimer = (callback, timeout, state) => {
  return function timer() {
    setTimeout(() => {
      if (state.isStartInterval) {
        callback();
        timer();
        state.timeCounter++;
      }
    }, timeout);
  }
}

export {
  setTimer,
}