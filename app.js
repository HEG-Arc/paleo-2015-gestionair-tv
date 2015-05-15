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
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', new MenuState());
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
            this.game.load.image('phone', 'images/flags/fr.png');
        };
        GameState.prototype.create = function () {
            var _this = this;
            this.initData.phones.forEach(function (phoneData) {
                var phone = new Phone(_this.game, phoneData);
                _this.phones[phoneData.number] = phone;
                _this.add.existing(phone);
            });
        };
        return GameState;
    })(Phaser.State);
    var Phone = (function (_super) {
        __extends(Phone, _super);
        function Phone(game, conf) {
            _super.call(this, game, conf.x, conf.y, 'phone');
            this.number = conf.number;
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
})(GestionAirTV || (GestionAirTV = {}));
var gestionAirTV;
window.onload = function () {
    gestionAirTV = new GestionAirTV.Game();
};
//# sourceMappingURL=app.js.map