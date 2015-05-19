/// <reference path='phaser.comments.d.ts' />

module GestionAirTV {
    export class Game extends Phaser.Game {

        simulator: Simulator;

        constructor() {
            super(1920, 1080, Phaser.CANVAS, 'content', new MenuState());
        }

        boot() {
            super.boot();
            this.simulator = new Simulator(this);
        }

        update(time) {
            super.update(time);
            this.simulator.update();
        }

        gameState: GameState;

        handleEvent(event) {
            switch (event.type) {
                case 'GAME_START':
                    this.gameState = new GameState(event)
                    this.state.remove('game');
                    this.state.add('game', this.gameState, true);
                    break;
                case 'PHONE_RINGING':
                    this.gameState.phones[event.number].setStateRinging();
                    break;
                case 'PLAYER_ANSWERING':
                    var player = this.gameState.players[event.playerId];
                    var phone = this.gameState.phones[event.number];
                    if (player && phone) {
                        player.moveToPhone(phone);
                        phone.setStateWaitForPlayer(player);
                        phone.setFlag(event.flag);
                    }
                    break;
                case 'PLAYER_ANSWERED':
                    var player = this.gameState.players[event.playerId];
                    var phone = this.gameState.phones[event.number];
                    if (player && phone) {
                        player.jumpToPhone(phone);
                        phone.setStateAnswered(event.correct);
                    }
                    break;
                case 'GAME_END':
                    for (var key in this.gameState.phones) {
                        this.gameState.phones[key].setStateAvailable();
                    }
                    for (var key2 in this.gameState.players) {
                        this.gameState.players[key2].moveToExit();
                    }
                    break;
            }
            
        }
    }

    class Simulator{
        game: Game;
        state: string;
        timeouts: number[] = [];

        constructor(game: Game) {
            this.game = game;
            this.state = 'OFF';
            this.startSimulation();
        }

        startSimulation() {
            var duration = 60 * 1000;
            var intro = 6 * 1000;
            var outro = 6 * 1000;
            var gameStartEvent = {
                type: 'GAME_START',
                endTime: new Date(new Date().getTime() + duration),
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
            //plan end of round
            setTimeout(() => {
                this.game.handleEvent({
                    type: 'GAME_END'
                })
                this.state = 'OFF';
                //cancel pending timeouts
                this.timeouts.forEach(id => {
                    clearTimeout(id);
                });
                this.timeouts.splice(0);
                //timeout before next round
                setTimeout(this.startSimulation.bind(this), outro);
            }, duration);

            //start
            this.game.handleEvent(gameStartEvent);
            //wait intro
            setTimeout(() => {
                this.state = 'ON';
            }, intro);
            
        }

        update() {
            var phone: Phone;
            var player: Player;
            if (this.game.gameState && this.state === 'ON') {
                //make phones ring (max 2 phones not used)
                var availablePhones:Phone[] = Object.keys(this.game.gameState.phones).map(k=> {
                        return this.game.gameState.phones[k];
                    }).filter(phone => {
                        return phone.state === Phone.State.AVAILABLE;
                    });
                while (availablePhones.length > 2) {
                    phone = this.game.rnd.pick(availablePhones);
                    availablePhones.splice(availablePhones.indexOf(phone), 1);
                    this.game.handleEvent({
                        type: 'PHONE_RINGING',
                        number: phone.number
                });

                }

                //assign a free player to a ringing phone
                var ringingPhones: Phone[] = Object.keys(this.game.gameState.phones).map(k=> {
                        return this.game.gameState.phones[k];
                    }).filter(phone => {
                        return phone.state === Phone.State.RINGING;
                    });


                var freePlayers: Player[] = Object.keys(this.game.gameState.players).map(k=> {
                        return this.game.gameState.players[k];
                    }).filter(p => {
                        return p.phone === null
                    });

                phone = this.game.rnd.pick(ringingPhones);
                player = this.game.rnd.pick(freePlayers);
                if (player && phone) {
                    this.game.handleEvent({
                        type: 'PLAYER_ANSWERING',
                        playerId: player.id,
                        number: phone.number,
                        flag: this.game.rnd.pick(this.game.gameState.flags) //TODO depending on player already seen
                    });
                    // random time on phone and correct answer
                    this.timeouts.push(setTimeout(() => {
                        this.game.handleEvent({
                            type: 'PLAYER_ANSWERED',
                            playerId: player.id,
                            number: phone.number,
                            correct: this.game.rnd.integerInRange(0,1)
                        })
                    }, this.game.rnd.integerInRange(6,20) * 1000));
                }
            }
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
        id: number;
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
        flags: string[] = ['gb', 'de', 'fr'];

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
            this.flags.forEach(lg => {
                this.game.load.image(lg, 'images/flags/' + lg + '.png');
            });
        }

        create() {
            this.game.stage.backgroundColor = 0x10a2ff;

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

            this.game.add.text(1630, 1000, 'Gestion\'Air', { font: "48px Verdana", fill: "#ffffff" });
            
            this.trailsBitmap = this.game.add.bitmapData(1720, 700);
            this.game.add.image(100, 50, this.trailsBitmap, null);
            
            this.initData.phones.forEach(phoneData => {
                var phone = new Phone(this.game, phoneData);
                this.phones[phoneData.number] = phone;
                this.add.existing(phone);
            });

            this.initData.players.forEach((playerData, i) => {
                var playerScore = new PlayerScore(this.game, playerData, i)
                this.add.existing(playerScore);
                var t = this.game.time.create();
                t.start();
                t.add(i * 2000, () => {
                    var player = new Player(this.game, playerData, i, playerScore);
                    this.players[playerData.id] = player;
                    this.add.existing(player)
                }, this);
                
            });
        }

    }

    class Phone extends Phaser.Group {
        number: number;
        state: Phone.State = Phone.State.AVAILABLE;
        flag: Phaser.Image;
        phone: Phaser.Sprite;
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
                if (this.timer === -1) {
                    this.setStateRinging();
                }
                if (this.timer > 2) {
                    this.setStateAnswered(false);
                }
                if (isDoubleClick(pointer)) {
                    if (this.timer > 2) {
                        this.setStateAnswered(false);
                    } else {
                        this.setStateAnswering();
                    }

                }
            })

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

        setFlag(flag: string) {
            this.flag.loadTexture(flag, null);
            this.flag.name = flag;
        }

        setStateAnswering() {
            this.state = Phone.State.ANSWERING;
            this.phone.tint = 0xffa200;
            this.ringingTween.pause();
            this.phone.scale.setTo(1, 1);
            this.timer = 0;
            this.countDownText.visible = true;
            this.flag.visible = true;
        }

        setStateAnswered(correct:boolean) {
            if (correct) {
                this.phone.tint = 0x338000;
            } else {
                this.phone.tint = 0xdc1616;
            }
            this.timer = -1;
            this.player.moveToHome();
            
            //TODO create checkmark anim? + add to playerScore


            setTimeout(() => { this.setStateAvailable() }, 2000);
            
        }
        setStateAvailable() {
            this.state = Phone.State.AVAILABLE;
            this.ringingTween.pause();
            this.phone.scale.setTo(1, 1);
            this.phone.tint = 0x000000;
            this.player = null;
            this.flag.visible = false;
            this.countDownText.visible = false;
            this.timer = -1;
        }


        update() {
            if (this.state === Phone.State.WAITING && this.target.distance(this.player.position) < 1) {
                this.setStateAnswering();
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
        tween: Phaser.Tween;
        playerScore: PlayerScore;

        constructor(game: Phaser.Game, conf: PlayerConfig, i: number, playerScore: PlayerScore) {
            super(game, 400, 700, new Phaser.RenderTexture(game, 100, 100, 'empty'))
            this.id = conf.id;
            this.home = new Phaser.Point(game.world.width / 2 - ((-3 + i) * (Player.SIZE + 20)), game.world.height/3);
            this.anchor.setTo(0.5, 0.5);
            this.color = Player.colors[i];
            this.addChild(new PlayerIcon(game, 0, 0, i, this.color));
            this.playerScore = playerScore;
            this.moveToHome();
        }

        moveToPhone(phone: Phone) {
            this.target.copyFrom(phone.target);
            this.phone = phone;
            this.moveToTarget();
        }

        jumpToPhone(phone: Phone) {
            if (this.tween) {
                this.tween.stop();
            }
            this.position.copyFrom(phone.target);
            this.phone = phone;
        }

        moveToHome() {
            this.target.copyFrom(this.home);
            this.phone = null;
            this.moveToTarget();
        }

        moveToExit() {
            this.target.setTo(1400, 700);
            this.phone = null;
            this.moveToTarget();
            this.tween.onComplete.add(()=>{
                this.destroy();
            });
        }

        moveToTarget() {
            if (this.tween) {
                this.tween.stop();
            }
            this.tween = this.game.add.tween(this).to(this.target, Math.abs(this.target.distance(this.position)/200)*1000 , Phaser.Easing.Sinusoidal.InOut, true, 0, 0, false);
        }

        update() {

            var trails = (<GameState>this.game.state.getCurrentState()).trailsBitmap;
            var s = '00' + this.color.toString(16);
            trails.context.beginPath();
            trails.context.fillStyle = '#' + s.substr(s.length - 6);
            trails.context.arc(this.x - this.width, this.y - this.height / 2, 2, 0, 360, false);
            trails.context.closePath();
            trails.context.fill();
            trails.dirty = true;

        }
    }

    class PlayerIcon extends Phaser.Graphics {
        constructor(game, x, y, type, color) {
            super(game, x, y);
            var shadow = this.makeIcon(type, null, true)
            shadow.position.setTo(-44, -44);
            this.addChild(shadow);
            var icon = this.makeIcon(type, color);
            icon.position.setTo(-50, -50);
            this.addChild(icon);
        }

        drawIcon(graphics: Phaser.Graphics, type) {
            if (type === 0) { //star 5
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 35, 30, 2, 35, 26, 58, 21, 90, 50, 75, 79, 90, 74, 58, 98, 35, 65, 30, 50,0).points);
            } else if (type === 1) { //square
                graphics.drawPolygon(new Phaser.Polygon(5, 5, 5, 95, 95, 95, 95, 5, 5,5).points);
            } else if (type === 2) { //triangle
                graphics.drawPolygon(new Phaser.Polygon(0, 86, 100, 86, 50, 0, 0,86).points);
            } else if (type === 3) { //penta
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 2, 35, 21, 90, 79, 90, 98, 35, 50,0).points);
            } else if (type === 4) { //star 4
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 35, 35, 0, 50, 35, 65, 50, 100, 65, 65, 100, 50, 65, 35, 50,0).points);
            } else if (type === 5) { //circle
                graphics.drawCircle(50, 50, 100);
            }
        }

        makeIcon(type: number, color, shadow?) {
            var graphics = new Phaser.Graphics(this.game, 0, 0);
            if (shadow) {
                graphics.beginFill(0xffffff);
                graphics.tint = 0x000000;
                graphics.alpha = 0.6;
            } else {
                graphics.beginFill(color);
                graphics.lineStyle(2, 0xffffff);
            }
            this.drawIcon(graphics, type);
            graphics.endFill();
            return graphics;
        }

    }

    module Player {
        export var SIZE: number = 100;
        export var colors = [0xffcc00, 0xff0066, 0xabc837, 0x0055d4, 0xff6600, 0xc87137];
    }

    class PlayerScore extends Phaser.Graphics {


        constructor(game: Phaser.Game, conf:PlayerConfig, i: number) {
            super(game,(i % 3) * 500 + 200, 850 + (i>2 ? 150 : 0));
            game.state.getCurrentState().add.existing(this);
            this.addChild(new PlayerIcon(game, 0, 0, i, Player.colors[i]));
            var text = new Phaser.Text(game, 80, -50, conf.name, { font: "48px Arial", fill: "#ffffff" });
                text.setShadow(2, 2, 'rgba(0, 0, 0, 0.5)');
            this.addChild(text);
        }

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