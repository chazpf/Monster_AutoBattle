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

const modifiers = {
  1: -5,
  2: -4,
  3: -4,
  4: -3,
  5: -3,
  6: -2,
  7: -2,
  8: -1,
  9: -1,
  10: 0,
  11: 0,
  12: 1,
  13: 1,
  14: 2,
  15: 2,
  16: 3,
  17: 3,
  18: 4,
  19: 4,
  20: 5,
}

let currentGroup;
let playerMonster;
let enemyMonster;

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
      console.log(data);
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
    this.currentHp = this.hp;
    this.ac = data.armor_class;
    this.dex = data.dexterity;
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
  rollD20() {
    return Math.floor(Math.random() * 20 ) + 1;
  }
  rollInitiative() {
    return this.rollD20() + modifiers[`${this.dex}`];
  }
  rollAttack() {
    return this.rollD20() + this.attackBonus;
  }
  rollDamage() {
    if (this.damageDice) {
      const [diceNumber, diceType] = this.damageDice.split('d');
      let diceResult = 0;
      for (let i=0; i<diceNumber; i++) {
        diceResult += Math.floor(Math.random() * diceType) + 1;
      }
      if (this.damageBonus) {
        return diceResult + this.damageBonus;
      } else {
        return diceResult;
      }
    } else {
      return this.attackBonus;
    }
  }
  attack(target) {
    const attackRoll = this.rollAttack();
    let message;
    if (attackRoll >= target.ac) {
      const damage = this.rollDamage();
      target.currentHp -= damage;
      message = `${this.name} used ${this.attackName} and rolled a ${attackRoll}. It hits ${target.name} for ${damage} damage!`;
    } else {
      message = `${this.name} used ${this.attackName} and rolled a ${attackRoll}. It misses ${target.name}'s AC of ${target.ac}!`;
    }
    return message;
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
    const playerMonster = new Monster(currentGroup.monsterImgs[carouselIndex], currentGroup.monsterData[carouselIndex]);
    $('.carousel').remove();
    $('.rules-description').remove();
    buildBattle(playerMonster);
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
  const $initiative = $('<p>').html(`<strong>Initiative: </strong>${modifiers[`${monster.dex}`]}`);
  const $attack = $('<p>').html(monster.attackString);

  $imgContainer.append($img)
  $monsterStats.append($name).append($hp).append($ac).append($initiative).append($attack);
  $monsterContainer.append($imgContainer).append($monsterStats);
  return $monsterContainer;
}

const buildBattle = (monster) => {
  playerMonster = monster;

  let randomIndex = currentGroup.randomIndex();
  while (randomIndex === monster.index) {
    randomIndex = currentGroup.randomIndex();
  }
  enemyMonster = new Monster(currentGroup.monsterImgs[randomIndex], currentGroup.monsterData[randomIndex]);
  console.log(playerMonster, enemyMonster);

  // build the html to layout the battle page.
  const $battle = $('<div>').addClass('battle');
  const $playerMonster = $('<div>').addClass('monster').attr('id', 'player-monster');
  const $playerImg = $('<img>').addClass('img').attr('src', `${playerMonster.img}`);
  const $playerDescription = $('<div>').addClass('description');
  const $playerName = $('<p>').html(`<strong>${playerMonster.name}</strong>`);
  const $playerHp = $('<p>').addClass('player-hp').html(`<strong>HP: </strong>${playerMonster.hp}`);
  const $playerAc = $('<p>').html(`<strong>AC: </strong>${playerMonster.ac}`);
  const $playerAttack = $('<p>').html(playerMonster.attackString);

  const $battleLog = $('<div>').attr('id', 'battle-log');

  const $enemyMonster = $('<div>').addClass('monster').attr('id', 'enemy-monster');
  const $enemyImg = $('<img>').addClass('img').attr('src', `${enemyMonster.img}`);
  const $enemyDescription = $('<div>').addClass('description');
  const $enemyName = $('<p>').html(`<strong>${enemyMonster.name}</strong>`);
  const $enemyHp = $('<p>').addClass('enemy-hp').html(`<strong>HP: </strong>${enemyMonster.hp}`);
  const $enemyAc = $('<p>').html(`<strong>AC: </strong>${enemyMonster.ac}`);
  const $enemyAttack = $('<p>').html(enemyMonster.attackString);

  $playerDescription.append($playerName).append($playerHp).append($playerAc).append($playerAttack);
  $enemyDescription.append($enemyName).append($enemyHp).append($enemyAc).append($enemyAttack);
  $playerMonster.append($playerImg).append($playerDescription);
  $enemyMonster.append($enemyImg).append($enemyDescription);
  $battle.append($playerMonster).append($battleLog).append($enemyMonster);

  $('body').append($battle);
  // run the battle
  startBattle();

  // when battle is over, display resolution screen, which will show battle summary and have button to either restart or move onto next leve/carousel
};

const startBattle = () => {
  const playerInit = playerMonster.rollInitiative();
  updateBattleLog(`${playerMonster.name} rolled ${playerInit} initiative`);
  const enemyInit = enemyMonster.rollInitiative();
  updateBattleLog(`${enemyMonster.name} rolled ${enemyInit} initiative`);
  if (playerInit > enemyInit) {
    updateBattleLog(`${playerMonster.name} goes first!`);
    setTimeout(() => {
      handleAttack('player');
    }, 2000);
  } else {
    updateBattleLog(`${enemyMonster.name} goes first!`);
    setTimeout(() => {
      handleAttack('enemy');
    }, 2000);
  }
}

const updateBattleLog = text => {
  const $text = $('<p>').text(text);
  $('#battle-log').append($text);
}

const updateHP = () => {
  $('.player-hp').html(`<strong>HP: </strong>${playerMonster.currentHp}`)
  $('.enemy-hp').html(`<strong>HP: </strong>${enemyMonster.currentHp}`)
}

const handleAttack = side => {
  if (side === 'player') {
    updateBattleLog(playerMonster.attack(enemyMonster));
    updateHP();
    setTimeout(() => {
      if (enemyMonster.currentHp > 0) {
        handleAttack('enemy');
      } else {
        updateBattleLog(`${playerMonster.name} wins!`)
      }
    }, 2000);
  } else if (side === 'enemy') {
    updateBattleLog(enemyMonster.attack(playerMonster));
    updateHP();
    setTimeout(() => {
      if (playerMonster.currentHp > 0) {
        handleAttack('player');
      } else {
        updateBattleLog(`${enemyMonster.name} wins!`)
      }
    }, 2000);
  }
}

const firstMonsters = new MonsterGroup(monstersCROneFourth, '1-4', '1/4');
// const secondMonsters = new MonsterGroup(monstersCROneHalf, '1-2', '1/2');
// const thirdMonsters = new MonsterGroup(monstersCR1, '1');
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
