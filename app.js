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
];

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
];

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
];

class MonsterImgs {
  constructor(arr, fileCR) {
    for (const monster of arr) {
      this[monster] = `monsters/CR_${fileCR}/${monster}.jpeg`
    }
  }
}

class MonsterGroup {
  constructor(monstersArr, fileCR, urlCR) {
    this.monsterNames = monstersArr;
    this.monsterImgs = new MonsterImgs(monstersArr, fileCR);
    this.fileCR = fileCR;
    this.urlCR = urlCR || fileCR;
    $.ajax({
      url: `https://api.open5e.com/monsters/?document__slug=wotc-srd&challenge_rating=${this.urlCR}`,
      type: "GET"
    }).then(data => {
      const dataTrimmed = data.results.filter(monster => this.monsterNames.includes(monster.slug))
      this.monsterData = dataTrimmed;
    }, () => {
      console.log('Bad request');
    })
  }
  generateCarousel() {
    $('.carousel').remove();
    buildCarousel(this.monsterImgs, this.monsterData);
  }
};

class Monster {
  constructor(img, data) {
    this.img = img;
    this.name = data.name;
    this.hp = data.hit_points;
    this.ac = data.armor_class;
    let attackIndex;
    if (data.actions[0].name === "Multiattack") {
      attackIndex = 1;
    } else {
      attackIndex = 0;
    }
    this.attackName = data.actions[attackIndex].name;
    this.attackBonus = data.actions[attackIndex].attack_bonus || 0;
    if (data.actions[attackIndex].damage_bonus) {
      this.damageBonus = data.actions[attackIndex].damage_bonus;
    }
    if (data.actions[attackIndex].damage_dice) {
      this.damageDice = data.actions[attackIndex].damage_dice;
    }
    if (this.damageBonus && this.damageDice) {
      this.attackStr = `<strong>Attack: </strong>${this.attackName}, +${this.attackBonus} to hit, ${this.damageDice}+${this.damageBonus} dmg`;
    } else if (this.damageDice) {
      this.attackStr = `<strong>Attack: </strong>${this.attackName}, +${this.attackBonus} to hit, ${this.damageDice} dmg`;
    } else if (this.damageBonus) {
      this.attackStr = `<strong>Attack: </strong>${this.attackName}, +${this.attackBonus} to hit, ${this.damageBonus} dmg`;
    }
  }
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

  const select = () => {
    const testMonster = new Monster(firstMonsters.monsterImgs[firstMonsters.monsterNames[currentIndex]], firstMonsters.monsterData[currentIndex])
    console.log(testMonster);
  }

  $('#next').on('click', () => {
    changeCarousel('next');
  });
  $('#prev').on('click', () => {
    changeCarousel('prev');
  });

  $('#select').on('click', select);
};

const buildMonsterContainer = (img, data) => {
  const $monsterContainer = $('<div>').addClass('carousel-monster-container').addClass('hide');
  const $imgContainer = $('<div>').addClass('carousel-img-container');
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

  $imgContainer.append($img)
  $monsterStats.append($name).append($hp).append($ac).append($attack);
  $monsterContainer.append($imgContainer).append($monsterStats);
  return $monsterContainer;
}

const buildBattle = () => {
  // build the html to layout the battle page.
  // receive the data for the player's monster
  // randomly select a diffect monster from the group
  // instantiate objects for player's monster and enemy monster
  // run the battle
  // when battle is over, display resolution screen, which will show battle summary and have button to either restart or move onto next leve/carousel
};

const firstMonsters = new MonsterGroup(monstersCROneFourth, '1-4', '1/4');
const secondMonsters = new MonsterGroup(monstersCROneHalf, '1-2', '1/2');
const thirdMonsters = new MonsterGroup(monstersCR1, '1');

$(() => {
  $('#start-button').on('click', event => {
    if (firstMonsters.monsterData) {
      $('#start-container').remove();
      firstMonsters.generateCarousel();
    } else {
      console.log('too fast!');
    }
  })
});
