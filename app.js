// The monster manual contains the names of every monster I have images for, and their challenge rating formatted for filepath and for url. It is used to consctruct the api calls and filter the data down to only these monsters:
const monsterManual = [
  [
    [
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
    ],
    '1-4',
    '1/4',
  ],
  [
    [
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
    ],
    '1-2',
    '1/2',
  ],
  [
    [
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
    ],
    '1',
    '1'
  ],
  [
    [
      'ankheg',
      'ettercap',
      'gargoyle',
      'ghast',
      'gibbering-mouther',
      'mimic',
      'ogre',
      'rhinoceros',
      'white-dragon-wyrmling',
      'will-o-wisp'
    ],
    '2',
    '2'
  ],
  [
    [
      'basilisk',
      'bearded-devil',
      'giant-scorpion',
      'gold-dragon-wyrmling',
      'hell-hound',
      'manticore',
      'minotaur',
      'mummy',
      'nightmare',
      'owlbear'
    ],
    '3',
    '3'
  ],
  [
    [
      'black-pudding',
      'chuul',
      'couatl',
      'elephant',
      'ettin',
      'ghost',
      'lamia',
      'red-dragon-wyrmling',
      'succubusincubus',
      'wereboar'
    ],
    '4',
    '4'
  ],
  [
    [
      'barbed-devil',
      'bulette',
      'earth-elemental',
      'flesh-golem',
      'gorgon',
      'hill-giant',
      'otyugh',
      'triceratops',
      'troll',
      'wraith'
    ],
    '5',
    '5'
  ],
  [
    [
      'chimera',
      'drider',
      'invisible-stalker',
      'mammoth',
      'medusa',
      'vrock',
      'wyvern',
      'young-white-dragon'
    ],
    '6',
    '6'
  ],
  [
    [
      'giant-ape',
      'oni',
      'shield-guardian',
      'stone-giant',
      'young-black-dragon'
    ],
    '7',
    '7'
  ],
  [
    [
      'frost-giant',
      'hezrou',
      'hydra',
      'spirit-naga',
      'tyrannosaurus-rex'
    ],
    '8',
    '8'
  ],
  [
    [
      'clay-golem',
      'fire-giant',
      'glabrezu',
      'treant',
      'young-silver-dragon'
    ],
    '9',
    '9'
  ],
  [
    [
      'aboleth',
      'deva',
      'guardian-naga',
      'stone-golem',
      'young-red-dragon'
    ],
    '10',
    '10'
  ],
]

// modifiers is a conversion table between the ability score and ability modidifier in d&d. It is used to convert the monster's dexterity score (which is provided by the api data) to an initiative modifier (which is not):
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
  21: 5,
  22: 6,
  23: 6,
  24: 7,
  25: 7,
  26: 8,
  27: 8,
  28: 9,
  29: 9,
  30: 10,
}

// The MonsterGroup class calls the api upon construction, and uses the information from monsterManual to collect and filter the data of the monsters of one challenge rating. It has a generateCarousel method, which will feed the buildCarousel function the appropriate parameters for this challenge rating. The randomIndex method is used by the buildBattle function to pick a random enemy from within this group. The varous methods are used during combat.
class MonsterGroup {
  constructor(monstersArr, fileCR, urlCR) {
    this.monsterNames = monstersArr;
    this.monsterImgs = [];
    for (const monster of monstersArr) {
      const filepath = `monsters/CR_${fileCR}/${monster}.jpeg`;
      this.monsterImgs.push(filepath);
    }
    this.fileCR = fileCR;
    this.urlCR = urlCR;
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

// The Monster class is used to create the monster objects for the buildMonsterContainer function and the battle itself. Each monster has the appropriate name and image, as well as specific pieces of api data parsed to be useful during combat. The various methods are used to conduct the combat.
class Monster {
  constructor(img, data) {
    this.index = currentGroup.monsterImgs.indexOf(img);
    this.img = img;
    this.name = data.name;
    this.hp = data.hit_points;
    this.currentHp = this.hp;
    this.ac = data.armor_class;
    this.dex = data.dexterity;
    this.initiative = modifiers[`${this.dex}`];
    if (modifiers[this.dex] > 0) {
      this.initStr = `+${this.initiative}`
    } else {
      this.initStr = `${this.initiative}`
    }
    let attackIndex;
    if (data.actions[0].name.includes('Multiattack')) {
      attackIndex = 1;
    } else {
      attackIndex = 0;
    }
    this.attackName = data.actions[attackIndex].name;
    if (this.attackName.includes('(')) {
      this.attackName = this.attackName.split(' (')[0];
    }
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
    return this.rollD20() + this.initiative;
  }
  rollAttack() {
    return this.rollD20() + this.attackBonus;
  }
  rollDamage(crit) {
    if (this.damageDice) {
      let diceResult = 0;
      if (this.damageDice.includes('+')) {
        const diceSplit = this.damageDice.split('+');
        for (const die of diceSplit) {
          const [diceNumber, diceType] = die.split('d');
          for (let i=0; i<diceNumber; i++) {
            diceResult += Math.floor(Math.random() * diceType) + 1;
          }
        }
        if (crit) {
          for (const die of diceSplit) {
            const [diceNumber, diceType] = die.split('d');
            for (let i=0; i<diceNumber; i++) {
              diceResult += Math.floor(Math.random() * diceType) + 1;
            }
          }
        }
      } else {
        const [diceNumber, diceType] = this.damageDice.split('d');
        for (let i=0; i<diceNumber; i++) {
          diceResult += Math.floor(Math.random() * diceType) + 1;
        }
        if (crit) {
          for (let i=0; i<diceNumber; i++) {
            diceResult += Math.floor(Math.random() * diceType) + 1;
          }
        }
      }
      if (this.damageBonus) {
        const diceFinal = diceResult + this.damageBonus;
        return diceFinal;
      } else {
        return diceResult;
      }
    } else {
      return this.damageBonus;
    }
  }
  attack(target) {
    const attackRoll = this.rollAttack();
    let message;
    if (attackRoll - this.attackBonus === 20) {
      const damage = this.rollDamage('crit');
      target.currentHp -= damage;
      message = `${this.name} used ${this.attackName}. Critical Hit for ${damage} damage!!`;
    } else if (attackRoll >= target.ac) {
      const damage = this.rollDamage();
      target.currentHp -= damage;
      message = `${this.name} used ${this.attackName} and rolled a ${attackRoll}. It hits ${target.name} for ${damage} damage!`;
    } else {
      message = `${this.name} used ${this.attackName} and rolled a ${attackRoll}. It misses ${target.name}'s AC of ${target.ac}!`;
    }
    return message;
  }
};

// This set are the global variables needed to run the game.
let nextGroupIndex = 0;
let currentGroup;
let playerMonster;
let enemyMonster;

// This is the instructional message presented above the carousel at the game start and each time the player return to the selection screen.

const instructionMessage = `<p>You must choose your monster and it will battle against a random enemy.</p><p>If you win, you will proceed to choose a new monster of a higher challenge rating. There are <strong>${13 - (nextGroupIndex)}</strong> challenge ratings remaining.<p>Choose wisely - not all monsters are created equal!</p>`

// The buildNextGroup function uses the nextGroupIndex to consult the monsterManual and construct the correct MonsterGroup that will be needed next.
const buildNextGroup = () => {
  if (nextGroupIndex < monsterManual.length) {
    const nextGroup = monsterManual[nextGroupIndex]
    currentGroup = new MonsterGroup(nextGroup[0], nextGroup[1], nextGroup[2]);
  }
  nextGroupIndex++;
};

// The buildCarousel function is triggered by the MonsterGroup's generateCarousel method. It builds the carousel using jquery and the parameters.
const buildCarousel = (namesArr, imgArr, data) => {
  const $carousel = $('<div>').addClass('carousel');

  const $carouselHeader = $('<div>').addClass('carousel-header').text(`Challenge Rating: ${currentGroup.urlCR}`);
  const $buttonsContainer = $('<div>').attr('id', 'carousel-button-container');
  const $prevButton = $('<button>').attr('id', 'prev').text('<Previous');
  const $selectButton = $('<button>').attr('id', 'select').text('Select');
  const $nextButton = $('<button>').attr('id', 'next').text('Next>');

  $buttonsContainer.append($prevButton).append($selectButton).append($nextButton);
  $carousel.append($carouselHeader).append($buttonsContainer);
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

// The buildMonsterContainer function is used by the buildCarousel function. It exists to try and seperate some of the functionality out of that somewhat bloated function.
const buildMonsterContainer = (monster) => {
  const $monsterContainer = $('<div>').addClass('carousel-monster-container').addClass('hide');
  const $imgContainer = $('<div>').addClass('carousel-img-container');
  const $img = $('<img>').addClass('carousel-img').attr('src', monster.img);
  const $monsterStats = $('<div>').addClass('carousel-monster-stats');
  const $name = $('<h3>').html(`<strong>${monster.name}</strong>`);
  const $hp = $('<p>').html(`<strong>HP: </strong>${monster.hp}`);
  const $ac = $('<p>').html(`<strong>AC: </strong>${monster.ac}`);
  const $initiative = $('<p>').html(`<strong>Initiative: </strong>${monster.initStr}`);
  const $attack = $('<p>').html(monster.attackString);

  $imgContainer.append($img)
  $monsterStats.append($name).append($hp).append($ac).append($initiative).append($attack);
  $monsterContainer.append($imgContainer).append($monsterStats);
  return $monsterContainer;
};

// The buildBattle function is triggered by the select button, and receives the player's selected monster as its paramater. It first selects a random enemy monster, then uses jquery to construct the battle DOM layout. Fuinally, it triggers startBattle.
const buildBattle = (monster) => {
  playerMonster = monster;

  let randomIndex = currentGroup.randomIndex();
  while (randomIndex === monster.index) {
    randomIndex = currentGroup.randomIndex();
  }
  enemyMonster = new Monster(currentGroup.monsterImgs[randomIndex], currentGroup.monsterData[randomIndex]);

  const $battle = $('<div>').addClass('battle');
  const $playerMonster = $('<div>').addClass('monster').attr('id', 'player-monster');
  const $playerImg = $('<img>').addClass('img').attr('src', `${playerMonster.img}`);
  const $playerDescription = $('<div>').addClass('description');
  const $playerName = $('<h3>').html(`<strong>${playerMonster.name}</strong>`);
  const $playerHp = $('<p>').addClass('player-hp').html(`<strong>HP: </strong>${playerMonster.hp}`);
  const $playerAc = $('<p>').html(`<strong>AC: </strong>${playerMonster.ac}`);
  const $playerAttack = $('<p>').html(playerMonster.attackString);

  const $battleLog = $('<div>').attr('id', 'battle-log');

  const $enemyMonster = $('<div>').addClass('monster').attr('id', 'enemy-monster');
  const $enemyImg = $('<img>').addClass('img').attr('src', `${enemyMonster.img}`);
  const $enemyDescription = $('<div>').addClass('description');
  const $enemyName = $('<h3>').html(`<strong>${enemyMonster.name}</strong>`);
  const $enemyHp = $('<p>').addClass('enemy-hp').html(`<strong>HP: </strong>${enemyMonster.hp}`);
  const $enemyAc = $('<p>').html(`<strong>AC: </strong>${enemyMonster.ac}`);
  const $enemyAttack = $('<p>').html(enemyMonster.attackString);

  $playerDescription.append($playerName).append($playerHp).append($playerAc).append($playerAttack);
  $enemyDescription.append($enemyName).append($enemyHp).append($enemyAc).append($enemyAttack);
  $playerMonster.append($playerImg).append($playerDescription);
  $enemyMonster.append($enemyImg).append($enemyDescription);
  $battle.append($playerMonster).append($battleLog).append($enemyMonster);

  $('body').append($battle);

  startBattle();
};

// The startBattle function rolls initiative for each monster, and decides who will act first. It then waits two second, and calls the appropriate handleAttack.
const startBattle = () => {
  const playerInit = playerMonster.rollInitiative();
  updateBattleLog(`${playerMonster.name} rolled ${playerInit} initiative`);
  $('#battle-log').children().eq(0).addClass('player-log')
  const enemyInit = enemyMonster.rollInitiative();
  updateBattleLog(`${enemyMonster.name} rolled ${enemyInit} initiative`);
  $('#battle-log').children().eq(0).addClass('enemy-log')
  if (playerInit > enemyInit) {
    updateBattleLog(`${playerMonster.name} goes first!`);
    $('#battle-log').children().eq(0).addClass('player-log')
    setTimeout(() => {
      handleAttack('player');
    }, 2000);
  } else {
    updateBattleLog(`${enemyMonster.name} goes first!`);
    $('#battle-log').children().eq(0).addClass('enemy-log')
    setTimeout(() => {
      handleAttack('enemy');
    }, 2000);
  }
};

// The updateBattleLog function dims previous battle log messages, and adds a new one based on the provided argument text.
const updateBattleLog = text => {
  $('#battle-log').children().addClass('dim');
  const $text = $('<p>').text(text);
  $('#battle-log').prepend($text);
};


// The updateHP changes the displayed HP for each monster to the monster's current HP.
const updateHP = () => {
  $('.player-hp').html(`<strong>HP: </strong>${playerMonster.currentHp}`)
  $('.enemy-hp').html(`<strong>HP: </strong>${enemyMonster.currentHp}`)
};

// The handleAttack function calls the appropriate monster's attack method, waits two seconds, then either recurs for the other side (if the target survived) or calls the winRound or lose functions (if the target did not survive).
const handleAttack = side => {
  if (side === 'player') {
    updateBattleLog(playerMonster.attack(enemyMonster));
    $('#battle-log').children().eq(0).addClass('player-log')
    updateHP();
    setTimeout(() => {
      if (enemyMonster.currentHp > 0) {
        handleAttack('enemy');
      } else {
        updateBattleLog(`${playerMonster.name} wins!`);
        $('#battle-log').children().eq(0).addClass('player-log')
        setTimeout(() => {
          winRound();
        }, 2000);
      }
    }, 2000);
  } else if (side === 'enemy') {
    updateBattleLog(enemyMonster.attack(playerMonster));
    $('#battle-log').children().eq(0).addClass('enemy-log')
    updateHP();
    setTimeout(() => {
      if (playerMonster.currentHp > 0) {
        handleAttack('player');
      } else {
        updateBattleLog(`${enemyMonster.name} wins!`)
        $('#battle-log').children().eq(0).addClass('enemy-log')
        setTimeout(() => {
          lose();
        }, 2000);
      }
    }, 2000);
  }
};

// The winRound function is called by handleAttack when the player wins. It calls buildNextGroup for the next MonsterGroup, and provides the player with a victory message and a "Proceed" button to go to the next carousel. If the final level has been won, it displays a final victory message and the "Reset" button instead.
const winRound = () => {
  buildNextGroup();
  buildModal();
  $('.modal-textbox').addClass('modal-win');
  const $h1 = $('<h1>').text('Victory!');
  const $message = $('<p>').text(`The enemy ${enemyMonster.name} was vanquished. You may progress to the next challenge.`);
  const $button = $('<button>').addClass('modal-button');
  $('.modal-textbox').append($h1).append($message);

  if (nextGroupIndex > monsterManual.length) {
    nextGroupIndex = 0
    buildNextGroup();
    $message.text(`The enemy ${enemyMonster.name} was vanquished.`);
    const $finalMessage = $('<p>').text(`You have defeated every challenge. Bask in your victory, you earned it!`);
    $('.modal-textbox').append($finalMessage);
    $button.text('Restart');

    $button.on('click', restart);

  } else {
    $button.text('Proceed');

    $button.on('click', () => {
      if (currentGroup.monsterData) {
        $('.modal').remove();
        $('.battle').remove();
        $('<div>').addClass('rules-description').html(instructionMessage).insertAfter($('header'));
        currentGroup.generateCarousel();
      } else {
        console.log('too fast!');
      }
    })
  }

  $('.modal-textbox').append($button);
  $('.modal').removeClass('hide');
};

// The lose function is called by handleAttack if the enemy monster wins. It provides the player with a "Restart" button.
const lose = () => {
  nextGroupIndex = 0;
  buildNextGroup();
  buildModal();
  $('.modal-textbox').addClass('modal-lose');
  const $h1 = $('<h1>').text('You lose...');
  const $message = $('<p>').text(`Your ${playerMonster.name} was defeated. Try again and may the dice favor you next time.`);
  const $button = $('<button>').addClass('modal-button').text('Restart')

  $button.on('click', restart);

  $('.modal-textbox').append($h1).append($message).append($button);
  $('.modal').removeClass('hide');
};

// The buildModal function is used by both winRound and lose functions, to create the basic modal DOM structure. Both functions then modifer this base to their needs.
const buildModal = () => {
  const $modal = $('<div>').addClass('modal').addClass('hide');
  const $modalTextBox = $('<div>').addClass('modal-textbox');
  $modal.append($modalTextBox);
  $('body').append($modal);
};

// The reset function is used by the Restart button on the lose modal & the final victory modal.
const restart = () => {
  if (currentGroup.monsterData) {
    $('.modal').remove();
    $('.battle').remove();
    $('<div>').addClass('rules-description').html(instructionMessage).insertAfter($('header'));
    currentGroup.generateCarousel();
  } else {
    console.log('too fast!');
  }
};

// On page load, the first MonsterGroup is built, and the start button is given the funcitonality to transition to the first carousel.
$(() => {
  buildNextGroup();
  $('#start-button').on('click', event => {
    if (currentGroup.monsterData) {
      $('.rules-description').html(instructionMessage);
      $('#start-container').remove();
      currentGroup.generateCarousel();
    } else {
      console.log('too fast!');
    }
  })
});
