 const gridModel = [];
 const gridSize = 10;
 const colors = ['red', 'green', 'blue', 'yellow', 'brown'];
 const activeBall = {};
 const populatedCells = [];
 var score = 0;
 var gameOver = false;

 function Point(x, y) {
 	this.x = x;
 	this.y = y;

 	this.isValid = function() {
 		return (this.x >= 0) && (this.x < gridSize)
 			&& (this.y >= 0) && (this.y < gridSize);
 	}

 	this.onRoute = function(route) {
 		for (var i = 0; i < route.length; i++) {
 			if (this.equals(route[i])) {
 				return i + 1;
 			}
 		}
 		return 0;
 	}

 	this.distance2 = function(other) {
 		return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
 	}

 	this.equals = function(other) {
 		return other ? (this.x == other.x) && (this.y == other.y) : false;
 	}
 }

 window.onload = (evt) => {
 	var grid = document.getElementById("mainGrid");
 	grid.innerHTML = "";
 	for (var y = 0; y < gridSize; y++) { // vertical
 		const tr = grid.appendChild(document.createElement('tr'));
 		tr.id = "tr_" + y;
 		for (var x = 0; x < gridSize; x++) { // horizontal
 			const td = document.createElement('td')
 			td.id = getCellId(x, y);
 			td.onclick = (evt) => clickHandler(evt);
 			tr.appendChild(td);
 		}
 	}
 	for (var x = 0; x < gridSize; x++) {
 		gridModel.push(Array(gridSize));
 	}
 	addBalls();
 }

 function randomInt(max) {
 	return Math.floor(Math.random() * max);
 }

 function randomColor() {
 	return colors[randomInt(colors.length)];
 }

 function getCellId(x, y) {
 	return "td_" + x + "_" + y;
 }

 function addBalls() {
 	for (var i = 0; i < 5; i++) {
 		addBall();
 	}
 	populatedCells.forEach(cell => checkLines(cell));
 	populatedCells.splice(0);
 	renderModel();
 	gameOver = getFreeCells().length == 0;
 	if (gameOver) {
 		console.log("Game Over!");
 		setTimeout(() => alert('Game Over!\nYour score: ' + score), 500);
 	}
 }

 function addBall() {
 	const freeCells = getFreeCells();
 	if (freeCells.length > 0) {
 		const ball = document.createElement('div');
 		ball.className = 'ball';
 		ball.style.backgroundColor = randomColor();
 		const cell = freeCells[randomInt(freeCells.length)];
 		gridModel[cell.x][cell.y] = ball;
 		populatedCells.push(cell);
 		return ball;
 	}
 }

 function checkLines(cell) {
 	// find 5 or moew adjacent balls of same color
 	const ball = gridModel[cell.x][cell.y];
 	for (const [dX, dY] of [[-1, 1], [0, 1], [1, 1], [1, 0]]) {
 		const line = [cell];
 		checkLineRecursive(cell, dX, dY, ball.style.backgroundColor, line);
 		checkLineRecursive(cell, -dX, -dY, ball.style.backgroundColor, line);
 		if (line.length >= 5) {
 			removeLine(line);
 		}
 	}
 }

 function checkLineRecursive(cell, dX, dY, color, line) {
 	// find adjacent balls of same color
 	const next = new Point(cell.x + dX, cell.y + dY);
 	if (next.isValid()) {
 		const ball = gridModel[next.x][next.y];
 		if (ball && (ball.style.backgroundColor == color)) {
 			line.push(next);
 			checkLineRecursive(next, dX, dY, color, line);
 		}
 	}
 }

 function removeLine(line) {
 	console.log("REMOVE: " + JSON.stringify(line));
 	const timers = []
 	for (const point of line) {
 		const ball = gridModel[point.x][point.y];
 		timers.push(flashBall(ball));
 	}
 	setTimeout(handleLineRemoval, 2700, line, timers);
 }

 function handleLineRemoval(line, timers) {
 	timers.forEach(t => clearInterval(t));
 	line.forEach(p => {
 		const ball = gridModel[p.x][p.y];
 		if (ball) {
 			ball.parentNode.removeChild(ball);
 			gridModel[p.x][p.y] = null;
 		}
 	});
 	score += line.length;
 }

 function getFreeCells() {
 	var freeCells = [];
 	for (var x = 0; x < gridSize; x++) {
 		for (var y = 0; y < gridSize; y++) {
 			if (!gridModel[x][y]) {
 				freeCells.push(new Point(x, y));
 			}
 		}
 	}
 	return freeCells;
 }

 function renderModel() {
 	for (var x = 0; x < gridSize; x++) {
 		for (var y = 0; y < gridSize; y++) {
 			const td = document.getElementById(getCellId(x, y))
 			td.innerHTML = "";
 			const ball = gridModel[x][y]
 			if (ball) {
 				td.appendChild(ball);
 			}
 		}
 	}
 }

 function getCoord(td) {
 	const dest = td.id.split('_');
 	if (dest.length == 3) {
 		return new Point(parseInt(dest[1]), parseInt(dest[2]));
 	} else {
 		return null;
 	}
 }

 function clickHandler(evt) {
 	var td = evt.target;
 	if (td.tagName == 'DIV') {
 		td = td.parentElement;
 	}
 	const coord = getCoord(td);
 	if (coord) {
 		const clicked = gridModel[coord.x][coord.y];
 		const active = activeBall.ball;
 		toggleActive(clicked);
 		if (!clicked && active) {
 			sendBallTo(active, coord);
 		}
 	}
 }

 function toggleActive(ball) {
 	if (activeBall.timerId) {
 		clearInterval(activeBall.timerId);
 		activeBall.ball.style.backgroundColor = activeBall.color;
 		activeBall.timerId = null;
 	}
 	if (ball == activeBall.ball) {
 		activeBall.ball = null;
 	} else if (ball) {
 		activeBall.ball = ball;
 		activeBall.color = activeBall.ball.style.backgroundColor;
 		activeBall.timerId = flashBall(activeBall.ball);
 	}
 }

 function flashBall(ball) {
 	return setInterval(toggleBallColor, 350, ball, ball.style.backgroundColor)
 }

 function toggleBallColor(ball, color) {
 	if (ball) {
 		ball.style.backgroundColor = ball.style.backgroundColor ? '' : color;
 	}
 }

 function sendBallTo(ball, to) {
 	var route = findRoute(getCoord(ball.parentElement), to);
 	if (route) {
 		// traceRoute(route, "#ddd", true);
 		cropLoops(route);
 		buildShortcuts(route);
 		// traceRoute(route, "grey");
 		makeStep(ball, route, 1);
 	}
 }

 function makeStep(ball, route, stepNo) {
 	if (stepNo < route.length) {
 		const from = route[stepNo - 1];
 		const next = route[stepNo];
 		// don't touch others
 		if (gridModel[from.x][from.y] === ball) {
 			gridModel[from.x][from.y] = null;
 		}
 		// add if empty
 		if (!gridModel[next.x][next.y]) {
 			gridModel[next.x][next.y] = ball;
 			document.getElementById(getCellId(next.x, next.y)).appendChild(ball);
 		}
 		setTimeout(makeStep, 100, ball, route, stepNo + 1);
 	} else {
 		clearTimeout();
 		populatedCells.push(route[route.length - 1]);
 		addBalls();
 	}
 }

 function findRoute(from, to) {
 	const route = [];
 	route.push(from);
 	return findRouteRecursive(to, route, {});
 }

 function findRouteRecursive(to, route, attempts) {
 	// TODO-1: find shortest
 	if (route.length > gridSize * gridSize * 3) {
 		throw new Error('Route is too long!');
 	}
 	// reasonable limit attempts to prevent countless cycles
 	attempts.count++ || (attempts.count = 1);
 	if (attempts.count > Math.pow(gridSize, 3)) {
 		return null;
 	}
 	const from = route[route.length - 1];
 	if ((from.x == to.x) && (from.y == to.y)) {
 		// done
 		return Array.from(route);
 	} else {
 		// try neighboring cells except prev (if any)
 		var result = null;
 		const neighbors = getNeighbors(from, to, route);
 		console.log("===> " + attempts.count + " <=== "
 			+ JSON.stringify(route) + " => " + JSON.stringify(to) + ": " + JSON.stringify(neighbors));
 		for (const next of neighbors) {
 			const routePlus = Array.from(route);
 			routePlus.push(next);
 			result = findRouteRecursive(to, routePlus, attempts);
 			if (result) {
 				break; // no need to look for longer routes
 			}
 		}
 		return result;
 	}
 }

 function getNeighbors(from, to, route) {
 	var prev = route.length > 1 ? route[route.length - 2] : null;
 	var neighbors = [];
 	// handle priority
 	for (const point of getAdjacentPoints(from)) {
 		// exclude prev, occupied, and already passed
 		if (!point.equals(prev)
 			&& !gridModel[point.x][point.y]
 			&& !isRepeating(point, route)) {
 			neighbors.push(point);
 		}
 	}
 	if (neighbors.length > 0) {
 		neighbors.sort((p1, p2) => {
 			// check distance
 			const diff = p1.distance2(to) - p2.distance2(to);
 			if ((diff == 0) && prev) {
 				// for same distance preserve direction
 				if (from.x == prev.x) {
 					return Math.abs(p1.x - from.x) - Math.abs(p2.x - from.x);
 				} else {
 					return Math.abs(p1.y - from.y) - Math.abs(p2.y - from.y);
 				}
 			} else {
 				return diff;
 			}
 		});
 	}
 	return neighbors;
 }

 function getAdjacentPoints(from) {
 	const result = [];
 	for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
 		const point = new Point(from.x + offset[0], from.y + offset[1]);
 		if (point.isValid()) {
 			result.push(point);
 		}
 	}
 	return result;
 }

 function isRepeating(point, route) {
 	// we should not repeat more than one consecutive route point
 	if (!point.onRoute(route)) {
 		return false;
 	} else {
 		// check prev
 		const prev = route[route.length - 1];
 		const prevIdx = prev.onRoute(route); // returns +1
 		// should be itself
 		return prevIdx < route.length;
 	}
 }

 function cropLoops(route) {
 	// loop starts at a crossing point
 	// scan from the end (opposite to onRoute() direction)
 	for (var i = route.length - 1; i >= 0; i--) {
 		const point = route[i];
 		const routeIdx = point.onRoute(route) - 1;
 		// same point found elsewhere indicates crossing
 		if ((routeIdx >= 0) && (routeIdx < i)) {
 			const loopSize = i - routeIdx;
 			console.log("LOOP: " + JSON.stringify(route[routeIdx]) + " x" + loopSize);
 			// splice
 			route.splice(routeIdx, loopSize);
 			i = routeIdx;
 		}
 	}
 }

 function buildShortcuts(route) {
 	// build shortcuts between adjacent points
 	// scan from the end (opposite to onRoute() direction)
 	for (var i = route.length - 1; i > 0; i--) {
 		const point = route[i];
 		for (const adjacent of getAdjacentPoints(point)) {
 			const routeIdx = adjacent.onRoute(route);
 			if ((routeIdx > 0) && (routeIdx < i)) {
 				const shortSize = i - routeIdx;
 				console.log("SHORTCUT: " + JSON.stringify(route[routeIdx]) + " x" + shortSize);
 				// splice
 				route.splice(routeIdx, shortSize);
 				i = routeIdx - 1;
 			}
 		}
 	}
 }

 function traceRoute(route, color, cleanup) {
 	if (cleanup) {
 		for (var x = 0; x < gridSize; x++) {
 			for (var y = 0; y < gridSize; y++) {
 				document.getElementById(getCellId(x, y)).style.backgroundColor = "";
 			}
 		}
 	}
 	// highlight route calls
 	for (const point of route) {
 		document.getElementById(getCellId(point.x, point.y)).style.backgroundColor = color;
 	}
 }
