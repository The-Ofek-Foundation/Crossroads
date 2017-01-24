var docWidth, docHeight;
var boardWidth, squareWidth;
var board, scores;
var globalTurn, playingTurn;
var numPlayers;
var over, overOutput = true;
var drawStyle;
var timeToThink;
var aiTurn;
var prevMove;

var globalRoot;
var expansionConstant;
var numChoose1, numChoose2, numChoose3, lnc1, lnc2, lnc3, stopChoose;
var ponder, pondering;

var boardui = getElemId("board");
var brush = boardui.getContext("2d");
var analElem = getElemId('anal'), numTrialsElem = getElemId('num-trials');
var brushX, brushY;
var hoveredMove;

function pageReady() {
	resizeBoard();
	newGame();
	setTimeout(resizeGameSettingsTable, 0);
}

function resizeBoard() {
	docWidth = getElemWidth(contentWrapper);
	docHeight = getElemHeight(contentWrapper);
	wrapperTop = contentWrapper.offsetTop;

	boardWidth = docWidth < docHeight ? docWidth:docHeight;

	setElemWidth(boardui, boardWidth);
	setElemHeight(boardui, boardWidth);
	setElemStyle(boardui, 'left', (docWidth - boardWidth) / 2 + "px")
	boardui.setAttribute('width', boardWidth);
	boardui.setAttribute('height', boardWidth);
	wrapperLeft = boardui.offsetLeft;
	squareWidth = boardWidth / 7;
	resizeGameSettingsTable();
}

function onResize() {
	resizeBoard();
	drawBoard();
}

function newGame(updateSettings=true) {
	board = new Array(5);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(5);
		for (var a = 0; a < board[i].length; a++)
			board[i][a] = -1;
	}

	board[0][1] = board[4][3] = 4;

	if (updateSettings) {
		getSettings();
		populateSettingsForm(gameSettings.getSettings());
	}

	switch (numPlayers) {
		case 2:
			expansionConstant = 1.5;
			break;
		case 3:
			if (timeToThink <= 0.1)
				expansionConstant = 0.875; // ~0.0625
			else if (timeToThink <= 0.5)
				expansionConstant = 0.9375; // ~0.03125
			else expansionConstant = 1.38671875; // ~0.001953125
			break;
		case 4:
			if (timeToThink <= 0.1)
				expansionConstant = 0.7596869468688965; // ~2.384185791015625e-7
			else if (timeToThink <= 1)
				expansionConstant = 1.296875; // ~0.0078125
			else expansionConstant = 1.21875;
			break;
	}

	scores = new Array(numPlayers);
	for (var i = 0; i < scores.length; i++)
		scores[i] = 0;

	hoveredMove = [[-1, -1], -1];
	globalTurn = playingTurn = 0;
	over = false;
	globalRoot = createMctsRoot();
	prevMove = -1;

	if (aiTurn == globalTurn || aiTurn == 4)
		setTimeout(playAiMove, 25);
	drawBoard();

	numChoose1 = numChoose2 = numChoose3 = lnc1 = lnc2 = lnc3 = stopChoose = false;
	stopPonder();
	if (ponder)
		startPonder();
}

function clearBoard() {
	brush.clearRect(0, 0, boardWidth, boardWidth);
	brush.fillStyle = "white";
	brush.fillRect(0, 0, boardWidth, boardWidth);
}

function brushMove(x, y) {
	x *= squareWidth;
	y *= squareWidth;
	brushX = x;
	brushY = y;
	brush.moveTo(brushX, brushY);
}

function lineMove(dx, dy) {
	dx *= squareWidth;
	dy *= squareWidth;
	brushX += dx;
	brushY -= dy;
	brush.lineTo(brushX, brushY);
}

function drawOuterBoard() {

	brush.beginPath();

	// Top Side
	brushMove(1, 2);
	lineMove(1, 0);
	lineMove(0, 1);
	lineMove(1, 0);
	lineMove(0, -1);
	lineMove(1, 0);
	lineMove(0, 1);
	lineMove(0.5, -1/5);
	lineMove(0.5, 1/5);
	lineMove(0, -1);
	lineMove(1, 0);

	// Right Side
	lineMove(0, -1);
	lineMove(-1, 0);
	lineMove(0, -1);
	lineMove(1, 0);
	lineMove(-1/5, -0.5);
	lineMove(1/5, -0.5);
	lineMove(-1, 0);
	lineMove(0, -1);

	// Bottom Side
	lineMove(-1, 0);
	lineMove(0, 1);
	lineMove(-1, 0);
	lineMove(0, -1);
	lineMove(-0.5, 1/5);
	lineMove(-0.5, -1/5);
	lineMove(0, 1);
	lineMove(-1, 0);

	// Left Side
	lineMove(0, 1);
	lineMove(1, 0);
	lineMove(0, 1);
	lineMove(-1, 0);
	lineMove(1/5, 0.5);
	lineMove(-1/5, 0.5);
	lineMove(1, 0);

	// Center Square
	brushMove(3, 3);
	lineMove(1, 0);
	lineMove(0, -1);
	lineMove(-1, 0);
	lineMove(0, 1);
	lineMove(1, 0);

	brush.closePath();
	brush.strokeStyle = 'black';
	brush.lineWidth = squareWidth / 25;
	brush.stroke();
	if (drawStyle === 'peep') {
		brush.fillStyle = 'white';
		brush.fill();
	}
}

function drawInnerBoard() {

	brush.beginPath();

	// Top Side
	brushMove(4/3, 7/3);
	lineMove(1, 0);
	lineMove(0, 1);
	lineMove(1/3, 0);
	lineMove(0, -1);
	lineMove(5/3, 0);
	lineMove(0, 1);
	lineMove(1/6, -1/9);
	lineMove(1/6, 1/9);
	lineMove(0, -1);
	lineMove(1, 0);

	// Right Side
	lineMove(0, -1/3);
	lineMove(-1, 0);
	lineMove(0, -5/3);
	lineMove(1, 0);
	lineMove(-1/9, -1/6);
	lineMove(1/9, -1/6);
	lineMove(-1, 0);
	lineMove(0, -1);

	// Bottom Side
	lineMove(-1/3, 0);
	lineMove(0, 1);
	lineMove(-5/3, 0);
	lineMove(0, -1);
	lineMove(-1/6, 1/9);
	lineMove(-1/6, -1/9);
	lineMove(0, 1);
	lineMove(-1, 0);

	// Left Side
	lineMove(0, 1/3);
	lineMove(1, 0);
	lineMove(0, 5/3);
	lineMove(-1, 0);
	lineMove(1/9, 1/6);
	lineMove(-1/9, 1/6);
	lineMove(1, 0);

	// Center Square
	brushMove(2 + 2/3, 2 + 2/3);
	lineMove(5/3, 0);
	lineMove(0, -5/3);
	lineMove(-5/3, 0);
	lineMove(0, 5/3);
	lineMove(5/3, 0);

	brush.strokeStyle = 'black';
	brush.lineWidth = 1;
	brush.stroke();
	brush.closePath();
}

function drawPiece(x, y, turn) {
	brush.beginPath();
	brush.arc((x + 0.5) * squareWidth, (y + 0.5) * squareWidth,
		2 * squareWidth / 5, 0, 2 * Math.PI);

	switch (turn) {
		case 0:
			brush.fillStyle = 'red';
			break;
		case 1:
			brush.fillStyle = 'blue';
			break;
		case 2:
			brush.fillStyle = 'yellow';
			break;
		case 3:
			brush.fillStyle = 'lightgray';
			break;
		case 4:
			brush.fillStyle = 'green';
			break;
	}

	brush.lineWidth = 1;
	brush.strokeStyle = 'black';
	brush.stroke();
	brush.fill();
}

function drawPieces() {
	for (var i = 0; i < board.length; i++)
		for (var a = 0; a < board[i].length; a++)
			if (board[i][a] !== -1)
				drawPiece(i + 1, a + 1, board[i][a]);
}

function drawScores() {

	brush.strokeStyle = 'black';
	brush.lineWidth = 1;

	brush.fillStyle = 'red';
	for (var i = 0; i < scores[0]; i++)
		brush.fillRect(15/14 * squareWidth,
			3 * squareWidth + squareWidth / 13 * 2 * (i + 1),
			squareWidth * 4/5, squareWidth / 13);

	for (var i = 0; i < 5; i++)
		brush.strokeRect(15/14 * squareWidth,
			3 * squareWidth + squareWidth / 13 * 2 * (i + 1),
			squareWidth * 4/5, squareWidth / 13);

	brush.fillStyle = 'blue';
	for (var i = 0; i < scores[1]; i++)
		brush.fillRect(boardWidth - 15/14 * squareWidth,
			3 * squareWidth + squareWidth / 13 * 2 * (5 - i),
			-squareWidth * 4/5, squareWidth / 13);

	for (var i = 0; i < 5; i++)
		brush.strokeRect(boardWidth - 15/14 * squareWidth,
			3 * squareWidth + squareWidth / 13 * 2 * (i + 1),
			-squareWidth * 4/5, squareWidth / 13);

	if (numPlayers < 3)
		return;

	brush.fillStyle = 'yellow';
	for (var i = 0; i < scores[2]; i++)
		brush.fillRect(3 * squareWidth + squareWidth / 13 * 2 * (5 - i),
			15/14 * squareWidth, squareWidth / 13, squareWidth * 4/5);

	for (var i = 0; i < 5; i++)
		brush.strokeRect(3 * squareWidth + squareWidth / 13 * 2 * (i + 1),
			15/14 * squareWidth, squareWidth / 13, squareWidth * 4/5);

	if (numPlayers < 4)
		return;

	brush.fillStyle = 'lightgray';
	for (var i = 0; i < scores[3]; i++)
		brush.fillRect(3 * squareWidth + squareWidth / 13 * 2 * (i + 1),
			boardWidth - 15/14 * squareWidth, squareWidth / 13,
			-squareWidth * 4/5);

	for (var i = 0; i < 5; i++)
		brush.strokeRect(3 * squareWidth + squareWidth / 13 * 2 * (i + 1),
			boardWidth - 15/14 * squareWidth, squareWidth / 13,
			-squareWidth * 4/5);
}

function drawHighlight(move) {
	brush.beginPath();
	switch (move) {
		case 0:
			brushMove(9/10, 3);
			lineMove(1/10, 0);
			lineMove(1/5, 0.5);
			lineMove(-1/5, 0.5);
			lineMove(-1/10, 0);
			lineMove(0, -1);
			break;
		case 1:
			brushMove(4, 9/10);
			lineMove(0, -1/10);
			lineMove(0.5, -1/5);
			lineMove(0.5, 1/5);
			lineMove(0, 1/10);
			lineMove(-1, 0);
			break;
		case 2:
			brushMove(61/10, 4);
			lineMove(-1/10, 0);
			lineMove(-1/5, -0.5);
			lineMove(1/5, -0.5);
			lineMove(1/10, 0);
			lineMove(0, -1);
			break;
		case 3:
			brushMove(2, 61/10);
			lineMove(0, 1/10);
			lineMove(0.5, 1/5);
			lineMove(0.5, -1/5);
			lineMove(0, -1/10);
			lineMove(-1, 0);
			break;
	}
	brush.closePath();
	brush.fillStyle = 'yellow';
	brush.fill();
}

function drawBoard(hover=[[-1, -1], -1]) {
	clearBoard();
	if (prevMove !== -1)
		drawHighlight(prevMove);
	if (drawStyle === 'omniscient' || drawStyle === 'peep')
		drawPieces();
	drawOuterBoard();
	drawInnerBoard();
	if (hover[1] !== -1)
		drawPiece(hover[0][0], hover[0][1], playingTurn);
	drawScores();

	if (aiTurn !== -1)
		updateAnalysis();
}

function playMove(tboard, tmove, turn) {
	var tempturn;
	switch (tmove) {
		case 0:
			for (var i = 0; turn !== -1 && i < 4; i++, turn = tempturn) {
				tempturn = tboard[i][1];
				tboard[i][1] = turn;
			}
			return turn;
		case 1:
			for (var a = 0; turn !== -1 && a < 4; a++, turn = tempturn) {
				tempturn = tboard[3][a];
				tboard[3][a] = turn;
			}
			return turn;
		case 2:
			for (var i = 4; turn !== -1 && i > 0; i--, turn = tempturn) {
				tempturn = tboard[i][3];
				tboard[i][3] = turn;
			}
			return turn;
		case 3:
			for (var a = 4; turn !== -1 && a > 0; a--, turn = tempturn) {
				tempturn = tboard[1][a];
				tboard[1][a] = turn;
			}
			return turn;
	}
}

function getResult(tboard, tmove) {
	var turn = -2;
	switch (tmove) {
		case 0:
			for (var i = 0; turn !== -1 && i < 3; i++, turn = tboard[i][1]);
			return turn;
		case 1:
			for (var a = 0; turn !== -1 && a < 3; a++, turn = tboard[3][a]);
			return turn;
		case 2:
			for (var i = 4; turn !== -1 && i > 1; i--, turn = tboard[i][3]);
			return turn;
		case 3:
			for (var a = 4; turn !== -1 && a > 1; a--, turn = tboard[1][a]);
			return turn;
	}
}

function incrementTurn() {
	globalTurn = playingTurn = (globalTurn + 1) % numPlayers;
}

function getMove(mouseX, mouseY) {
	var tmove =
		[parseInt(mouseX / squareWidth), parseInt(mouseY / squareWidth)];
	if (tmove[0] === 0 && tmove[1] === 2)
		return [tmove, 0];
	if (tmove[0] === 4 && tmove[1] === 0)
		return [tmove, 1];
	if (tmove[0] === 6 && tmove[1] === 4)
		return [tmove, 2];
	if (tmove[0] === 2 && tmove[1] === 6)
		return [tmove, 3];
	return [[-1, -1], -1];
}

function playMoveGlobal(move) {
	hoveredMove = [[-1, -1], -1];
	var tempDrawStyle = drawStyle;
	var result = playMove(board, move, playingTurn);
	if (result === 4)
		playingTurn = 4;
	else {
		if (result !== -1)
			scores[result]++;
		if (scores[result] === 5) {
			over = result;
			stopPonder();
			if (overOutput)
				setTimeout(function () {
					switch (result) {
						case 0:
							alert("Red Wins!");
							break;
						case 1:
							alert("Blue Wins!");
							break;
						case 2:
							alert("Yellow Wins!");
							break;
						case 3:
							alert("Light Gray Wins!");
							break;
					}
				}, 100);
			drawStyle = 'omniscient';
		}
		incrementTurn(move);
	}
	numChoose1 = numChoose2 = numChoose3 = stopChoose = false;
	if (aiTurn !== -1) {
		globalRoot = mctsGetNextRoot(move);
		if (over === false &&
			(globalTurn == aiTurn || aiTurn == 4))
			setTimeout(playAiMove, 25);
	}
	prevMove = move;
	drawBoard();
	if (over !== false)
		drawStyle = tempDrawStyle;
}

boardui.addEventListener('mousedown', function (e) {
	if (e.which === 3)
		return;
	if (over !== false) {
		alert("The game is already over!");
		return;
	}
	var move = getMove(e.pageX - wrapperLeft, e.pageY - wrapperTop);
	if (move[1] === -1)
		return;

	playMoveGlobal(move[1]);

	e.preventDefault();
});

boardui.addEventListener('mousemove', function (e) {
	var move = getMove(e.pageX - wrapperLeft, e.pageY - wrapperTop);
	if (move[1] !== hoveredMove[1]) {
		hoveredMove = move;
		drawBoard(move);
	}
});

document.addEventListener('keypress', function (event) {
	switch (event.which) {
		case 115: case 83: // s
			showSettingsForm();
			break;
		case 110: case 78: // n
			newGame();
			break;
	}
});

function mctsGetChildren(parent, tboard, turn) {
	var children = new Array(4),
		nextTurn = (turn + 1) % numPlayers;

	for (var i = 0; i < children.length; i++)
		if (getResult(tboard, i) === 4)
			children[i] = new MctsNode(parent, turn, 4, i);
		else children[i] = new MctsNode(parent, nextTurn, nextTurn, i);

	return children; // if ransom is paid
}

function createMctsRoot() {
	return new MctsNode(null, globalTurn, playingTurn, -1);
}

function mctsSimulate(father, tboard, tscores) {
	if (father.result !== 10)
		return father.result;


	var turn = father.turn;

	for (var i = 0; i < tscores.length; i++)
		if (tscores[i] === 5)
			return father.result = i;

	var dTurn = father.dTurn, result;

	while (1 == 1) {
		result = playMove(tboard, parseInt(Math.random() * 4), dTurn);
		if (result === 4)
			dTurn = 4;
		else {
			if (result !== -1) {
				tscores[result]++;
				if (tscores[result] === 5)
					return result;
			}
			turn = dTurn = (turn + 1) % numPlayers;
		}
	}
}

function mctsPlayNextMove(tboard, tscores, lastMove, dTurn) {
	var result = playMove(tboard, lastMove, dTurn);
	if (result !== -1 && result !== 4)
		tscores[result]++;
}

class MctsNode {
	constructor(parent, turn, dTurn, lastMove) {
		this.parent = parent;
		this.turn = turn;
		this.dTurn = dTurn; // playingTurn
		this.lastMove = lastMove;
		this.hits = [0, 0, 0, 0];
		this.totalTries = 0;
		this.children = [];
		this.result = 10; // never gonna happen
		this.countUnexplored = -1;
	}

	chooseChild(tboard, tscores) {
		for (var i = 0; i < tscores.length; i++)
			if (tscores[i] === 5) {
				this.result = i;
				break;
			}
		if (this.result === 10 && this.countUnexplored === -1) {
			this.hasChildren = true;
			this.children = mctsGetChildren(this, tboard, this.turn);
			this.countUnexplored = 4;
		}
		if (this.result !== 10) // leaf node
			this.backPropogate(this.result);
		else {
			var unexplored = this.countUnexplored;
			var i;

			if (unexplored > 0) {
				this.countUnexplored--;
				var ran = Math.floor(Math.random() * unexplored);
				for (i = 0; i < this.children.length; i++)
					if (this.children[i].totalTries === 0) {
						if (ran === 0) {
							mctsPlayNextMove(tboard, tscores,
								this.children[i].lastMove, this.dTurn);
							this.children[i].backPropogate(mctsSimulate(
								this.children[i], tboard, tscores));
							return;
						}
						ran--;
					}
			} else {
				var bestChild = this.children[0],
					bestPotential =
						mctsChildPotential(this.children[0],
							this.totalTries, this.turn), potential;

				for (i = 1; i < this.children.length; i++) {
					potential = mctsChildPotential(this.children[i], this.totalTries, this.turn);
					if (potential > bestPotential) {
						bestPotential = potential;
						bestChild = this.children[i];
					}
				}
				mctsPlayNextMove(tboard, tscores,
					bestChild.lastMove, this.dTurn);
				bestChild.chooseChild(tboard, tscores);
			}
		}
	}

	backPropogate(result) {
		this.hits[result]++;
		this.totalTries++;
		if (this.parent !== null)
			this.parent.backPropogate(result);
	}
}

function mctsChildPotential(child, t, turn) {
	var n = child.totalTries;

	return child.hits[turn] / n + expansionConstant *
		Math.sqrt(Math.log(t) / n);
}

function simpleBoardCopy(board) {
	var simpleCopy = new Array(5);
	for (var i = 0; i < 5; i++) {
		simpleCopy[i] = new Array(5);
		for (var a = 0; a < 5; a++)
			simpleCopy[i][a] = board[i][a];
	}
	return simpleCopy;
}

function simpleScoresCopy(scores) {
	var simpleCopy = new Array(numPlayers);
	for (var i = 0; i < numPlayers; i++)
		simpleCopy[i] = scores[i];
	return simpleCopy;
}

function playAiMove() {
	runMcts(timeToThink);
	playMoveGlobal(getBestMoveMcts());
}

function runMcts(time) {
	if (!globalRoot)
		globalRoot = createMctsRoot();
	var startTime = new Date().getTime();
	while ((new Date().getTime() - startTime) / 1E3 < time)
		for (var i = 0; i < 2000; i++)
			globalRoot.chooseChild(simpleBoardCopy(board),
				simpleScoresCopy(scores));
	while (globalRoot.totalTries < 25)
		globalRoot.chooseChild(simpleBoardCopy(board),
			simpleScoresCopy(scores));
	console.log("Total Simulations: " + globalRoot.totalTries);
}

function getBestMoveMcts() {
	var bestChild = mostTriedChild(globalRoot, null);
	if (!bestChild)
		return -1;
	return bestChild.lastMove;
}

function leastTriedChild(root) {
	var leastTrials = root.totalTries + 1, child = null;
	if (!root.children)
		return null;
	for (var i = 0; i < root.children.length; i++)
		if (root.children[i].totalTries < leastTrials) {
			leastTrials = root.children[i].totalTries;
			child = root.children[i];
		}
	return child;
}

function mostTriedChild(root, exclude=null) {
	var mostTrials = -1, child = null;
	if (!root.children)
		return null;
	for (var i = 0; i < root.children.length; i++)
		if (root.children[i] !== exclude && root.children[i].totalTries > mostTrials) {
			mostTrials = root.children[i].totalTries;
			child = root.children[i];
		}
	return child;
}

function mctsGetNextRoot(move, root=globalRoot) {
	if (!root || !root.children)
		return null;
	for (var i = 0; i < root.children.length; i++)
		if (root.children[i].lastMove === move)
			return root.children[i];
	return null;
}

function resultCertainty(root) {
	if (root.hits[globalTurn] > root.totalTries / 2)
		return root.hits[globalTurn] / root.totalTries;
	return 1 - root.hits[globalTurn] / root.totalTries;
}

function updateAnalysis() {
	if (!globalRoot || globalRoot.totalTries === 0)
		return;
	var range = getMctsDepthRange();
	analElem.innerHTML = "Analysis: Depth-" + range[1] + " Result-" +
		range[2] + " Certainty-" + (globalRoot && globalRoot.totalTries > 0 ?
		(resultCertainty(globalRoot) * 100).toFixed(0):"0") + "%";
	numTrialsElem.innerHTML = "Trials: " + numberWithCommas(globalRoot.totalTries);
}

function getMctsDepthRange() {
	var root, range = new Array(3);
	for (range[0] = -1, root = globalRoot; root && root.children; range[0]++, root = leastTriedChild(root));
	for (range[1] = -1, root = globalRoot; root && root.children; range[1]++, root = mostTriedChild(root))
		if (root.result !== 10)
			range[2] = root.result;
	return range;
}

function speedTest(numSimulations) {
	globalRoot = createMctsRoot();
	var startTime = new Date().getTime();
	for (var i = 0; i < numSimulations; i++)
		globalRoot.chooseChild(simpleBoardCopy(board),
				simpleScoresCopy(scores));
	var elapsedTime = (new Date().getTime() - startTime) / 1E3;
	console.log(numberWithCommas(Math.round(numSimulations / elapsedTime)) + ' simulations per second.');
}

var numPonders = 0;
function startPonder() {
	pondering = setInterval(function() {
		if (!globalRoot)
			globalRoot = createMCTSRoot();
		var startTime = new Date().getTime();
		var tempCount = 0;
		while ((new Date().getTime() - startTime) < 30 && !stopChoose) {
			globalRoot.chooseChild(simpleBoardCopy(board),
				simpleScoresCopy(scores));
			tempCount++;
		}
		if (numChoose3 && (tempCount < numChoose3 / 10 || tempCount < numChoose2 / 10 || tempCount < numChoose1 / 10))
			stopChoose = true;
		else {
			numChoose3 = numChoose2;
			numChoose2 = numChoose1;
			numChoose1 = tempCount;
		}
		numPonders++;
		updateAnalysis();
	}, 1);
}

function stopPonder() {
	clearInterval(pondering);
}

getElemId('done').addEventListener('click', function (event) {
	var settings = getNewSettings();
	gameSettings.setSettings(settings);
	hideSettingsForm();
	newGame();
});

getElemId('cancel').addEventListener('click', function (event) {
	hideSettingsForm();
	populateSettingsForm(gameSettings.getSettings());
});

if (getElemId('save'))
	getElemId('save').addEventListener('click', function (event) {
		var settings = getNewSettings();
		gameSettings.setSettings(settings);
		gameSettings.saveSettings(settings);
		hideSettingsForm();
		newGame();
	});

function getNewSettings() {
	return {
		'ponder': getInputValue('ponder'),
		'aiTurn': getInputValue('ai-turn'),
		'numPlayers': getInputValue('num-players'),
		'timeToThink': getInputValue('time-to-think'),
		'drawStyle': getInputValue('draw-style'),
	}
}

function populateSettingsForm(settings) {
	setInputValue('ponder', ponder);
	setInputValue('ai-turn', aiTurn);
	setInputValue('num-players', numPlayers);
	setInputValue('time-to-think', timeToThink);
	setInputValue('draw-style', drawStyle);
}

function getSettings() {
	aiTurn = gameSettings.getOrSet('aiTurn', '1');
	ponder = gameSettings.getOrSet('ponder', false);
	numPlayers = gameSettings.getOrSet('numPlayers', 2);
	timeToThink = gameSettings.getOrSet('timeToThink', 2);
	drawStyle = gameSettings.getOrSet('drawStyle', 'peep');
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function testExpansionConstants(c1, c2, nP, numTrials, timeToThink, output) {
	var v1 = v2 = 0;
	overOutput = false;
	ponder = false;
	aiTurn = -1;
	numPlayers = nP;

	var gRoots = new Array(numPlayers);
	for (var I = 0; I < numTrials; I++) {
		newGame(false);
		console.log("move counter");

		for (r of gRoots)
			r = createMctsRoot();

		while (over === false) {
			var startTime = new Date().getTime();
			var r = gRoots[globalTurn];
			expansionConstant = globalTurn === (I % numPlayers) ? c1:c2;
			if (!r)
				r = createMctsRoot();
			while ((new Date().getTime() - startTime) / 1E3 < timeToThink)
				for (var i = 0; i < 100; i++)
					r.chooseChild(simpleBoardCopy(board),
						simpleScoresCopy(scores));
			var bestChild = mostTriedChild(r, null);
			var bestMove = bestChild.lastMove;
			playMoveGlobal(bestMove);

			for (root of gRoots) {
				root = mctsGetNextRoot(bestMove, root);
				if (root === null)
					root = createMctsRoot();
			}

		}
		if (over === (I % numPlayers)) {
			v1++;
			if (output)
				console.log("c1 wins");
		} else {
			v2++;
			if (output)
				console.log("c2 wins");
		}
		for (r of gRoots)
			r = null;
	}
	console.log(c1 + ": " + v1 + " and " + c2 + ": " + v2);
	overOutput = true;
	return [v1, v2 / (numPlayers - 1)];
}

// findBestExpansionConstant(0.875, 3, 0.1, 0.0625, 100, true);
// findBestExpansionConstant(1.5, 3, 1, 0.5, 100, false);

function findBestExpansionConstant(seed, numPlayers, timeToThink, bound, numSimulations, prollyGreater=true) {
	console.log("!!!");
	console.log("Best constant: ", seed);
	console.log("Bound: ", bound);
	console.log("!!!");

	if (seed < 0)
		return;

	var delta1, delta2;

	var round1 = testExpansionConstants(seed, prollyGreater ? (seed + bound):(seed - bound), numPlayers, numSimulations, timeToThink, false);
	if (round1[1] > round1[0])
		findBestExpansionConstant(prollyGreater ? (seed + bound):(seed - bound), numPlayers, timeToThink, bound / 2, numSimulations, true);
	else {
		delta1 = round1[0] - round1[1];
		var round2 = testExpansionConstants(seed, prollyGreater ? (seed - bound):(seed + bound), numPlayers, numSimulations, timeToThink, false);
		if (round2[1] > round2[0])
			findBestExpansionConstant(prollyGreater ? (seed - bound):(seed + bound), numPlayers, timeToThink, bound / 2, numSimulations, true);
		else {
			delta2 = round2[0] - round2[1];
			findBestExpansionConstant(seed, numPlayers, timeToThink, bound / 2, numSimulations, delta1 < delta2 === prollyGreater);
		}
	}
}
