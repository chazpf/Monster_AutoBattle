
const monstersCROneFourth = [
  'blink-dog',
  'constrictor-snake',
  'dretch',
  'flying-sword',
  'giant-centipede',
  'goblin',
  'skeleton',
  'sprite',
  'violet-fungus',
  'zombie'
]

const monstersCROneHalf = [
  'black-bear',
  'cockatrice',
  'crocodile',
  'giant-wasp',
  'gray-ooze',
  'hobgoblin',
  'magmin',
  'rust-monster',
  'shadow',
  'worg'
]

const monstersCR1 = [
  'animated-armor',
  'brass-dragon-wyrmling',
  'bugbear',
  'death-dog',
  'dire-wolf',
  'ghoul',
  'giant-toad',
  'giant-vulture',
  'imp',
  'tiger'
]

class MonsterImgs {
  constructor(arr, fileCR) {
    for (const monster of arr) {
      this[monster] = `monsters/CR_${fileCR}/${monster}.jpeg`
    }
  }
}

const monsterImgsOneFourth = new MonsterImgs(monstersCROneFourth, '1-4');
const monsterImgsOneHalf = new MonsterImgs(monstersCROneHalf, '1-2');
console.log(monsterImgsOneHalf);
const monsterImgs1 = new MonsterImgs(monstersCR1, '1');

$(() => {
  for (const monster in monsterImgsOneFourth) {
    const $img = $('<img>').attr('src', monsterImgsOneFourth[monster]);
    $img.css('width', '20vw');
    $('body').append($img)
  }
})

const callAPI = (arr, cr) => {
  $.ajax({
    url: `https://api.open5e.com/monsters/?document__slug=wotc-srd&challenge_rating=${cr}`,
    type: "GET"
  }).then(data => {
    const dataTrimmed = data.results.filter(monster => arr.includes(monster.slug))
    console.log(dataTrimmed);
  }, () => {
    console.log('Bad request');
  })
}
