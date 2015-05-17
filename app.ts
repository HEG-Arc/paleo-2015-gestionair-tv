/// <reference path='phaser.comments.d.ts' />

module GestionAirTV {
    var DEBUG: boolean = false;
    export class Game extends Phaser.Game {

        phoneMaterial: Phaser.Physics.P2.Material;
        playerMaterial: Phaser.Physics.P2.Material;

        constructor() {
            super(1920, 1080, Phaser.AUTO, 'content', new MenuState());
            this.handleEvent();
        }

        gameState: GameState;

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
            this.gameState = new GameState(event)
            this.state.remove('game');
            this.state.add('game', this.gameState, true);
        }
        debugRinging(number:number) {
            this.gameState.phones[number].setStateRinging();
        }
        debugAnswering(id: number, number: number) {
            var player = this.gameState.players[id];
            var phone = this.gameState.phones[number];
            player.moveToPhone(phone);
            phone.setStateWaitForPlayer(player);
        }

    }

    class MenuState extends Phaser.State {
        preload() {
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
        trailsBitmap: Phaser.BitmapData;
        game: Game;

        constructor(init:GameStateConfig) {
            super();
            this.initData = init;
        }

        preload() {
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
            this.physics.startSystem(Phaser.Physics.P2JS);
            this.game.phoneMaterial = new Phaser.Physics.P2.Material('phoneMaterial');
            this.game.playerMaterial = new Phaser.Physics.P2.Material('playerMaterial');
            var contactMaterialPhonePlayer = this.physics.p2.createContactMaterial(this.game.phoneMaterial, this.game.playerMaterial);

            contactMaterialPhonePlayer.friction = 10;     // Friction to use in the contact of these two materials.
            contactMaterialPhonePlayer.restitution = 0.0;  // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

            var contactMaterialPlayerPlayer = this.physics.p2.createContactMaterial(this.game.playerMaterial, this.game.playerMaterial);
            contactMaterialPlayerPlayer.friction = 0.2;     // Friction to use in the contact of these two materials.
            contactMaterialPlayerPlayer.restitution = 1.0;  // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.
            contactMaterialPlayerPlayer.surfaceVelocity = 5;        // Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.


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
            
            this.trailsBitmap = this.game.add.bitmapData(1720, 700);
            this.game.add.image(100, 50, this.trailsBitmap, null);
            
            this.initData.phones.forEach(phoneData => {
                var phone = new Phone(this.game, phoneData);
                this.phones[phoneData.number] = phone;
                this.add.existing(phone);
            });

            this.initData.players.forEach((playerData, i) => {
                var t = this.game.time.create();
                t.start();
                t.add(i * 2000, () => {
                    var player = new Player(this.game, playerData, i);
                    this.players[playerData.id] = player;
                    this.add.existing(player)
                }, this);
                
            });
        }

        update() {

        }

        render() {

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
        target: Phaser.Point;
        player: Player;

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

            var body = game.physics.p2.createBody(this.x + this.phone.width / 2, this.y + this.phone.height / 2, 0, true);
            body.setRectangleFromSprite(this.phone);
            body.setMaterial((<Game>this.game).phoneMaterial);
            body.debug = DEBUG;            

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
                this.target = new Phaser.Point(this.x + this.phone.width / 2, this.y + this.phone.height + Player.SIZE/2);
            } else if (conf.orientation === Phone.Orientation.TOP) {
                this.countDownText.position.setTo(this.phone.width, -this.countDownText.height);
                this.target = new Phaser.Point(this.x + this.phone.width / 2, this.y - Player.SIZE/2);
            } else if (conf.orientation === Phone.Orientation.RIGHT) {
                this.countDownText.position.setTo(this.phone.width, -this.countDownText.height);
                this.target = new Phaser.Point(this.x + this.phone.width + Player.SIZE/2, this.y + this.phone.height/2);
            } else if (conf.orientation === Phone.Orientation.LEFT) {
                this.countDownText.position.setTo(-this.countDownText.width, -this.countDownText.height);
                this.target = new Phaser.Point(this.x - Player.SIZE / 2, this.y + this.phone.height / 2);
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

            this.phone.inputEnabled = true;
            this.phone.events.onInputUp.add((phone: Phone, pointer) => {
                //this.position.setTo(pointer.x - this.phone.width / 2, pointer.y - this.phone.height / 2);
                //this.phone.position.set(this.phone.width / 2, this.phone.height / 2);
                if (this.timer === -1) {
                    this.setStateRinging();
                }
                if (this.timer > 2) {
                    this.setStateAnswered();
                }
                if (isDoubleClick(pointer)) {
                    if (this.timer > 2) {
                        this.setStateAnswered();
                    } else {
                        this.setStateAnswering();
                    }

                }
            })

            if (DEBUG) {
                var g = this.game.add.graphics(this.target.x, this.target.y);
                g.beginFill(0x000000);
                g.drawCircle(0, 0, 4);
                g.endFill();
                this.debugText = new Phaser.Text(game, 0, this.phone.height, '', { font: "36px Arial", fill: "#000000" });
                this.addChild(this.debugText);
                
                //this.phone.input.enableDrag(true);
                
            }
        }

        setStateRinging() {
            this.state = Phone.State.RINGING;
            this.phone.tint = 0xffcc00;
            this.ringingTween.isPaused ? this.ringingTween.resume() : this.ringingTween.start();
            this.flag.visible = false;
            this.countDownText.visible = false;
        }

        setStateWaitForPlayer(player: Player) {
            this.state = Phone.State.WAITING;
            this.player = player;
        }

        setStateAnswering() {
            this.state = Phone.State.ANSWERING;
            this.ringingTween.pause();
            this.phone.scale.setTo(1, 1);
            this.timer = 0;
            this.countDownText.visible = true;
            this.flag.loadTexture('fr', null);
            this.flag.visible = true;
        }

        setStateAnswered() {
            this.phone.tint = 0xdc1616;
            this.timer = -1;
            this.player.moveToCenter();
            //create checkmark anim?
            //this.phone.tint = 0x338000;
            setTimeout(() => { this.setStateAvailable() }, 2000);
            
        }
        setStateAvailable() {
            this.state = Phone.State.AVAILABLE;
            this.phone.tint = 0x000000;
            this.player = null;
            this.flag.visible = false;
            this.countDownText.visible = false;
            this.timer = -1;
        }


        update() {
            if (DEBUG) {
                //this.debugText.setText(this.position.toString());
            }

            if (this.state === Phone.State.WAITING && this.target.distance(this.player.position) < 100) {
                this.setStateAnswering();
            }
            if (this.state === Phone.State.RINGING) {
                var player = Object.keys((<GameState>this.game.state.getCurrentState()).players).map(k=> {
                    return (<GameState>this.game.state.getCurrentState()).players[k];
                }).filter(p => { return p.phone === null }).shift();
                if (player) {
                    player.moveToPhone(this);
                    this.setStateWaitForPlayer(player);
                }
            }
        }
    }
    module Phone {
        export enum State { AVAILABLE = 0, RINGING = 4, ANSWERING=8, WAITING = 9 };
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
        target: Phaser.Point = new Phaser.Point;
        home: Phaser.Point;
        color: number;
        phone: Phone = null;
        

        constructor(game: Phaser.Game, conf: PlayerConfig, i: number) {
            super(game, 400, 700, new Phaser.RenderTexture(game, 100, 100, 'empty'))
            this.home = new Phaser.Point(game.world.width / 2, game.world.height/3);
            this.anchor.setTo(0.5, 0.5);
            game.physics.p2.enable(this, DEBUG);
            this.body.setMaterial((<Game>this.game).playerMaterial);
            this.body.fixedRotation = true;
            this.body.damping = 0.9;
            this.body.angularDamping = 0.9;
            this.body.moveUp(60);
            var shadow = this.makeIcon(i, true)
            shadow.position.setTo(-44, -44);
            this.addChild(shadow);
            var icon = this.makeIcon(i);
            icon.position.setTo(-50, -50);
            this.addChild(icon);    
            this.moveToCenter();
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
                this.color = 0xffffff;
                graphics.beginFill(this.color);
                graphics.lineStyle(2, 0xffffff, 0.6);
                graphics.tint = 0x000000;
                graphics.alpha = 0.6;
            } else {
                this.color = colors[type];
                graphics.beginFill(this.color);
                graphics.lineStyle(2, 0xffffff);
            }
            this.drawIcon(graphics, type);
            graphics.endFill();
            return graphics;
        }

        moveToPhone(phone: Phone) {
            this.target.copyFrom(phone.target);
            this.phone = phone;
        }

        moveToCenter() {
            this.target.copyFrom(this.home);
            this.phone = null;
        }

        update() {
            var speed = 400;
            var angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.body.force.x = Math.cos(angle) * speed;    // accelerateToObject 
            this.body.force.y = Math.sin(angle) * speed;
            var trails = (<GameState>this.game.state.getCurrentState()).trailsBitmap;
            var s = '00' + this.color.toString(16);
            trails.context.fillStyle = '#' + s.substr(s.length - 6);
            trails.context.fillRect(this.x - this.width, this.y - this.height / 2, 4, 4);
            trails.dirty = true;
        }
    }
    module Player {
        export var SIZE: number = 100;
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