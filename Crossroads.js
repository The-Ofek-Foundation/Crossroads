var docWidth, docHeight;
var boardWidth, squareWidth;
var board, scores;
var globalTurn, playingTurn;
var numPlayers = 2;
var over;
var omniscientView = true;
var timeToThink = 1;
var aiTurn = 1;

var globalRoot;
var expansionConstant = 1.5;

var boardui = getElemId("board");
var brush = boardui.getContext("2d");
var brushX, brushY;
var hoveredMove;

function pageReady() {
	resizeBoard();
	newGame();
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
}

function onResize() {
	resizeBoard();
	drawBoard();
}

function newGame() {
	board = new Array(5);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(5);
		for (var a = 0; a < board[i].length; a++)
			board[i][a] = -1;
	}

	board[0][1] = board[4][3] = 4;

	scores = new Array(numPlayers);
	for (var i = 0; i < scores.length; i++)
		scores[i] = 0;

	hoveredMove = [[-1, -1], -1];
	globalTurn = playingTurn = 0;
	over = false;
	globalRoot = createMctsRoot();

	drawBoard();
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

	brush.strokeStyle = 'black';
	brush.lineWidth = squareWidth / 25;
	brush.stroke();
	brush.closePath();
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

function drawBoard(hover=[[-1, -1], -1]) {
	clearBoard();
	if (omniscientView)
		drawPieces();
	drawOuterBoard();
	drawInnerBoard();
	if (hover[1] !== -1)
		drawPiece(hover[0][0], hover[0][1], playingTurn);
	drawScores();
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
			for (var i = 0; turn !== -1 && i < 4; i++, turn = tboard[i][1]);
			return turn;
		case 1:
			for (var a = 0; turn !== -1 && a < 4; a++, turn = tboard[3][a]);
			return turn;
		case 2:
			for (var i = 4; turn !== -1 && i > 0; i--, turn = tboard[i][3]);
			return turn;
		case 3:
			for (var a = 4; turn !== -1 && a > 0; a--, turn = tboard[1][a]);
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
	var result = playMove(board, move, playingTurn);
	if (result === 4)
		playingTurn = 4;
	else {
		if (result !== -1)
			scores[result]++;
		if (scores[result] === 5) {
			over = true;
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
		}
		incrementTurn(move);
	}
	globalRoot = mctsGetNextRoot(move);
	if (!over && aiTurn !== 'none' &&
		(globalTurn === aiTurn || aiTurn === 'all'))
		setTimeout(playAiMove, 25);
	drawBoard();
}

boardui.addEventListener('mousedown', function (e) {
	if (e.which === 3)
		return;
	if (over) {
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
		// case 115: case 83: // s
		// 	showSettingsForm();
		// 	break;
		case 110: case 78: // n
			newGame();
			break;
	}
});

function mctsGetChildren(parent, tboard, turn) {
	if (parent.result !== 10)
		return [];

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
			return father.result = i === turn ? 1:-1;

	var dTurn = father.dTurn, result;

	while (1 == 1) {
		result = playMove(tboard, parseInt(Math.random() * 4), dTurn);
		if (result === 4)
			dTurn = 4;
		else {
			if (result !== -1) {
				tscores[result]++;
				if (tscores[result] === 5)
					return result === father.turn ? 1:-1;
			}
			turn = dTurn = (turn + 1) % numPlayers;
		}
	}
}

function mctsPlayNextMove(tboard, tscores, lastMove, dTurn) {
	var result = playMove(tboard, lastMove, dTurn);
	if (result !== -1)
		tscores[result]++;
}

class MctsNode {
	constructor(parent, turn, dTurn, lastMove) {
		this.parent = parent;
		this.turn = turn;
		this.dTurn = dTurn; // playingTurn
		this.lastMove = lastMove;
		this.hits = 0;
		this.misses = 0;
		this.totalTries = 0;
		this.hasChildren = false;
		this.children = [];
		this.result = 10; // never gonna happen
		this.countUnexplored = 0;
	}

	chooseChild(tboard, tscores) {
		if (this.hasChildren === false) {
			this.hasChildren = true;
			this.children = mctsGetChildren(this, tboard, this.turn);
			this.countUnexplored = this.children.length;
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

				// propResult(this, this.children[0]);

				for (i = 1; i < this.children.length; i++) {
					// propResult(this, this.children[i]);
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

	backPropogate(simulation) {
		if (simulation === 1)
			this.hits++;
		else if (simulation === -1)
			this.misses++;
		this.totalTries++;
		if (this.parent !== null)
			this.parent.backPropogate(simulation *
				(this.parent.turn === this.turn ? 1:-1));
	}
}

function mctsChildPotential(child, t, turn) {
	var w = child.misses - child.hits;
	if (child.turn === turn)
		w = -w;
	var n = child.totalTries;
	var c = expansionConstant;

	return w / n + c * Math.sqrt(Math.log(t) / n);
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
	var bestMove = getBestMoveMcts();
	playMoveGlobal(bestMove);
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

function mctsGetNextRoot(move) {
	if (!globalRoot || !globalRoot.children)
		return null;
	for (var i = 0; i < globalRoot.children.length; i++)
		if (globalRoot.children[i].lastMove === move)
			return globalRoot.children[i];
	return null;
}
