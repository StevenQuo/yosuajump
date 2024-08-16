const FLOOR_HEIGHT = 48;
const JUMP_FORCE = 800;
let SPEED = 380;
SPEED++;

// initialize context
kaplay();

// load assets
loadSprite("background", "assets/img/background.jpeg");
loadSprite("yosua", "assets/img/eka.png");
loadSprite("elang", "assets/img/elang.jpeg");
loadSprite("gusambo", "assets/img/gusambo.png");
loadSound("patuk", "assets/sound/patuk.mp3");

scene("game", () => {
    // define gravity
    setGravity(1600);

    const ui = add([
        fixed(),
        z(-1),
    ]);

    ui.add([
        sprite("background"),
        scale(2),
    ]);

    // add a game object to screen
    const yosua = add([
        sprite("yosua"),
        pos(80, 40),
        area(),
        body({ jumpForce: JUMP_FORCE }),
        rotate(0),
        spin(),
        doubleJump(),
    ]);

    // floor
    add([
        rect(width(), FLOOR_HEIGHT),
        outline(4),
        pos(0, height()),
        anchor("botleft"),
        area(),
        body({ isStatic: true }),
        color(127, 200, 255),
    ]);

    function jump() {
        if (yosua.isGrounded()) {
            yosua.jump(JUMP_FORCE);
        }
    }

    function spin(speed = 1200) {
    let spinning = false;
    return {
        require: ["rotate"],
        update() {
            if (spinning) {
                this.angle += speed * dt();
                if (this.angle >= 360) {
                    spinning = false;
                    this.angle = 0;
                }
                destroyBirds(); // Check for and destroy birds during spin
            }
        },
        spin() {
            if (!spinning) {
                spinning = true;
            }
        },
    };
}

function destroyBirds() {
    // Destroy birds within range of yosua
    const birds = get("bird");
    for (const bird of birds) {
        if (bird.pos.x < yosua.pos.x + 100 && bird.pos.x > yosua.pos.x - 100) {
            bird.destroy();
        }
    }
}

// Add an onDoubleJump event to trigger the spin
yosua.onDoubleJump(() => {
    yosua.spin();
    play("patuk");
});

    // jump when user press space
    onKeyPress("space", jump);
    onClick(jump);

    onKeyPress("space", () => {
        yosua.doubleJump();
    });

    onGamepadButtonPress("south", () => yosua.doubleJump());

    function spawnTree() {
        // add tree obj
        add([
            sprite("elang"),
            scale(rand(0.03, 0.09)),
            area(),
            outline(4),
            pos(width(), height() - FLOOR_HEIGHT),
            anchor("botleft"),
            color(255, 180, 255),
            move(LEFT, SPEED),
            "tree",
        ]);

        // wait a random amount of time to spawn next tree
        wait(rand(1, 2), spawnTree);
    }

    // start spawning trees
    spawnTree();

    function spawnBird() {
        // Add a bird object
        add([
            sprite("gusambo"),
            scale(rand(0.2, 0.4)),
            area(),
            outline(4),
            pos(width(), rand(20, height() - 50)),
            anchor("botleft"),
            color(255, 180, 255),
            move(LEFT, 300),
            "bird",
        ]);

        // Wait a random amount of time to spawn the next bird
        wait(rand(8, 12), spawnBird);
    }

    // Start spawning birds
    spawnBird();

    yosua.onCollide("bird", () => {
        // go to "lose" scene and pass the score
        go("lose2", score);
    });

    // lose if player collides with any game obj with tag "tree"
    yosua.onCollide("tree", () => {
        // go to "lose" scene and pass the score
        go("lose", score);
    });

    // keep track of score
    let score = 0;

    const scoreLabel = add([
        text(score),
        pos(24, 24),
    ]);

    // increment score every frame
    onUpdate(() => {
        score++;
        scoreLabel.text = score;
    });

});

scene("lose", (score) => {
    add([
        sprite("elang"),
        pos(width() / 2, height() / 2 + 300),
        scale(1.5),
        anchor("center"),
        color(255, 0, 0),
    ]);

    // display score
    add([
        text(score),
        pos(width() / 2, height() / 2 + 80),
        scale(2),
    ]);

    // go back to game with space is pressed
    onKeyPress("space", () => go("game"));
    onClick(() => go("game"));
    onGamepadButtonPress("south", () => go("game"));

});

scene("lose2", (score) => {
    add([
        sprite("gusambo"),
        pos(width() / 2, height() / 2 + 360),
        scale(7.4),
        anchor("center"),
        color(255, 0, 0),
    ]);

    // display score
    add([
        text(score),
        pos(width() / 2, height() / 2 + 80),
        scale(2),
    ]);

    // go back to game with space is pressed
    onKeyPress("space", () => go("game"));
    onClick(() => go("game"));
    onGamepadButtonPress("south", () => go("game"));
});

go("game");
