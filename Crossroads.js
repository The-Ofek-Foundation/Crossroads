var docWidth, docHeight;
var boardWidth, squareWidth;
var board, scores;
var globalTurn, playingTurn;
var numPlayers = 4;
var over;
var omniscientView = true;

var boardui = getElemId("board");
var brush = boardui.getContext("2d");
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

	drawBoard();
}

function clearBoard() {
	brush.clearRect(0, 0, boardWidth, boardWidth);
	brush.fillStyle = "white";
	brush.fillRect(0, 0, boardWidth, boardWidth);
}

var brushX, brushY;
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
			3 * squareWidth + squareWidth / 13 * 2 * (i + 1),
			-squareWidth * 4/5, squareWidth / 13);

	for (var i = 0; i < 5; i++)
		brush.strokeRect(boardWidth - 15/14 * squareWidth,
			3 * squareWidth + squareWidth / 13 * 2 * (i + 1),
			-squareWidth * 4/5, squareWidth / 13);

	if (numPlayers < 3)
		return;

	brush.fillStyle = 'yellow';
	for (var i = 0; i < scores[2]; i++)
		brush.fillRect(3 * squareWidth + squareWidth / 13 * 2 * (i + 1),
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
	switch (tmove[1]) {
		case 0:
			for (var i = 0; turn !== -1 && i < 4; i++, turn = tempturn) {
				tempturn = board[i][1];
				board[i][1] = turn;
			}
			return turn;
		case 1:
			for (var a = 0; turn !== -1 && a < 4; a++, turn = tempturn) {
				tempturn = board[3][a];
				board[3][a] = turn;
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

function incrementTurn(move) {
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

	e.preventDefault();
	drawBoard();
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
