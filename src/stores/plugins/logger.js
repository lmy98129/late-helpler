export default store => {
  store.subscribe(mutation => {
    console.log('MUTATION: ', mutation);
  })
}