// JavaScript source code
window.onload = function ()
{
	canvasW = 900;
	canvasH = 600;
	var blockSize = 30;
	var ctx;
	var delay = 100;
	var player;
	var pomme;
	var widthInBlocks = canvasW / blockSize; //definir quadrillage
	var heightInBlocks = canvasH / blockSize;
	var timeOut;
	var score;

	init();

	function init()
	{
		var canvas = document.createElement('canvas');
		canvas.width = canvasW;
		canvas.height = canvasH;
		canvas.style.border = "1px solid";
		document.body.appendChild(canvas); //accrocher a la page html
		ctx = canvas.getContext('2d');
		player = new Snake([[6, 4], [5, 4], [4, 4]], "right");
		pomme = new Apple([10, 10]);
		score = 0;
		refreshCanvas();
	}

	function refreshCanvas()
	{
		player.advance();
		if (player.checkCollision()) {
			gameOver();
		} else {
			if (player.isEatingApple(pomme))
			{
				score++;
				player.ateApple = true;
				do
				{
					pomme.setNewPosition();
				} while (pomme.isOnSnake(player)); //est ce que la pomme est sur le serpent ?
			}
			ctx.clearRect(0, 0, canvasW, canvasH);
			drawScore();
			pomme.draw();
			player.draw();
			setTimeout(refreshCanvas, delay);
		}
	}

	function gameOver()
	{
		ctx.save();
		ctx.font = "bold 70px sans-serif";
		ctx.fillStyle = "#000";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		var centreX = canvasW / 2;
		var centreY = canvasH / 2;
		ctx.strokeText("Game Over", centreX, centreY - 180);
		ctx.fillText("Game Over", centreX, centreY - 180);
		ctx.font = "bold 30px sans-serif";
		ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
		ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
		ctx.restore();
	}

	function restart()
	{
		player = new Snake([[6, 4], [5, 4], [4, 4]], "right");
		pommee = new Apple([10, 10]);
		score = 0;
		clearTimeout(timeOut);
		refreshCanvas();
	}

	function drawScore() {
		ctx.save();
		ctx.font = "bold 200px sans-serif";
		ctx.fillStyle = "gray";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		var centreX = canvasW / 2;
		var centreY = canvasH / 2;
		ctx.fillText(score.toString(), centreX, centreY);
		ctx.restore();
	}

	function drawBlock(ctx, position)
	{
		var x = position[0] * blockSize;
		var y = position[1] * blockSize;
		ctx.fillRect(x, y, blockSize, blockSize);
	}

	function Snake(body, direction)
	{
		this.body = body;
		this.direction = direction;
		this.ateApple = false;
		this.draw = function ()
		{
			ctx.save(); //save le contenu du ctx pour pouvoir l'effacer
			ctx.fillStyle = "#C478FF";
			for (var i = 0; i < this.body.length; i++)
			{
				drawBlock(ctx, this.body[i]);
			}
			ctx.restore();
		};
		this.advance = function ()
		{
			var nextPos = this.body[0].slice();
			switch(this.direction)
			{
				case "left":
					nextPos[0]--;
					break;
				case "right":
					nextPos[0]++;
					break;
				case "down":
					nextPos[1]++;
					break;
				case "up":
					nextPos[1]--;
					break;
				default:
					throw("Mauvaise direction");
			}
			this.body.unshift(nextPos);
			if (!this.ateApple)
				this.body.pop(); //si il mange la pomme on empechee deleetion d'un bloc du corps -> il grandit
			else
				this.ateApple = false;
		};
		this.setDirection =  function(newDirection)
		{
			var allowDirections;
			switch (this.direction)
			{
				case "left":
				case "right":
					allowDirections = ['up','down'];
					break;
				case "down":
				case "up":
					allowDirections = ['left', 'right'];
					break;
				default:
					throw("Mauvaise direction");
			}
			if (allowDirections.indexOf(newDirection) > -1)
			{
				this.direction = newDirection;
			}
		};

		this.checkCollision = function () {
			var wallCollision = false;
			var snakeCollision = false;
			var head = this.body[0]; //tete
			var rest = this.body.slice(1); //body
			var snakeX = head[0];
			var snakeY = head[1];
			var minX = 0;
			var minY = 0;
			var maxX = widthInBlocks - 1;
			var maxY = heightInBlocks - 1;
			var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX; //hors du cadre horizontalement
			var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY; //hors cadre verticalement

			if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
			{
				wallCollision = true;
			}
			for (var i = 0; i < rest.length; i++)
			{
				if (snakeX === rest[i][0] && snakeY === rest[i][1]) //tete == corps
				{ 
					snakeCollision = true;
				}
			}

			return wallCollision || snakeCollision;
		};

		this.isEatingApple = function (appleToEat) {
			var head = this.body[0];
			if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
				return true;
			else
				return false;
		}
	}

	function Apple(position) {
		this.position = position;

		this.draw = function () {
			ctx.save(); //si on save/restore pas, tout sera en vert apres
			ctx.fillStyle = '#33cc33';
			ctx.beginPath();
			var radius = blockSize / 2;
			var x = this.position[0] * blockSize + radius;
			var y = this.position[1] * blockSize + radius;
			ctx.arc(x, y, radius, 0, Math.PI * 2, true);
			ctx.fill();
			ctx.restore();
		};

		this.setNewPosition = function () {
			var newX = Math.round(Math.random() * (widthInBlocks - 1));
			var newY = Math.round(Math.random() * (heightInBlocks - 1));
			this.position = [newX, newY];
		};

		this.isOnSnake = function (snakeToCheck) {
			var isOnSnake = false;
			for (var i = 0; i < snakeToCheck.body.length; i++) {
				if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
					isOnSnake = true;
				}
			}
			return isOnSnake;
		};
	}

	document.onkeydown = function handleKeyDown(e)
	{
		var key = e.keyCode;
		var newDirection;
		switch (key) {
			case 37:
				newDirection = "left";
				break;
			case 38:
				newDirection = "up";
				break;
			case 39:
				newDirection = "right";
				break;
			case 40:
				newDirection = "down";
				break;
			case 32:
				restart();
				return;
			default:
				return;
		}
		player.setDirection(newDirection);
	}
}