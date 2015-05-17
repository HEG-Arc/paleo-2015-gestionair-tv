/// <reference path='phaser.comments.d.ts' />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var GestionAirTV;
(function (GestionAirTV) {
    var DEBUG = true;
    var Game = (function () {
        function Game() {
            this.game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'content', new MenuState());
            this.handleEvent();
        }
        Game.prototype.handleEvent = function () {
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
                    { number: 1, x: 400, y: 60, orientation: 2 /* BOTTOM */ },
                    { number: 2, x: 700, y: 60, orientation: 2 /* BOTTOM */ },
                    { number: 3, x: 1000, y: 60, orientation: 2 /* BOTTOM */ },
                    { number: 4, x: 1300, y: 60, orientation: 2 /* BOTTOM */ },
                    { number: 5, x: 1690, y: 200, orientation: 3 /* LEFT */ },
                    { number: 6, x: 1690, y: 460, orientation: 3 /* LEFT */ },
                    { number: 7, x: 1100, y: 620, orientation: 0 /* TOP */ },
                    { number: 8, x: 700, y: 620, orientation: 0 /* TOP */ },
                    { number: 9, x: 100, y: 460, orientation: 1 /* RIGHT */ },
                    { number: 10, x: 100, y: 200, orientation: 1 /* RIGHT */ }
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
            //this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
            var _this = this;
            //this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.load.image('phone', 'images/phone72.png');
            this.game.load.image('correct', 'images/checked21.png');
            this.game.load.image('wrong', 'images/delete102.png');
            this.game.load.bitmapFont('digital-7', 'fonts/digital-7.mono.png', 'fonts/digital-7.mono.xml');
            ['gb', 'de', 'fr'].forEach(function (lg) {
                _this.game.load.image(lg, 'images/flags/' + lg + '.png');
            });
        };
        GameState.prototype.create = function () {
            var _this = this;
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
            this.initData.phones.forEach(function (phoneData) {
                var phone = new Phone(_this.game, phoneData);
                _this.phones[phoneData.number] = phone;
                _this.add.existing(phone);
            });
            this.initData.players.forEach(function (playerData, i) {
                var player = new Player(_this.game, playerData, i);
                player.inputEnabled = true;
                player.input.enableDrag();
                if (i === 0) {
                    player.body.allowGravity = false;
                }
                _this.players[playerData.id] = player;
                var t = _this.game.time.create();
                t.start();
                t.add(i * 2000, function (args) {
                    _this.add.existing(player);
                    console.log(args);
                }, _this, player);
            });
            //this.add.text(0, 100, String(timer), { font: "65px Arial", fill: "#ff0044", align: "center" });
        };
        GameState.prototype.update = function () {
            var _this = this;
            var playersArray = Object.keys(this.players).map(function (k) {
                return _this.players[k];
            });
            this.game.physics.arcade.collide(playersArray, playersArray);
            var phonesArray = Object.keys(this.phones).map(function (k) {
                return _this.phones[k].phone;
            });
            this.game.physics.arcade.collide(playersArray, phonesArray);
        };
        GameState.prototype.render = function () {
            if (this.players[1]) {
                this.game.debug.bodyInfo(this.players[1], 32, 32);
                this.game.debug.body(this.players[1]);
            }
        };
        return GameState;
    })(Phaser.State);
    var Phone = (function (_super) {
        __extends(Phone, _super);
        function Phone(game, conf) {
            var _this = this;
            _super.call(this, game, null, 'phone', true);
            this.state = 0 /* AVAILABLE */;
            this.timer = -1;
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
            if (conf.orientation === 2 /* BOTTOM */ || conf.orientation === 0 /* TOP */) {
                this.flag.position.setTo(this.phone.width, 0);
            }
            else {
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
            if (conf.orientation === 2 /* BOTTOM */) {
                this.countDownText.position.setTo(this.phone.width, this.phone.height);
            }
            else if (conf.orientation === 0 /* TOP */) {
                this.countDownText.position.setTo(this.phone.width, -this.countDownText.height);
            }
            else if (conf.orientation === 1 /* RIGHT */) {
                this.countDownText.position.setTo(this.phone.width, -this.countDownText.height);
            }
            else if (conf.orientation === 3 /* LEFT */) {
                this.countDownText.position.setTo(-this.countDownText.width, -this.countDownText.height);
            }
            this.addChild(this.countDownText);
            var dClickLast;
            function isDoubleClick(o_pointer) {
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
                this.phone.events.onInputUp.add(function (phone, pointer) {
                    //this.position.setTo(pointer.x - this.phone.width / 2, pointer.y - this.phone.height / 2);
                    //this.phone.position.set(this.phone.width / 2, this.phone.height / 2);
                    if (_this.timer === -1) {
                        _this.setStateRinging();
                    }
                    if (isDoubleClick(pointer)) {
                        if (_this.timer > 2) {
                            _this.setStateAnswered();
                        }
                        else {
                            _this.setStateAnswering();
                        }
                    }
                });
            }
            this.setStateAnswering();
        }
        Phone.prototype.setStateRinging = function () {
            this.phone.tint = 0xffcc00;
            this.ringingTween.isPaused ? this.ringingTween.resume() : this.ringingTween.start();
            this.flag.visible = false;
            this.countDownText.visible = false;
        };
        Phone.prototype.setStateAnswering = function () {
            this.ringingTween.pause();
            this.phone.scale.setTo(1, 1);
            this.timer = 0;
            this.countDownText.visible = true;
            this.flag.loadTexture('fr', null);
            this.flag.visible = true;
            //get coordinates for player
        };
        Phone.prototype.setStateAnswered = function () {
            this.phone.tint = 0xdc1616;
            this.timer = -1;
            //338000
            //create checkmark anim? 
        };
        Phone.prototype.update = function () {
            if (DEBUG) {
            }
        };
        return Phone;
    })(Phaser.Group);
    var Phone;
    (function (Phone) {
        (function (State) {
            State[State["AVAILABLE"] = 0] = "AVAILABLE";
            State[State["RINGING"] = 4] = "RINGING";
        })(Phone.State || (Phone.State = {}));
        var State = Phone.State;
        ;
        (function (Orientation) {
            Orientation[Orientation["TOP"] = 0] = "TOP";
            Orientation[Orientation["RIGHT"] = 1] = "RIGHT";
            Orientation[Orientation["BOTTOM"] = 2] = "BOTTOM";
            Orientation[Orientation["LEFT"] = 3] = "LEFT";
        })(Phone.Orientation || (Phone.Orientation = {}));
        var Orientation = Phone.Orientation;
    })(Phone || (Phone = {}));
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, conf, i) {
            _super.call(this, game, 300, 600, new Phaser.RenderTexture(game, 100, 100, 'empty'));
            this.score = 0;
            this.target = new Phaser.Point(game.world.width / 2, game.world.height / 3);
            game.physics.enable(this, Phaser.Physics.ARCADE, true);
            this.body.collideWorldBounds = true;
            var shadow = this.makeIcon(i, true);
            shadow.position.setTo(6, 6);
            this.addChild(shadow);
            this.addChild(this.makeIcon(i));
        }
        Player.prototype.drawIcon = function (graphics, type) {
            if (type === 0) {
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 35, 30, 2, 35, 26, 58, 21, 90, 50, 75, 79, 90, 74, 58, 98, 35, 65, 30).points);
            }
            else if (type === 1) {
                graphics.drawPolygon(new Phaser.Polygon(5, 5, 5, 95, 95, 95, 95, 5).points);
            }
            else if (type === 2) {
                graphics.drawPolygon(new Phaser.Polygon(0, 86, 100, 86, 50, 0).points);
            }
            else if (type === 3) {
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 2, 35, 21, 90, 79, 90, 98, 35).points);
            }
            else if (type === 4) {
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 35, 35, 0, 50, 35, 65, 50, 100, 65, 65, 100, 50, 65, 35).points);
            }
            else if (type === 5) {
                graphics.drawCircle(50, 50, 100);
            }
        };
        Player.prototype.makeIcon = function (type, shadow) {
            var colors = [0xffcc00, 0xff0066, 0xabc837, 0x0055d4, 0xff6600, 0xc87137];
            var graphics = new Phaser.Graphics(this.game, 0, 0);
            if (shadow) {
                graphics.beginFill(0xffffff);
                graphics.lineStyle(2, 0xffffff, 0.6);
                graphics.tint = 0x000000;
                graphics.alpha = 0.6;
            }
            else {
                graphics.beginFill(colors[type]);
                graphics.lineStyle(2, 0xffffff);
            }
            this.drawIcon(graphics, type);
            graphics.endFill();
            return graphics;
        };
        Player.prototype.update = function () {
            if (this.position.distance(this.target, true) > 100) {
                this.game.physics.arcade.moveToXY(this, this.target.x, this.target.y, 200);
            }
            else {
                this.game.physics.arcade.moveToXY(this, this.target.x, this.target.y, 10);
            }
        };
        return Player;
    })(Phaser.Sprite);
    var PlayerScore = (function () {
        function PlayerScore() {
        }
        PlayerScore.prototype.addAnswer = function () {
            /*
            var correct = this.add.sprite(400, 400, 'correct');
            correct.tint = 0x00ff00;
            var wrong = this.add.sprite(400, 800, 'wrong');
            wrong.tint = 0xff0000;
            */
        };
        return PlayerScore;
    })();
})(GestionAirTV || (GestionAirTV = {}));
var gestionAirTV;
window.onload = function () {
    gestionAirTV = new GestionAirTV.Game();
};
//# sourceMappingURL=app.js.map