/// <reference path='phaser.comments.d.ts' />

module GestionAirTV {
    export class Game {
        game: Phaser.Game;

        constructor() {
            this.game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'content', new MenuState());
        }

        handleEvent() {
            var event = {
                type: 'Game',
                state: 'start',
                endTime: new Date(new Date().getTime() + 10000),
                players: [
                    { id: 1, name: 'A' },
                    { id: 2, name: 'B' },
                    { id: 3, name: 'C' }
                ],
                phones: [
                    { number: 111, x: 0, y: 0, orientation: 0 },
                    { number: 222, x: 200, y: 200, orientation: 180 }
                ]
            };
            var state = new GameState(event)
            this.game.state.remove('game');
            this.game.state.add('game', state, true);
        }

    }

    class MenuState extends Phaser.State {
        preload() {
            this.game.load.image('logo', 'images/phaser-logo-small.png');
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
        countDownText: Phaser.BitmapText;

        constructor(init:GameStateConfig) {
            super();
            this.initData = init;
        }

        preload() {
            this.game.load.image('phone', 'images/phone72.png');
            this.game.load.image('correct', 'images/checked21.png');
            this.game.load.image('wrong', 'images/delete102.png');
            this.game.load.image('fr', 'images/flags/fr.png');
            this.game.load.bitmapFont('digital-7', 'fonts/digital-7.mono.png', 'fonts/digital-7.mono.xml');
        }

        create() {
            this.game.stage.backgroundColor = 0xffffff;
            this.initData.phones.forEach(phoneData => {
                var phone = new Phone(this.game, phoneData);
                phone.inputEnabled = true;
                phone.input.enableDrag(true);
                phone.tint = 0x00ff00;
                phone.scale.setTo(0.3, 0.3);
                phone.events.onInputDown.add((sprite:Phone, pointer) => {
                    sprite.tint = 0xff0000;
                })
                this.phones[phoneData.number] = phone;
                this.add.existing(phone);
            });
            var timer:number = 0;
            var timerEvent = this.time.events.loop(Phaser.Timer.SECOND, function(){
                timer++;
                var s = '0' + timer;
                this.countDownText.setText(s.substr(s.length-2));
            }, this);
            this.countDownText = this.add.bitmapText(200, 100, 'digital-7', '00', 96);

            var correct = this.add.sprite(400, 400, 'correct');
            correct.tint = 0x00ff00;
            var wrong = this.add.sprite(400, 800, 'wrong');
            wrong.tint = 0xff0000;
            //this.add.text(0, 100, String(timer), { font: "65px Arial", fill: "#ff0044", align: "center" });
        }
    }

    class Phone extends Phaser.Sprite {
        number: number;
        state: Phone.State;
        player: Player;
        flag: string;

        constructor(game: Phaser.Game, conf:PhoneConfig) {
            super(game, conf.x, conf.y, 'phone')
            this.number = conf.number;
            var flag = new Phaser.Sprite(game, 0, 0, 'fr');
            this.addChild(flag);
        }
    }
    module Phone {
        export enum State { RINGING = 1 };
    }

    class Player {
        id: number;
        name: string;
        score: number = 0;

    }

    class PlayerScore {

    }



    /* Phone
    - Has an id
    - Has a flag/language (or hosts a question)
    - A state: (not_connected(out of order))/ready/ringing/in-use/(cool-down)
    - hosts a player?
    */
    /* Player
    - has an id
    - has color (or linked to id)
    - has a score
    - A state: Answering Question,finished answering = display new result/(moved to a new phone =answering question)
    - Anitation success/failure (on entering finished answering state)
       - moveTo followef by answering (timer) for answering question test
    - At a phone id?
    - array of phones visited? (= display trail)
    - avg answer time?
    - number of right / wrong questions? / list of answered questions
    */
    /*
    labels and score 
    */
    /*
    Scoreboard
    display current game session scrores
    display overall score? animate current to overall?
    */
    /*
    Timer display next schedule, current time, wait?
    */
}
var gestionAirTV;
window.onload = () => {

    gestionAirTV = new GestionAirTV.Game();

};