/// <reference path='../../typings/tsd.d.ts' />

module GestionAirTV {

    declare var SockJS;
    declare var Stomp;

    export class Game extends Phaser.Game {

        simulator: Simulator;
        scoreboard: Scoreboard;
        menuState: MenuState;
        menuTimeout: number;

        constructor() {
            this.menuState = new MenuState();
            super(1920, 1080, Phaser.CANVAS, 'content', this.menuState);
        }

        boot() {
            super.boot();
            this.scoreboard = new Scoreboard();
            this.scoreboard.toggle(false);

            this.input.keyboard.enabled = true;
            this.input.resetLocked = true;
            var enterHandler = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            enterHandler.onDown.add(()=>{
                this.scoreboard.toggle(undefined);
            });

            if(window.location.hash === '#sim'){
                this.simulator = new Simulator(this);
            }else{
                this.serverConnection();
            }
        }

        serverConnection(){
            var client;

            var onConnect =  () => {
                jQuery('#error').hide();
                client.subscribe('/queue/simulator', (message) => {
                    try {
                        this.handleEvent(JSON.parse(message.body));
                    } catch (e) {
                        console.log('error', e);
                        console.log(message.body);
                    }
                });
            };

            var debug = (m) => {
                console.log(m);
            };

            var stompConnect = () => {
                var ws = new SockJS('http://192.168.1.1:15674/stomp');
                client = Stomp.over(ws);

                //disable unsupported heart-beat
                client.heartbeat.outgoing = 0;
                client.heartbeat.incoming = 0;
                client.debug = debug;
                client.connect('guest', 'guest', onConnect, failureConnect, '/');
            }

            var failureConnect = () => {
                jQuery('#error').text('connection error, retrying...').show();
                setTimeout(stompConnect, 10000);
            };

            stompConnect();
        }

        update(time) {
            super.update(time);
            if(this.simulator){
                this.simulator.update();
            }
        }

        gameState: GameState;

        handleEvent(event) {
            switch (event.type) {
                case 'GAME_START':
                    if(this.menuTimeout){
                       clearTimeout(this.menuTimeout);
                       this.menuTimeout = undefined;
                    }
                    this.gameState = new GameState(event);
                    this.state.remove('game');
                    this.state.add('game', this.gameState, true);
                    //auto hide scores after delay
                    setTimeout(()=>{
                        this.scoreboard.toggle(false);
                    }, 20000);
                    break;
                case 'PHONE_RINGING':
                    if(this.gameState && this.gameState.phones[event.number]){
                        this.gameState.phones[event.number].setStateRinging();
                    }
                    break;
                case 'PLAYER_ANSWERING':
                    if(this.gameState && this.gameState.players && this.gameState.phones){
                        var player = this.gameState.players[event.playerId];
                        var phone = this.gameState.phones[event.number];
                        if (player && phone) {
                            player.moveToPhone(phone);
                            phone.setStateWaitForPlayer(player);
                            phone.setFlag(event.flag);
                        }
                    }
                    break;
                case 'PLAYER_ANSWERED':
                    if(this.gameState && this.gameState.players && this.gameState.phones){
                        var player = this.gameState.players[event.playerId];
                        var phone = this.gameState.phones[event.number];
                        if (player && phone) {
                            player.jumpToPhone(phone);
                            phone.setStateAnswered(event.correct);
                        }
                    }
                    break;
                case 'GAME_END':
                    for (var key in this.gameState.phones) {
                        this.gameState.phones[key].setStateAvailable();
                    }
                    for (var key2 in this.gameState.players) {
                        this.gameState.players[key2].moveToExit();
                    }
                    this.menuTimeout = setTimeout(()=>{
                        this.gameState = undefined;
                        this.state.remove('game');
                        this.state.add('game', this.menuState, true);
                    }, 30000);
                    this.scoreboard.build(event.scores);
                    break;
            }

        }
    }

    class Scoreboard{

        $element:JQuery;
        $tbody:JQuery;

        constructor(){
            this.$element = jQuery('#scoreboard');
            this.$tbody = this.$element.find('tbody');
        }

        build(scores){
            this.$tbody.empty();
            scores.forEach((item, idx) => {
                this.$tbody.append('<tr><td>' + (idx + 1) + '</td><td>' + item.name
                    + '<div>'
                    + item.languages.map((code:any)=>{
                        return '<span class="flag"><span class="' + (code.correct ? 'correct' : 'wrong') + '"></span><img src="images/flags/' + code.lang + '.png"></span>'
                    }).join('')
                    + '</div></td><td>' + item.score + '</td></tr>');
            });
            this.toggle(true);
        }

        toggle(show){
            if(show === undefined){
                this.$element.fadeToggle()
            }else if(show){
                this.$element.fadeIn();
            }else{
                this.$element.fadeOut();
            }

        }
    }

    class Simulator{
        game: Game;
        state: string;
        timeouts: number[] = [];
        scores: any = {};

        constructor(game: Game) {
            this.game = game;
            this.state = 'OFF';
            this.startSimulation();
        }

        startSimulation() {
            var duration = 60 * 1000;
            var intro = 6 * 1000;
            var outro = 6 * 1000;
            this.scores = [{name: 'Alice', score: 0, languages: []},
                {name: 'Bertrand', score: 0, languages:[]},
                {name: 'Charles', score: 0, languages:[]},
                {name: 'Delphine', score: 0, languages:[]},
                {name: 'Elisabeth', score: 0, languages:[]},
                {name: 'Felicitas', score: 0, languages:[]}]
            var gameStartEvent = {
                type: 'GAME_START',
                endTime: new Date(new Date().getTime() + duration+intro).toISOString(),
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
                //sort scores
                this.game.handleEvent({
                    type: 'GAME_END',
                    scores: this.scores.sort(function(a,b){
                        return b.score - a.score;
                    })
                })
                this.state = 'OFF';
                //cancel pending timeouts
                this.timeouts.forEach(id => {
                    clearTimeout(id);
                });
                this.timeouts.splice(0);

                //timeout before next round
                setTimeout(this.startSimulation.bind(this), outro + this.game.rnd.between(10,50)*1000);
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
                    var flag = this.game.rnd.pick(this.game.gameState.flags);
                    this.game.handleEvent({
                        type: 'PLAYER_ANSWERING',
                        playerId: player.id,
                        number: phone.number,
                        flag: flag //TODO depending on player already seen
                    });
                    // random time on phone and correct answer
                    this.timeouts.push(setTimeout(() => {
                        var correct = this.game.rnd.integerInRange(0,1);
                        var score = this.scores[player.id-1];
                        score.score +=correct;
                        score.languages.push({lang: flag, correct: correct});
                        this.game.handleEvent({
                            type: 'PLAYER_ANSWERED',
                            playerId: player.id,
                            number: phone.number,
                            correct: correct
                        })
                    }, this.game.rnd.integerInRange(6,20) * 1000));
                }
            }
        }
    }

    export module Game {
        export var COLOR_CORRECT: number = 0x338000;
        export var COLOR_WRONG: number = 0xdc1616;

    }

    class MenuState extends Phaser.State {
        preload() {
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.load.image('logo', 'images/background.png');
        }

        create() {
            var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
            logo.anchor.setTo(0.5, 0.5);
        }
    }

    interface GameStateConfig {
        players: Array<any>;
        phones: Array<PhoneConfig>;
        endTime: any;
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
        flags: string[] = ['hr','ne','de','fr','es','it','pt','ro','ru','hu','ku','en','vn','ch'];
        progressBar: Phaser.Graphics;
        duration: number;

        constructor(init:GameStateConfig) {
            super();
            this.initData = init;
            this.initData.endTime = new Date(this.initData.endTime);
            this.duration = this.initData.endTime.getTime() - new Date().getTime();
        }

        preload() {
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.load.image('phone', 'images/phone72.png');
            this.game.load.image('correct', 'images/checked21.png');
            this.game.load.image('wrong', 'images/delete102.png');
            this.game.load.bitmapFont('digital-7', 'images/fonts/digital-7.mono.png', 'images/fonts/digital-7.mono.xml');
            this.flags.forEach(lg => {
                this.game.load.image(lg, 'images/flags/' + lg + '.png');
            });
        }

        create() {
            this.game.stage.backgroundColor = 0x0098D8;

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

            this.game.add.text(1630, 1000, 'Gestion´Air', { font: "48px Verdana", fill: "#ffffff" });

            this.progressBar = this.game.add.graphics(100, 30);
            this.progressBar.beginFill(0xff0000);
            this.progressBar.drawRect(0, 0, 1720, 20);
            this.progressBar.endFill();

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
        update() {
            this.progressBar.width = Math.min(1720, Math.max(Math.round(1720 * ((this.initData.endTime.getTime() - new Date().getTime()) / this.duration)),0));
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
                this.phone.tint = Game.COLOR_CORRECT;
            } else {
                this.phone.tint = Game.COLOR_WRONG;
            }
            this.timer = -1;
            this.player.moveToHome();
            //TODO create checkmark anim? + add to playerScore
            this.player.playerScore.addAnswer(this.flag.name, correct);

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

        answerCount:number = 0;

        constructor(game: Phaser.Game, conf:PlayerConfig, i: number) {
            super(game,(i % 3) * 500 + 200, 850 + (i>2 ? 150 : 0));
            game.state.getCurrentState().add.existing(this);
            this.addChild(new PlayerIcon(game, 0, 0, i, Player.colors[i]));
            var text = new Phaser.Text(game, 80, -56, conf.name, { font: "48px Arial", fill: "#ffffff" });
                text.setShadow(2, 2, 'rgba(0, 0, 0, 0.5)');
            this.addChild(text);
        }

        addAnswer(flagLang:string, correct:boolean) {
            var flag: Phaser.Sprite = this.game.make.sprite(80 + 80*this.answerCount, 0, flagLang);
            flag.scale.set(0.1);
            this.addChild(flag);
            var check: Phaser.Sprite = this.game.make.sprite(90 + 80* this.answerCount, 10, correct ? 'correct' : 'wrong');
            check.scale.set(0.08);
            check.tint = correct ? Game.COLOR_CORRECT : Game.COLOR_WRONG;
            this.addChild(check);
            this.answerCount++;
        }
    }

}
var gestionAirTV;
window.onload = () => {

    gestionAirTV = new GestionAirTV.Game();

};