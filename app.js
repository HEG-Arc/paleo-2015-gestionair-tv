/// <reference path='phaser.comments.d.ts' />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var GestionAirTV;
(function (GestionAirTV) {
    var Game = (function () {
        function Game() {
            this.game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'content', new MenuState());
        }
        Game.prototype.handleEvent = function () {
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
            var state = new GameState(event);
            this.game.state.remove('game');
            this.game.state.add('game', state, true);
        };
        return Game;
    })();
    GestionAirTV.Game = Game;
    var MenuState = (function (_super) {
        __extends(MenuState, _super);
        function MenuState() {
            _super.apply(this, arguments);
        }
        MenuState.prototype.preload = function () {
            this.game.load.image('logo', 'images/phaser-logo-small.png');
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        };
        MenuState.prototype.create = function () {
            var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
            logo.anchor.setTo(0.5, 0.5);
            logo.scale.setTo(0.2, 0.2);
            this.game.add.tween(logo.scale).to({ x: 1, y: 1 }, 2000, Phaser.Easing.Bounce.Out, true);
            logo.inputEnabled = true;
            logo.events.onInputDown.add(function (sprite, pointer) {
                gestionAirTV.handleEvent();
            }, this);
        };
        return MenuState;
    })(Phaser.State);
    var GameState = (function (_super) {
        __extends(GameState, _super);
        function GameState(init) {
            _super.call(this);
            this.phones = {};
            this.players = {};
            this.initData = init;
        }
        GameState.prototype.preload = function () {
            this.game.load.image('phone', 'images/phone72.png');
            this.game.load.image('correct', 'images/checked21.png');
            this.game.load.image('wrong', 'images/delete102.png');
            this.game.load.image('fr', 'images/flags/fr.png');
            this.game.load.bitmapFont('digital-7', 'fonts/digital-7.mono.png', 'fonts/digital-7.mono.xml');
        };
        GameState.prototype.create = function () {
            var _this = this;
            this.game.stage.backgroundColor = 0xffffff;
            this.initData.phones.forEach(function (phoneData) {
                var phone = new Phone(_this.game, phoneData);
                phone.inputEnabled = true;
                phone.input.enableDrag(true);
                phone.tint = 0x00ff00;
                phone.scale.setTo(0.3, 0.3);
                phone.events.onInputDown.add(function (sprite, pointer) {
                    sprite.tint = 0xff0000;
                });
                _this.phones[phoneData.number] = phone;
                _this.add.existing(phone);
            });
            var timer = 0;
            var timerEvent = this.time.events.loop(Phaser.Timer.SECOND, function () {
                timer++;
                var s = '0' + timer;
                this.countDownText.setText(s.substr(s.length - 2));
            }, this);
            this.countDownText = this.add.bitmapText(200, 100, 'digital-7', '00', 96);
            var correct = this.add.sprite(400, 400, 'correct');
            correct.tint = 0x00ff00;
            var wrong = this.add.sprite(400, 800, 'wrong');
            wrong.tint = 0xff0000;
            //this.add.text(0, 100, String(timer), { font: "65px Arial", fill: "#ff0044", align: "center" });
        };
        return GameState;
    })(Phaser.State);
    var Phone = (function (_super) {
        __extends(Phone, _super);
        function Phone(game, conf) {
            _super.call(this, game, conf.x, conf.y, 'phone');
            this.number = conf.number;
            var flag = new Phaser.Sprite(game, 0, 0, 'fr');
            this.addChild(flag);
        }
        return Phone;
    })(Phaser.Sprite);
    var Phone;
    (function (Phone) {
        (function (State) {
            State[State["RINGING"] = 1] = "RINGING";
        })(Phone.State || (Phone.State = {}));
        var State = Phone.State;
        ;
    })(Phone || (Phone = {}));
    var Player = (function () {
        function Player() {
            this.score = 0;
        }
        return Player;
    })();
    var PlayerScore = (function () {
        function PlayerScore() {
        }
        return PlayerScore;
    })();
})(GestionAirTV || (GestionAirTV = {}));
var gestionAirTV;
window.onload = function () {
    gestionAirTV = new GestionAirTV.Game();
};
//# sourceMappingURL=app.js.map