/// <reference path='phaser.comments.d.ts' />

module GestionAirTV {
    var DEBUG: boolean = true;
    export class Game {
        game: Phaser.Game;

        constructor() {
            this.game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'content', new MenuState());
            this.handleEvent();
        }

        handleEvent() {
            var event = {
                type: 'Game',
                state: 'start',
                endTime: new Date(new Date().getTime() + 10000),
                players: [
                    { id: 1, name: 'Alice' },
                    { id: 2, name: 'Bertrand' },
                    { id: 3, name: 'Charles' },
                    { id: 4, name: 'Delphine' },
                    { id: 5, name: 'Elisabeth' },
                    { id: 6, name: 'Felicitas' }
                ],
                phones: [
                    { number: 1, x: 400, y: 60, orientation: Phone.Orientation.BOTTOM },
                    { number: 2, x: 700, y: 60, orientation: Phone.Orientation.BOTTOM },
                    { number: 3, x: 1000, y: 60, orientation: Phone.Orientation.BOTTOM },
                    { number: 4, x: 1300, y: 60, orientation: Phone.Orientation.BOTTOM },
                    { number: 5, x: 1690, y: 200, orientation: Phone.Orientation.LEFT },
                    { number: 6, x: 1690, y: 460, orientation: Phone.Orientation.LEFT },
                    { number: 7, x: 1100, y: 620, orientation: Phone.Orientation.TOP },
                    { number: 8, x: 700, y: 620, orientation: Phone.Orientation.TOP },
                    { number: 9, x: 100, y: 460, orientation: Phone.Orientation.RIGHT },
                    { number: 10, x: 100, y: 200, orientation: Phone.Orientation.RIGHT }
                ]
            };
            var state = new GameState(event)
            this.game.state.remove('game');
            this.game.state.add('game', state, true);
        }

    }

    class MenuState extends Phaser.State {
        preload() {
            //this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.load.image('logo', 'images/phaser-logo-small.png');
        }

        create() {
            var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
            logo.anchor.setTo(0.5, 0.5);
            logo.scale.setTo(0.2, 0.2);
            this.game.add.tween(logo.scale).to({ x: 1, y: 1 }, 2000, Phaser.Easing.Bounce.Out, true);
            logo.inputEnabled = true;
            logo.events.onInputDown.add(function (sprite, pointer) {
                gestionAirTV.handleEvent();
            }, this);
        }
    }

    interface GameStateConfig {
        players: Array<any>;
        phones: Array<PhoneConfig>;
    }
    interface PhoneConfig {
        number: number;
        x: number;
        y: number;
        orientation: number;
    }
    interface PlayerConfig {
        number: number;
        name: string;
    }
    interface PhoneMap {
        [number: number]: Phone;
    }
    interface PlayerMap {
        [id: number]: Player;
    }

    class GameState extends Phaser.State {

        initData: GameStateConfig;
        phones: PhoneMap = {};
        players: PlayerMap = {};

        constructor(init:GameStateConfig) {
            super();
            this.initData = init;
        }

        preload() {
            //this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.load.image('phone', 'images/phone72.png');
            this.game.load.image('correct', 'images/checked21.png');
            this.game.load.image('wrong', 'images/delete102.png');
            this.game.load.bitmapFont('digital-7', 'fonts/digital-7.mono.png', 'fonts/digital-7.mono.xml');
            ['gb','de','fr'].forEach(lg => {
                this.game.load.image(lg, 'images/flags/' + lg + '.png');
            });
        }

        create() {
            this.game.stage.backgroundColor = 0x10a2ff;
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.physics.arcade.sortDirection = Phaser.Physics.Arcade.SORT_NONE;
            Phaser.Physics.Arcade.OVERLAP_BIAS = 0;
            var back = this.game.add.graphics(100, 50);
            back.beginFill(0xffffe8);
            back.lineStyle(3, 0x999999);
            back.drawRect(0, 0, 1720, 700);
            back.endFill();
            back = this.game.add.graphics(300, 750);
            back.beginFill(0xffffe8);
            back.lineStyle(3, 0x999999);
            back.drawRect(0, 0, 200, 20);
            back.endFill();
            back = this.game.add.graphics(1400, 750);
            back.beginFill(0xffffe8);
            back.lineStyle(3, 0x999999);
            back.drawRect(0, 0, 200, 20);
            back.endFill();

            this.initData.phones.forEach(phoneData => {
                var phone = new Phone(this.game, phoneData);
                this.phones[phoneData.number] = phone;
                this.add.existing(phone);
            });

            this.initData.players.forEach((playerData, i) => {
                var player = new Player(this.game, playerData, i);
                player.inputEnabled = true;
                player.input.enableDrag();
                if (i === 0) {
                    player.body.allowGravity = false;
                }
                this.players[playerData.id] = player;
                var t = this.game.time.create();
                t.start();
                t.add(i * 2000, args => {
                    this.add.existing(player)
                    console.log(args);
                }, this, player);
                
            });

            //this.add.text(0, 100, String(timer), { font: "65px Arial", fill: "#ff0044", align: "center" });
        }

        update() {
            var playersArray = Object.keys(this.players).map(k=> { return this.players[k]; });
            this.game.physics.arcade.collide(playersArray, playersArray);
            var phonesArray = Object.keys(this.phones).map(k=> { return this.phones[k].phone; });
            this.game.physics.arcade.collide(playersArray, phonesArray);
        }

        render() {
            if (this.players[1]) {
                this.game.debug.bodyInfo(this.players[1], 32, 32);
                this.game.debug.body(this.players[1]);
            }
        }

    }

    class Phone extends Phaser.Group {
        number: number;
        state: Phone.State = Phone.State.AVAILABLE;
        flag: Phaser.Image;
        phone: Phaser.Sprite;
        debugText: Phaser.Text;
        countDownText: Phaser.BitmapText;
        timer: number = -1;
        ringingTween: Phaser.Tween;

        constructor(game: Phaser.Game, conf: PhoneConfig) {
            super(game, null, 'phone', true)
            this.position.setTo(conf.x, conf.y);

            //conf.orientation
            //BOTTOM: player on bottom flag and timer on RIGHT timer bottom
            //TOP: player on TOPT flag and timer on RIGHT timer top
            //LEFT: player on LEFT flag and timer on TOP timer left
            //RIGHT: player on RIGHT flag and timer on TOP timer right
            

            this.number = conf.number;
            this.phone = new Phaser.Sprite(game, 0, 0, 'phone', null);
            this.phone.tint = 0x000000;
            this.phone.position.set(this.phone.width / 2, this.phone.height / 2);
            this.phone.anchor.setTo(0.5, 0.5);
            this.ringingTween = game.add.tween(this.phone.scale).to({ x: 0.8, y: 0.8 }, 1500, Phaser.Easing.Sinusoidal.InOut, false, 0, -1, true);
            this.addChild(this.phone);
            this.game.physics.enable(this.phone, Phaser.Physics.ARCADE, true);
            this.phone.body.immovable = true;
            this.phone.body.allowGravity = false;

            this.flag = new Phaser.Image(game, 0, 0, 'fr', null);
            this.flag.scale.setTo(0.2, 0.2);
            if (conf.orientation === Phone.Orientation.BOTTOM || conf.orientation === Phone.Orientation.TOP) {
                this.flag.position.setTo(this.phone.width, 0);
            } else {
                this.flag.position.setTo(0, -this.flag.height);
            }
            this.flag.loadTexture('gb', null);
            this.flag.visible = false;
            this.add(this.flag);

            var timerEvent = game.time.events.loop(Phaser.Timer.SECOND, function () {
                if (this.timer >= 0) {
                    this.timer++;
                    var s = '0' + this.timer;
                    this.countDownText.setText(s.substr(s.length - 2));
                }
            }, this);

            this.countDownText = new Phaser.BitmapText(game, 0, 0, 'digital-7', '00', 96);
            this.countDownText.visible = false;
            if (conf.orientation === Phone.Orientation.BOTTOM) {
                this.countDownText.position.setTo(this.phone.width, this.phone.height);
            } else if (conf.orientation === Phone.Orientation.TOP) {
                this.countDownText.position.setTo(this.phone.width, -this.countDownText.height);
            } else if (conf.orientation === Phone.Orientation.RIGHT) {
                this.countDownText.position.setTo(this.phone.width, -this.countDownText.height);
            } else if (conf.orientation === Phone.Orientation.LEFT) {
                this.countDownText.position.setTo(-this.countDownText.width, -this.countDownText.height);
            }
            this.addChild(this.countDownText);

            var dClickLast: number;
            function isDoubleClick(o_pointer: Phaser.Pointer) : boolean {
                if (o_pointer.justReleased(30)) {
                    var now = new Date().getTime();
                    var timesince = now - this.dClickLast;
                    if ((timesince < 600) && (timesince > 0)) {
                        return true;
                    }
                    this.dClickLast = new Date().getTime();
                }
                return false;
            }

            if (DEBUG) {
                this.debugText = new Phaser.Text(game, 0, this.phone.height, '', { font: "36px Arial", fill: "#000000" });
                this.addChild(this.debugText);
                this.phone.inputEnabled = true;
                //this.phone.input.enableDrag(true);
                this.phone.events.onInputUp.add((phone: Phone, pointer) => {
                    //this.position.setTo(pointer.x - this.phone.width / 2, pointer.y - this.phone.height / 2);
                    //this.phone.position.set(this.phone.width / 2, this.phone.height / 2);
                    if (this.timer === -1) {
                        this.setStateRinging();
                    }
                    if(isDoubleClick(pointer)){
                        if (this.timer > 2) {
                            this.setStateAnswered();
                        } else {
                            this.setStateAnswering();
                        }
                        
                    }
                })
            }
            this.setStateAnswering();
        }

        setStateRinging() {
            this.phone.tint = 0xffcc00;
            this.ringingTween.isPaused ? this.ringingTween.resume() : this.ringingTween.start();
            this.flag.visible = false;
            this.countDownText.visible = false;
        }

        setStateAnswering() {
            this.ringingTween.pause();
            this.phone.scale.setTo(1, 1);
            this.timer = 0;
            this.countDownText.visible = true;
            this.flag.loadTexture('fr', null);
            this.flag.visible = true;
            //get coordinates for player
        }

        setStateAnswered() {
            this.phone.tint = 0xdc1616;
            this.timer = -1;
            //338000
            //create checkmark anim? 
        }


        update() {
            if (DEBUG) {
                //this.debugText.setText(this.position.toString());
            }
        }
    }
    module Phone {
        export enum State { AVAILABLE = 0, RINGING = 4 };
        export enum Orientation {
            TOP = 0,
            RIGHT = 1,
            BOTTOM = 2,
            LEFT = 3
        }
    }

    class Player extends Phaser.Sprite {
        id: number;
        name: string;
        score: number = 0;
        target: Phaser.Point;

        constructor(game: Phaser.Game, conf: PlayerConfig, i: number) {
            super(game, 300, 600, new Phaser.RenderTexture(game, 100, 100, 'empty'))
            this.target = new Phaser.Point(game.world.width / 2, game.world.height/3);
            game.physics.enable(this, Phaser.Physics.ARCADE, true);
            this.body.collideWorldBounds = true;
            var shadow = this.makeIcon(i, true)
            shadow.position.setTo(6, 6);
            this.addChild(shadow);
            this.addChild(this.makeIcon(i));    
        }

        drawIcon(graphics: Phaser.Graphics, type) {
            if (type === 0) { //star 5
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 35, 30, 2, 35, 26, 58, 21, 90, 50, 75, 79, 90, 74, 58, 98, 35, 65, 30).points);
            } else if (type === 1) { //square
                graphics.drawPolygon(new Phaser.Polygon(5, 5, 5, 95, 95, 95, 95, 5).points);
            } else if (type === 2) { //triangle
                graphics.drawPolygon(new Phaser.Polygon(0, 86, 100, 86, 50, 0).points);
            } else if (type === 3) { //penta
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 2, 35, 21, 90, 79, 90, 98, 35).points);
            } else if (type === 4) { //star 4
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 35, 35, 0, 50, 35, 65, 50, 100, 65, 65, 100, 50, 65, 35).points);
            } else if (type === 5) { //circle
                graphics.drawCircle(50, 50, 100);
            }
        }

        makeIcon(type: number, shadow?) {
            var colors = [0xffcc00, 0xff0066, 0xabc837, 0x0055d4, 0xff6600, 0xc87137];
            var graphics = new Phaser.Graphics(this.game, 0, 0);
            if (shadow) {
                graphics.beginFill(0xffffff);
                graphics.lineStyle(2, 0xffffff, 0.6);
                graphics.tint = 0x000000;
                graphics.alpha = 0.6;
            } else {
                graphics.beginFill(colors[type]);
                graphics.lineStyle(2, 0xffffff);
            }
            this.drawIcon(graphics, type);
            graphics.endFill();
            return graphics;
        }

        update() {
            if (this.position.distance(this.target, true) > 100) {
                this.game.physics.arcade.moveToXY(this, this.target.x, this.target.y, 200);
            } else {
                this.game.physics.arcade.moveToXY(this, this.target.x, this.target.y, 10);
                //this.body.velocity.set(0);
                //this.body.acceleration.set(0);
            }
        }
    }
  

    class PlayerScore {
        addAnswer() {
            /*
            var correct = this.add.sprite(400, 400, 'correct');
            correct.tint = 0x00ff00;
            var wrong = this.add.sprite(400, 800, 'wrong');
            wrong.tint = 0xff0000;
            */
        }
    }

}
var gestionAirTV;
window.onload = () => {

    gestionAirTV = new GestionAirTV.Game();

};