$(document).ready(function () {

    var gravity_x = 0;
    var gravity_y = 0;
    var canvas = jQuery('CANVAS')[0];
    var context = canvas.getContext('2d');
    var sprites = [];

    var score = 0;
    var score_max = 0;
    var score_penalties = false;
    var score_levelup = 10;

    /**
     * Constructor to create a new Ball for the screen.
     */
    var ball = function () {

        /* Set the colour (but not white) */
        var r = Math.round(Math.random() * 255);
        var g = Math.round(Math.random() * 255);
        this.colour = 'rgba(' + r + ',' + g + ',' + Math.max(0, 255 - r - g) + ',0.75)';

        /* Set radius/size */
        this.radius = (Math.random() * (Math.min(canvas.height, canvas.width) / 10)) + 10;

        /* Set start position. */
        this.posX = canvas.width / 2;
        this.posY = canvas.height / 2;

        /* Set speed */
        this.speed = (Math.random() * (canvas.height / 10)) + 10;
        this.speedX = 0;
        this.speedY = 0;

        /**
         * Render this ball to screen.
         */
        this.render = function () {

            /* Calculate new speed */
            this.speedX = gravity_x * this.speed;
            this.speedY = gravity_y * this.speed;

            /* Calculate new Position */
            this.posX = this.posX + this.speedX;
            this.posY = this.posY + this.speedY;

            /* Stop at the edge of the screen. */
            if (this.posX < 0 + this.radius) {
                this.posX = 0 + this.radius;
                score_penalties = true;

            } else if (this.posX > canvas.width - this.radius) {
                this.posX = canvas.width - this.radius;
                score_penalties = true;

            }

            if (this.posY < 0 + this.radius) {
                this.posY = 0 + this.radius;
                score_penalties = true;

            } else if (this.posY > canvas.height - this.radius) {
                this.posY = canvas.height - this.radius;
                score_penalties = true;

            }

            /* Draw the Ball and it's shaddow */
            context.beginPath();
            context.fillStyle = 'rgba(0,0,0,0.5)';
            context.arc(this.posX + (gravity_x * 20), this.posY + (gravity_y * 20), this.radius, 0, 2 * Math.PI, false);
            context.fill();

            context.beginPath();
            context.fillStyle = this.colour;
            context.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI, false);
            context.fill();
        }
    };

    /**
     * Animate frame of the game.
     */
    var doAnimate = function () {

        /* Clear the canvas */
        context.clearRect(0, 0, canvas.width, canvas.height);

        /* Set the background */
        if (score_penalties) {
            context.fillStyle = '#FF0000';
            score_penalties = false;
        } else {
            var bg = Math.round((Math.abs(gravity_x) + Math.abs(gravity_y) / 2) * 255);
            context.fillStyle = 'rgb(' + (255 - bg) + ',255,' + (255 - bg) + ')';


        }
        context.fillRect(0, 0, canvas.width, canvas.height);

        /* Add the border and it's shaddow */
        context.beginPath();
        context.strokeStyle = "rgba(128,128,128,0.5)";
        context.rect(10 + (gravity_x * 10), 10 + (gravity_y * 10), canvas.width - 20, canvas.height - 20);
        context.stroke();

        context.beginPath();
        context.strokeStyle = "#FF0000";
        context.rect(10, 10, canvas.width - 20, canvas.height - 20);
        context.stroke();

        /* Render each sprite/layer/ball. */
        for (i = 0; i < sprites.length; i++) {
            sprites[i].render()
        }

        /* Add the scores */
        context.fillStyle = '#000000';
        context.font = "15px Arial";
        context.fillText("Score: " + score.toFixed(0) + ' (' + sprites.length + ' Balls)', 20, 30);
        context.fillText("High Score: " + score_max.toFixed(0), 20, 50);

        /* Add listener to Repeat on next animation frame. */
        window.requestAnimationFrame(doAnimate);
    };

    var doScoreCount = function () {

        if (score_penalties) {

            /* Subtract points from the score multiplied by number of balls */
            score = score - (sprites.length * (Math.abs(gravity_x) + Math.abs(gravity_y)));

            /* Vibrate the device (if supported) */
            if (navigator.vibrate) {
                navigator.vibrate(1);
            }

            /* If the score is 0 trigger the end of the game */
            if (score < 0) {
                alert("Game Over\r\nHigh Score: " + score_max.toFixed(0) + "\r\nBalls: " + sprites.length);
                doReset();
            }

        } else if (sprites.length > 0) {

            /* Add points to the score and update the max score. */
            score = score + ( (Math.abs(gravity_x) + Math.abs(gravity_y)));
            score_max = Math.max(score, score_max);

            /* Check the timer/counter for the next level uo and add balls */
            score_levelup++;
            if (score_levelup > 500) {
                score_levelup = 0;
                sprites.push(new ball(null, null));
            }

        }

        /* Re-check the scores in 0.1 seconds */
        setTimeout(doScoreCount, 10);

    };

    /**
     * Reset the game to a start state.
     */
    var doReset = function () {
        score = 0;
        score_levelup = 0;
        score_max = 0;
        score_penalties = false;
        sprites = [];
    };

    /* Resize the canvas to fit the window. */
    jQuery(window).on('resize', function () {
        canvas.width = jQuery(window).innerWidth();
        canvas.height = jQuery(window).innerHeight();

    });

    /* Restart the game when the canvas is clicked. */
    jQuery('CANVAS').on('click', function (event) {
        doReset();
        sprites.push(new ball());

    }).resize();

    /* Enable vibration support (if available) */
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

    /* Add listner for device orientation (if supported) */
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function (event) {

            // Calculate X
            gravity_x = event.gamma / 90;

            // Calculate Y
            if (event.beta > 90) {
                gravity_y = (180 - event.beta) / 90;
            } else if (event.beta < -90) {
                gravity_y = (-180 - event.beta) / 90;
            } else {
                gravity_y = event.beta / 90;
            }
        }, false);

    } else {
        alert('Your browser dosn\'t support device orientation');
    }

    /* Start the animation and score-keeper */
    doAnimate();
    doScoreCount();

})