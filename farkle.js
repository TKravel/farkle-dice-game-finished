const diceArr = [];

// game and player data
const gameData = {
	currentTurn: 'Player1',
	clicksSinceRoll: 0,
	finalRound: {
		round: 0,
		status: null,
	},
	playerData: [
		{
			name: 'Player1',
			score: 0,
		},
		{
			name: 'Player2',
			score: 0,
		},
	],
};

// dom element variables
const dice = document.getElementsByTagName('img');
const turnScore = document.getElementById('turn-score');
const startButton = document.getElementById('start-button');
const gameControls = document.getElementById('button-container');
const rollButton = document.getElementById('roll-button');
const bankButton = document.getElementById('bank-button');

// Todo
// create initial game and player states to reset game

const initializeDice = () => {
	for (let i = 0; i < 6; i++) {
		diceArr[i] = {};
		diceArr[i].id = `die${i + 1}`;
		diceArr[i].value = i + 1;
		diceArr[i].clicked = 0;
		diceArr[i].lockSelection = 0;
	}
};

const resetDice = () => {
	// randomize dice clear css
	for (let i = 0; i < 6; i++) {
		diceArr[i] = {};
		diceArr[i].id = `die${i + 1}`;
		diceArr[i].value = Math.floor(Math.random() * 6 + 1);
		diceArr[i].clicked = 0;
		diceArr[i].lockSelection = 0;
		// remove css from selected dice
		if (dice[i].classList.contains('transparent')) {
			dice[i].classList.remove('transparent');
		}
	}

	// reset dice if rolled farkle
	if (isFarkle(sortDice(dice))) {
		while (isFarkle(sortDice(dice))) {
			resetDice();
		}
	}

	shakeDice();
	setTimeout(() => {
		shakeDice();
		updateDiceImg();
		gameData.clicksSinceRoll = 0;
	}, 500);
};

// lock selections, call after dice roll
const lockDiceSelections = () => {
	for (const die of diceArr) {
		console.log(die);
		if (die.clicked === 1) {
			die.lockSelection = 1;
		}
	}
	console.log(diceArr);
};

const shakeDice = () => {
	for (const die of dice) {
		if (!die.classList.contains('transparent')) {
			die.classList.toggle('shake-dice');
		}
	}
};

const resetTurnScore = () => {
	turnScore.innerText = '0';
};

const startGame = () => {
	startButton.classList.toggle('hidden');
	gameControls.classList.toggle('hidden');
	document
		.getElementsByClassName('player-indicator')[0]
		.classList.add('active-player');
	resetDice();
	resetTurnScore();
};

/*Rolling dice values*/
const rollDice = () => {
	for (const die of diceArr) {
		if (die.clicked === 0) {
			die.value = Math.floor(Math.random() * 6 + 1);
		}
	}
	if (!rollButton.getAttribute('disabled')) {
		toggleButton(rollButton);
	}
	shakeDice();
	setTimeout(() => {
		shakeDice();
		updateDiceImg();
	}, 500);

	// check unselected dice for farkle after animation stops
	setTimeout(() => {
		if (
			isFarkle(
				sortDice(document.querySelectorAll('img:not(.transparent)'))
			)
		) {
			handleFarkle();
		} else {
			gameData.clicksSinceRoll = 0;
			lockDiceSelections();
		}
	}, 1000);
};

/*Updating images of dice given values of rollDice*/
const updateDiceImg = () => {
	for (const die of diceArr) {
		document
			.getElementById(die.id)
			.setAttribute('src', `images/${die.value}.png`);
	}
};

const diceClick = (img) => {
	const selectedDie = img.getAttribute('data-number');
	const clickedDice = document.getElementsByClassName('transparent');
	const rollButtonDisabled = rollButton.getAttribute('disabled');

	if (diceArr[selectedDie].lockSelection === 1) {
		return;
	}
	// handle clicking / unclick dice and roll button disabled status
	if (img.classList.contains('transparent')) {
		diceArr[selectedDie].clicked = 0;
		gameData.clicksSinceRoll -= 1;
		img.classList.toggle('transparent');
		if (gameData.clicksSinceRoll === 0 && rollButtonDisabled === null) {
			toggleButton(rollButton);
		} else if (
			gameData.clicksSinceRoll > 0 &&
			rollButtonDisabled === 'true'
		) {
			toggleButton(rollButton);
		}
	} else {
		img.classList.add('transparent');
		diceArr[selectedDie].clicked = 1;
		gameData.clicksSinceRoll += 1;
		if (gameData.clicksSinceRoll === 1) {
			toggleButton(rollButton);
		} else if (clickedDice.length === 6 && rollButtonDisabled === null) {
			toggleButton(rollButton);
		}
	}
	// calculate and display turn score
	displayCurrentRollTotal(calculateScore(sortDice(clickedDice)));
};

// toggle disabled status
const toggleButton = (button) => {
	const disabledStatus = button.getAttribute('disabled');
	disabledStatus == 'true'
		? button.removeAttribute('disabled')
		: button.setAttribute('disabled', 'true');
};

// sort dice by value for score calculation and farkle testing
const sortDice = (dice) => {
	const diceSortedByValues = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 0,
	};
	// sort dice by value in diceSortedByValue array
	for (let die of dice) {
		const dieValue = diceArr[die.dataset.number].value;
		diceSortedByValues[dieValue] = diceSortedByValues[dieValue] + 1;
	}
	return diceSortedByValues;
};

// calculate score of selected dice
const calculateScore = (clickedDice) => {
	let score = 0;
	// loop over value totals and create score
	for (const diceNumber in clickedDice) {
		if (clickedDice[diceNumber] >= 3) {
			if (diceNumber === '1') {
				score += (clickedDice[diceNumber] % 3) * 100;
				score += 1000;
				clickedDice[diceNumber] = 0;
			} else if (diceNumber === '5') {
				score += (clickedDice[diceNumber] % 3) * 50;
				score += 500;
				clickedDice[diceNumber] = 0;
			} else {
				score += clickedDice[diceNumber] * 100;
			}
		}
		if (diceNumber === '1') {
			score += clickedDice[diceNumber] * 100;
		}
		if (diceNumber === '5') {
			score += clickedDice[diceNumber] * 50;
		}
	}
	if (score > 0 && bankButton.getAttribute('disabled') === 'true') {
		toggleButton(bankButton);
	} else if (score === 0 && bankButton.getAttribute('disabled') === null) {
		toggleButton(bankButton);
	}
	return score;
};

const bankScore = () => {
	// add turn score to players total
	for (const player of gameData.playerData) {
		if (player.name === gameData.currentTurn) {
			player.score += parseInt(turnScore.innerText);
			document.getElementById(
				`${player.name.toLowerCase()}-score`
			).innerText = player.score;
		}
	}
	// check for a total for 10k to start last round

	// reset buttons / turn score / dice / and change player
	if (rollButton.getAttribute('disabled') === null) {
		toggleButton(rollButton);
	}
	toggleButton(bankButton);
	resetDice();
	resetTurnScore();
	changePlayer();
};

// display current players roll score from selected dice
const displayCurrentRollTotal = (total) => {
	turnScore.innerText = total;
};

const changePlayer = () => {
	const [player1, player2] =
		document.getElementsByClassName('player-indicator');
	if (gameData.currentTurn === 'Player1') {
		gameData.currentTurn = 'Player2';
		player1.classList.remove('active-player');
		player2.classList.add('active-player');
	} else {
		gameData.currentTurn = 'Player1';
		player1.classList.add('active-player');
		player2.classList.remove('active-player');
	}
};

// check for farkle
const isFarkle = (sortedDiceValues) => {
	let farkleStatus = true;
	// assumes true, returns as soon as false
	for (const diceValue in sortedDiceValues) {
		if (diceValue === '1' && sortedDiceValues[diceValue] > 0) {
			farkleStatus = false;
			return;
		} else if (diceValue === '5' && sortedDiceValues[diceValue] > 0) {
			farkleStatus = false;
			return;
		} else if (sortedDiceValues[diceValue] >= 3) {
			farkleStatus = false;
			return;
		}
	}
	return farkleStatus;
};

const handleFarkle = () => {
	// display farkle alert
	turnScore.innerText = 'FARKLE!';
	turnScore.classList.toggle('alert-farkle');
	// disable buttons
	toggleButton(bankButton);
	// remove alert / reset and change player
	setTimeout(() => {
		turnScore.classList.toggle('alert-farkle');
		resetTurnScore();
		changePlayer();
		resetDice();
	}, 3000);
};
