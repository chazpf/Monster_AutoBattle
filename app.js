
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
  'cocktrice',
  'crocodile',
  'giant-wasp',
  'grey-ooze',
  'hobgoblin',
  'magmin',
  'rust-monster',
  'shadow',
  'worg'
]

const monstersCR1 = [
  'animated-armor',
  'brass-dragon-wyrmling',
  'death-dog',
  'dire-wolf',
  'ghoul',
  'giant-toad',
  'giant-vulture',
  'hobgoblin',
  'imp',
  'tiger'
]

class MonsterImgs {
  constructor(arr, cr) {
    for (const monster of arr) {
      this[monster] = `monsters/CR_${cr}/${monster}.jpeg`
    }
  }
}

const monsterImgsOneFourth = new MonsterImgs(monstersCROneFourth, '1-4');
const monsterImgsOneHalf = new MonsterImgs(monstersCROneHalf, '1-2');
const monsterImgs1 = new MonsterImgs(monstersCR1, '1');

$(() => {
  for (const monster in monsterImgs1) {
    const $img = $('<img>').attr('src', monsterImgs1[monster]);
    $img.css('width', '20vw');
    $('body').append($img)
  }
})

// $.ajax({
//   url: 'https://api.open5e.com/monsters/?document__slug=wotc-srd&challenge_rating=10',
//   type: "GET"
// }).then(data => {
//   console.log(data);
// }, () => {
//   console.log('Bad request');
// })
