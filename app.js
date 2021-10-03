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

let currentGroup;

class MonsterGroup {
  constructor(monstersArr, fileCR, urlCR) {
    this.monsterNames = monstersArr;
    this.monsterImgs = [];
    for (const monster of monstersArr) {
      const filepath = `monsters/CR_${fileCR}/${monster}.jpeg`;
      this.monsterImgs.push(filepath);
    }
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
    buildCarousel(this.monsterNames, this.monsterImgs, this.monsterData);
  }
  randomIndex() {
    return Math.floor(Math.random() * this.monsterNames.length);
  }
};

class Monster {
  constructor(img, data) {
    this.index = currentGroup.monsterImgs.indexOf(img);
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
      this.attackString = `<strong>Attack: </strong>${this.attackName}, +${this.attackBonus} to hit, ${this.damageDice}+${this.damageBonus} dmg`;
    } else if (this.damageDice) {
      this.attackString = `<strong>Attack: </strong>${this.attackName}, +${this.attackBonus} to hit, ${this.damageDice} dmg`;
    } else if (this.damageBonus) {
      this.attackString = `<strong>Attack: </strong>${this.attackName}, +${this.attackBonus} to hit, ${this.damageBonus} dmg`;
    }
  }
}

const buildCarousel = (namesArr, imgArr, data) => {
  const $carousel = $('<div>').addClass('carousel');

  const $buttonsContainer = $('<div>').attr('id', 'carousel-button-container');
  const $prevButton = $('<button>').attr('id', 'prev').text('Previous');
  const $selectButton = $('<button>').attr('id', 'select').text('Select');
  const $nextButton = $('<button>').attr('id', 'next').text('Next');

  $buttonsContainer.append($prevButton).append($selectButton).append($nextButton);
  $carousel.append($buttonsContainer);
  $('body').append($carousel);

  for (const monsterName of namesArr) {
    const index = namesArr.indexOf(monsterName);
    const monsterImg = imgArr[index];
    const monsterData = data[index];
    const monster = new Monster(monsterImg, monsterData)
    const $monsterContainer = buildMonsterContainer(monster)
    $monsterContainer.insertBefore($buttonsContainer);
  }

  $('.carousel-monster-container').eq(0).toggleClass('hide');

  let carouselIndex = 0;
  let numOfContainers = $('.carousel-monster-container').length - 1;
  const changeCarousel = direction => {
    $('.carousel-monster-container').eq(carouselIndex).toggleClass('hide');
    if (direction === 'next') {
      if (carouselIndex < numOfContainers) {
        carouselIndex++;
      } else {
        carouselIndex = 0;
      }
    } else if (direction === 'prev') {
      if (carouselIndex > 0) {
        carouselIndex--;
      } else {
        carouselIndex = numOfContainers;
      }
    }
    $('.carousel-monster-container').eq(carouselIndex).toggleClass('hide')
  }

  const select = () => {
    const playersMonster = new Monster(currentGroup.monsterImgs[carouselIndex], currentGroup.monsterData[carouselIndex]);
    buildBattle(playersMonster);
  }

  $('#next').on('click', () => {
    changeCarousel('next');
  });
  $('#prev').on('click', () => {
    changeCarousel('prev');
  });

  $('#select').on('click', select);
};

const buildMonsterContainer = (monster) => {
  const $monsterContainer = $('<div>').addClass('carousel-monster-container').addClass('hide');
  const $imgContainer = $('<div>').addClass('carousel-img-container');
  const $img = $('<img>').addClass('carousel-img').attr('src', monster.img);
  const $monsterStats = $('<div>').addClass('carousel-monster-stats');
  const $name = $('<p>').html(`<strong>${monster.name}</strong>`);
  const $hp = $('<p>').html(`<strong>HP: </strong>${monster.hp}`);
  const $ac = $('<p>').html(`<strong>AC: </strong>${monster.ac}`);
  const $attack = $('<p>').html(monster.attackString);

  $imgContainer.append($img)
  $monsterStats.append($name).append($hp).append($ac).append($attack);
  $monsterContainer.append($imgContainer).append($monsterStats);
  return $monsterContainer;
}

const buildBattle = (monster) => {
  const playersMonster = monster;
  // randomly select a diffect monster from the group
  let randomIndex = currentGroup.randomIndex();
  while (randomIndex === monster.index) {
    randomIndex = currentGroup.randomIndex();
  }
  const enemyMonster = new Monster(currentGroup.monsterImgs[randomIndex], currentGroup.monsterData[randomIndex])
  console.log(playersMonster, enemyMonster);
  // build the html to layout the battle page.

  // instantiate objects for player's monster and enemy monster
  // run the battle
  // when battle is over, display resolution screen, which will show battle summary and have button to either restart or move onto next leve/carousel
};

const firstMonsters = new MonsterGroup(monstersCROneFourth, '1-4', '1/4');
const secondMonsters = new MonsterGroup(monstersCROneHalf, '1-2', '1/2');
const thirdMonsters = new MonsterGroup(monstersCR1, '1');
currentGroup = firstMonsters;

$(() => {
  $('#start-button').on('click', event => {
    if (currentGroup.monsterData) {
      $('#start-container').remove();
      currentGroup.generateCarousel();

    } else {
      console.log('too fast!');
    }
  })
});
