$(document).ready(function () {
    //캔버스
    function start() {
        let canvas = $("canvas").get(0);
        let ctx = canvas.getContext("2d");
        let backgroundImage, spaceShipImage, bulletImage, enemyImage, gameOverImage;
        let spaceShipX = canvas.width / 2 - 15;
        let spaceShipY = canvas.height - 30;
        let spaceShipXSize = 30;
        let spaceShipYSize = 30;
        let spaceShipXSpeed = 3;
        let keysDown = {}
        let bulletList = [];
        let enemyList = [];
        let gameOver = false;
        let score = 0;
        let intervalId;

        function loadImage() {
            backgroundImage = new Image();
            backgroundImage.src = "../img/backGroundImage.jpg"

            spaceShipImage = new Image();
            spaceShipImage.src = "../img/player.png";

            bulletImage = new Image();
            bulletImage.src = "../img/bullet.png";

            enemyImage = new Image();
            enemyImage.src = "../img/enemy.png"

            gameOverImage = new Image();
            gameOverImage.src = "../img/gameOverImage.png";
        }

        function render() {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(spaceShipImage, spaceShipX, spaceShipY, spaceShipXSize, spaceShipYSize)
            ctx.fillText(`Score:${score}`, 20, 20);
            ctx.fillStyle = "white"
            ctx.font = "20px Arial"

            for (let i = 0; i < bulletList.length; i++) {
                if (bulletList[i].alive) {
                    ctx.drawImage(bulletImage, bulletList[i].x, bulletList[i].y, 10, 10)
                }
            }

            for (let i = 0; i < enemyList.length; i++) {
                ctx.drawImage(enemyImage, enemyList[i].x, enemyList[i].y, 30, 30)
            }



        }

        function main() {
            if (!gameOver) {
                update();
                render();
                requestAnimationFrame(main)
            } else {
                ctx.drawImage(gameOverImage, canvas.width / 2 - 43, 10, 100, 100)

                console.log(bulletList)
            }
        }

        function setupKeyboardListener() {
            $(document).keydown(function (event) {
                keysDown[event.keyCode] = true;
                console.log("버튼 클릭", keysDown)
            })

            $(document).keyup(function (event) {
                delete keysDown[event.keyCode]

                if (event.keyCode == 17) {
                    createBullet();
                }
            });
        }

        function createBullet() {
            console.log("총알 생성")
            let b = new Bullet();
            b.init();
            console.log("총알 리스트:", bulletList)

        }

        function Bullet() {
            this.x = 0;
            this.y = 0;
            this.alive = true;

            this.init = function () {
                this.x = spaceShipX + 10;
                this.y = spaceShipY;
                bulletList.push(this);
            }

            this.update = function () {
                if (this.y <= 30) {
                    this.alive = false;
                }
                this.y -= 7;
            }

            this.checkHit = function () {
                for (let i = 0; i < enemyList.length; i++) {
                    if (this.y <= enemyList[i].y && this.x >= enemyList[i].x && this.x <= enemyList[i].x + 30) {
                        score++;
                        this.alive = false;
                        enemyList.splice(i, 1);
                    }
                }
            }
        }

        function update() {
            //right
            if (39 in keysDown) {
                spaceShipX += spaceShipXSpeed;
            }

            //left
            if (37 in keysDown) {
                spaceShipX -= spaceShipXSpeed;
            }

            if (spaceShipX <= 0) {
                spaceShipX = 0;
            }

            if (spaceShipX >= canvas.width - spaceShipXSize) {
                spaceShipX = canvas.width - spaceShipXSize;
            }

            for (let i = 0; i < bulletList.length; i++) {
                if (bulletList[i].alive) {
                    bulletList[i].update();
                    bulletList[i].checkHit();
                } else {
                    bulletList.splice(i, 1)
                }
            }

            for (let i = 0; i < enemyList.length; i++) {
                enemyList[i].update();
            }


        }

        function generateRandomValue(min, max) {
            let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            return randomNumber;
        }

        function createEnemy() {
            if (!gameOver) {
                intervalId = setInterval(function () {
                    let e = new Enemy();
                    e.init();
                }, 1000)
            }
            else {
                clearInterval(intervalId);
            }

        }

        function Enemy() {
            this.x = 0;
            this.y = 0;

            this.init = function () {
                this.x = generateRandomValue(0, canvas.width - 30);
                this.y = 0;

                enemyList.push(this);
            }

            this.update = function () {
                this.y += 1;

                if (this.y >= canvas.height - 30) {
                    gameOver = true;
                }
            }
        }

        loadImage();
        createEnemy();
        setupKeyboardListener();
        main();
    }

    start();

    $("button").on("click",function(){
        start();
    })
});
