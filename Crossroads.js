var docWidth, docHeight;
var boardWidth, squareWidth;
var board;
var globalTurn;
var numPlayers = 2;

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
			board[i][a] = 0;
	}
	hoveredMove = [[-1, -1], -1];
	globalTurn = 0;

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

	// Center Square
	brushMove(3, 3);
	lineMove(1, 0);
	lineMove(0, -1);
	lineMove(-1, 0);
	lineMove(0, 1);

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

	// Center Square
	brushMove(2 + 2/3, 2 + 2/3);
	lineMove(5/3, 0);
	lineMove(0, -5/3);
	lineMove(-5/3, 0);
	lineMove(0, 5/3);

	brush.strokeStyle = 'black';
	brush.lineWidth = 1;
	brush.stroke();
	brush.closePath();
}

function drawHover(hover) {
	brush.beginPath();
	brush.arc((hover[0][0] + 0.5) * squareWidth,
		(hover[0][1] + 0.5) * squareWidth, 2 * squareWidth / 5,
		0, 2 * Math.PI);

	switch (globalTurn) {
		case 0:
			brush.fillStyle = 'red';
			break;
		case 1:
			brush.fillStyle = 'green';
			break;
		case 2:
			brush.fillStyle = 'blue';
			break;
		case 3:
			brush.fillStyle = 'yellow';
			break;
	}

	brush.lineWidth = 1;
	brush.strokeStyle = 'black';
	brush.stroke();
	brush.fill();
}

function drawBoard(hover=[[-1, -1], -1]) {
	clearBoard();
	drawOuterBoard();
	drawInnerBoard();
	if (hover[1] !== -1)
		drawHover(hover);
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

boardui.addEventListener('mousemove', function (e) {
	var move = getMove(e.pageX - wrapperLeft, e.pageY - wrapperTop);
	if (move[1] !== hoveredMove[1]) {
		hoveredMove = move;
		drawBoard(move);
	}
});
