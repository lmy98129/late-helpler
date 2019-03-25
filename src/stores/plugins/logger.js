export default store => {
  store.subscribe(mutation => {
    if (mutation.payload === undefined) {
      delete mutation.payload;
    }
    console.log('MUTATION: ', mutation);
  })
}