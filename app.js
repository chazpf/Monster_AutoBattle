$.ajax({
  url: 'https://api.open5e.com/monsters/?document__slug=wotc-srd&challenge_rating=1/8',
  type: "GET"
}).then(data => {
  console.log(data);
})
