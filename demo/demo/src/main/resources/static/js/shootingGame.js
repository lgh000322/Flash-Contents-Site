$(document).ready(function () {

    let serverScore;

    function commentWrite() {
        let content = $("#comment").val();
        let gamename = $("title").text();
        let username = $('#memberName').text();

        fetch("/comment/write", {
            method: "POST",
            body: JSON.stringify({ content: content, gamename: gamename }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 댓글 작성 성공 시 데이터를 추가
                    let newComment = `
                        <div class="comments">
                            <p class="userName">${username}</p>
                            <p class="userComment">${content}</p>
                        </div>
                    `;
                    $("#comments-aria").prepend(newComment);
                    $("#comment").val("");
                } else {
                    alert("댓글 작성 중 에러가 발생했습니다.");
                }
            })
            .catch(error => {
                console.error("Error: ", error);
                alert("댓글 작성 중 에러가 발생했습니다.");
            });
    }

    function getUserScore() {
        let gamename = $("title").text();
        let username = $('#memberName').text();

        return fetch(`/ranking/score?gamename=${gamename}&nickname=${username}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                return data.score;
            })
            .catch(error => {
                console.error("Error: ", error);
                alert("회원의 점수를 가져오는데 에러가 발생했습니다.");
                return 0;
            });
    }

    function updateScore(score) {
            let gamename = $("title").text();
            let username = $('#memberName').text();

            fetch("/ranking/score", {
                method: "POST",
                body: JSON.stringify({ gamename: gamename, nickname: username, score: score }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log("데이터 업데이트 성공" + data.score)
                    } else {
                        alert("회원의 점수를 가져오는데 실패했습니다.");
                    }
                })
                .catch(error => {
                    console.error("Error: ", error);
                    alert("회원의 점수를 가져오는데 에러가 발생했습니다.");
                });
        }


    $("#comment-submit-btn").click(function () {
        commentWrite();
    });

    let text = ''; // 댓글을 담을 텍스트

    let setText = function () {
        text += ' <div class="comments">';
        text += '  <p class="userName">id</p>';
        text += ' <p class="userComment"> comment......</p>';
        text += '</div>';
    };

    let appendComment = function () {
        for (var i = 0; i < 20; i++) {
            $("#comments-aria").append(text);
        }
    };

    $(window).scroll(function () {
        let scrollHeight = $(window).scrollTop() + $(window).height();
        let documentHeight = $(document).height();

        if (scrollHeight >= documentHeight - 100) {
            appendComment();
        }
    });

    //캔버스
    function start() {
        getUserScore().then(serverScore => {
            let canvas = $("canvas").get(0);
            let ctx = canvas.getContext("2d");

            let backgroundImage, spaceShipImage, bulletImage, enemyImage, gameOverImage;
            let spaceShipX = canvas.width / 2 - 15;
            let spaceShipY = canvas.height - 30;
            let spaceShipXSize = 30;
            let spaceShipYSize = 30;
            let spaceShipXSpeed = 3;
            let keysDown = {};
            let bulletList = [];
            let enemyList = [];
            let gameOver = false;
            let score = 0;
            let intervalId;

            function loadImage() {
                backgroundImage = new Image();
                backgroundImage.src = "../img/backGroundImage.jpg";

                spaceShipImage = new Image();
                spaceShipImage.src = "../img/player.png";

                bulletImage = new Image();
                bulletImage.src = "../img/bullet.png";

                enemyImage = new Image();
                enemyImage.src = "../img/enemy.png";

                gameOverImage = new Image();
                gameOverImage.src = "../img/gameOverImage.png";
            }

            function render() {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
                ctx.drawImage(spaceShipImage, spaceShipX, spaceShipY, spaceShipXSize, spaceShipYSize);
                ctx.fillText(`Score:${score}`, 20, 20);
                ctx.fillStyle = "white";
                ctx.font = "20px Arial";

                for (let i = 0; i < bulletList.length; i++) {
                    if (bulletList[i].alive) {
                        ctx.drawImage(bulletImage, bulletList[i].x, bulletList[i].y, 10, 10);
                    }
                }

                for (let i = 0; i < enemyList.length; i++) {
                    ctx.drawImage(enemyImage, enemyList[i].x, enemyList[i].y, 30, 30);
                }
            }

            function main() {
                if (!gameOver) {
                    update();
                    render();
                    requestAnimationFrame(main);
                } else {
                    ctx.drawImage(gameOverImage, canvas.width / 2 - 43, 10, 100, 100);
                    clearInterval(intervalId); // 적 생성 중지
                    if(score>serverScore){
                        updateScore(score);
                    }
                }
            }

            function setupKeyboardListener() {
                $(document).off('keydown').on('keydown', function (event) {
                    keysDown[event.keyCode] = true;
                });

                $(document).off('keyup').on('keyup', function (event) {
                    delete keysDown[event.keyCode];

                    if (event.keyCode == 17) {
                        createBullet();
                    }
                });
            }

            function createBullet() {
                let b = new Bullet();
                b.init();
            }

            function Bullet() {
                this.x = 0;
                this.y = 0;
                this.alive = true;

                this.init = function () {
                    this.x = spaceShipX + 10;
                    this.y = spaceShipY;
                    bulletList.push(this);
                };

                this.update = function () {
                    if (this.y <= 30) {
                        this.alive = false;
                    }
                    this.y -= 7;
                };

                this.checkHit = function () {
                    for (let i = 0; i < enemyList.length; i++) {
                        if (this.y <= enemyList[i].y && this.x >= enemyList[i].x && this.x <= enemyList[i].x + 30) {
                            score++;
                            this.alive = false;
                            enemyList.splice(i, 1);
                        }
                    }
                };
            }

            function update() {
                // 오른쪽
                if (39 in keysDown) {
                    spaceShipX += spaceShipXSpeed;
                }

                // 왼쪽
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
                        bulletList.splice(i, 1);
                    }
                }

                for (let i = 0; i < enemyList.length; i++) {
                    enemyList[i].update();
                }
            }

            function generateRandomValue(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            function createEnemy() {
                intervalId = setInterval(function () {
                    if (!gameOver) {
                        let e = new Enemy();
                        e.init();
                    } else {
                        clearInterval(intervalId);
                    }
                }, 1000);
            }

            function Enemy() {
                this.x = 0;
                this.y = 0;

                this.init = function () {
                    this.x = generateRandomValue(0, canvas.width - 30);
                    this.y = 0;

                    enemyList.push(this);
                };

                this.update = function () {
                    this.y += 1;

                    if (this.y >= canvas.height - 30) {
                        gameOver = true;
                    }
                };
            }

            // 게임 상태 초기화
            gameOver = false;
            score = 0;
            bulletList = [];
            enemyList = [];

            loadImage();
            createEnemy();
            setupKeyboardListener();
            main();
        });
    }

    start();
    setText();

    $("#restart").on("click", function () {
        start();
    });
});
