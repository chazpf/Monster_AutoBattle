
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
const monsterImgs1 = new MonsterImgs(monstersCR1, '1');

const callAPI = (monsterArr, imgObj, urlCR) => {
  $.ajax({
    url: `https://api.open5e.com/monsters/?document__slug=wotc-srd&challenge_rating=${urlCR}`,
    type: "GET"
  }).then(data => {
    const dataTrimmed = data.results.filter(monster => monsterArr.includes(monster.slug))
    console.log(dataTrimmed);
    buildCarousel(imgObj, dataTrimmed)
  }, () => {
    console.log('Bad request');
  })
}


const buildCarousel = (imgObj, data) => {
  const $carousel = $('<div>').addClass('carousel');

  const $buttonsContainer = $('<div>').attr('id', 'carousel-button-container');
  const $prevButton = $('<button>').attr('id', 'prev').text('Previous');
  const $selectButton = $('<button>').attr('id', 'select').text('Select');
  const $nextButton = $('<button>').attr('id', 'next').text('Next');

  $buttonsContainer.append($prevButton).append($selectButton).append($nextButton);
  $carousel.append($buttonsContainer);
  $('body').append($carousel);

  for (const monster in imgObj) {
    const monsterData = data.find(m => m.slug === monster);
    const $monsterContainer = buildMonsterContainer(imgObj[monster], monsterData)
    $monsterContainer.insertBefore($buttonsContainer);
  }

  $('.carousel-monster-container').eq(0).toggleClass('hide');

  let currentIndex = 0;
  let numOfContainers = $('.carousel-monster-container').length - 1;
  const changeCarousel = direction => {
    $('.carousel-monster-container').eq(currentIndex).toggleClass('hide');
    if (direction === 'next') {
      if (currentIndex < numOfContainers) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
    } else if (direction === 'prev') {
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = numOfContainers;
      }
    }
    $('.carousel-monster-container').eq(currentIndex).toggleClass('hide')
  }

  $('#next').on('click', () => {
    changeCarousel('next');
  });
  $('#prev').on('click', () => {
    changeCarousel('prev');
  });


}

const buildMonsterContainer = (img, data) => {
  const $monsterContainer = $('<div>').addClass('carousel-monster-container').addClass('hide');
  const $img = $('<img>').addClass('carousel-img').attr('src', img);
  const $monsterStats = $('<div>').addClass('carousel-monster-stats');
  const $name = $('<p>').html(`<strong>${data.name}</strong>`);
  const $hp = $('<p>').html(`<strong>HP: </strong>${data.hit_points}`);
  const $ac = $('<p>').html(`<strong>AC: </strong>${data.armor_class}`);
  let attackIndex;
  if (data.actions[0].name === "Multiattack") {
    attackIndex = 1;
  } else {
    attackIndex = 0;
  }
  let damage_bonus;
  if (data.actions[attackIndex].damage_bonus) {
    damage_bonus = data.actions[attackIndex].damage_bonus;
  } else {
    damage_bonus = 0;
  }
  const $attack = $('<p>').html(`<strong>Attack: </strong>${data.actions[attackIndex].name}, +${data.actions[attackIndex].attack_bonus} to hit, ${data.actions[attackIndex].damage_dice}+${damage_bonus} dmg`);

  $monsterStats.append($name).append($hp).append($ac).append($attack);
  $monsterContainer.append($img).append($monsterStats);
  return $monsterContainer;
}

$(() => {
  callAPI(monstersCR1, monsterImgs1, '1');
})
