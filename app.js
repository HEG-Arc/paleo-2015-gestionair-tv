/// <reference path='phaser.comments.d.ts' />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var GestionAirTV;
(function (GestionAirTV) {
    var DEBUG = false;
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 1920, 1080, Phaser.AUTO, 'content', new MenuState());
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
            this.gameState = new GameState(event);
            this.state.remove('game');
            this.state.add('game', this.gameState, true);
        };
        Game.prototype.debugRinging = function (number) {
            this.gameState.phones[number].setStateRinging();
        };
        Game.prototype.debugAnswering = function (id, number) {
            var player = this.gameState.players[id];
            var phone = this.gameState.phones[number];
            player.moveToPhone(phone);
            phone.setStateWaitForPlayer(player);
        };
        return Game;
    })(Phaser.Game);
    GestionAirTV.Game = Game;
    var MenuState = (function (_super) {
        __extends(MenuState, _super);
        function MenuState() {
            _super.apply(this, arguments);
        }
        MenuState.prototype.preload = function () {
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
            this.physics.startSystem(Phaser.Physics.P2JS);
            this.game.phoneMaterial = new Phaser.Physics.P2.Material('phoneMaterial');
            this.game.playerMaterial = new Phaser.Physics.P2.Material('playerMaterial');
            var contactMaterialPhonePlayer = this.physics.p2.createContactMaterial(this.game.phoneMaterial, this.game.playerMaterial);
            contactMaterialPhonePlayer.friction = 10; // Friction to use in the contact of these two materials.
            contactMaterialPhonePlayer.restitution = 0.0; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.
            var contactMaterialPlayerPlayer = this.physics.p2.createContactMaterial(this.game.playerMaterial, this.game.playerMaterial);
            contactMaterialPlayerPlayer.friction = 0.2; // Friction to use in the contact of these two materials.
            contactMaterialPlayerPlayer.restitution = 1.0; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.
            contactMaterialPlayerPlayer.surfaceVelocity = 5; // Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.
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
            this.initData.phones.forEach(function (phoneData) {
                var phone = new Phone(_this.game, phoneData);
                _this.phones[phoneData.number] = phone;
                _this.add.existing(phone);
            });
            this.initData.players.forEach(function (playerData, i) {
                var t = _this.game.time.create();
                t.start();
                t.add(i * 2000, function () {
                    var player = new Player(_this.game, playerData, i);
                    _this.players[playerData.id] = player;
                    _this.add.existing(player);
                }, _this);
            });
        };
        GameState.prototype.update = function () {
        };
        GameState.prototype.render = function () {
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
            var body = game.physics.p2.createBody(this.x + this.phone.width / 2, this.y + this.phone.height / 2, 0, true);
            body.setRectangleFromSprite(this.phone);
            body.setMaterial(this.game.phoneMaterial);
            body.debug = DEBUG;
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
                this.target = new Phaser.Point(this.x + this.phone.width / 2, this.y + this.phone.height + Player.SIZE / 2);
            }
            else if (conf.orientation === 0 /* TOP */) {
                this.countDownText.position.setTo(this.phone.width, -this.countDownText.height);
                this.target = new Phaser.Point(this.x + this.phone.width / 2, this.y - Player.SIZE / 2);
            }
            else if (conf.orientation === 1 /* RIGHT */) {
                this.countDownText.position.setTo(this.phone.width, -this.countDownText.height);
                this.target = new Phaser.Point(this.x + this.phone.width + Player.SIZE / 2, this.y + this.phone.height / 2);
            }
            else if (conf.orientation === 3 /* LEFT */) {
                this.countDownText.position.setTo(-this.countDownText.width, -this.countDownText.height);
                this.target = new Phaser.Point(this.x - Player.SIZE / 2, this.y + this.phone.height / 2);
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
            this.phone.inputEnabled = true;
            this.phone.events.onInputUp.add(function (phone, pointer) {
                //this.position.setTo(pointer.x - this.phone.width / 2, pointer.y - this.phone.height / 2);
                //this.phone.position.set(this.phone.width / 2, this.phone.height / 2);
                if (_this.timer === -1) {
                    _this.setStateRinging();
                }
                if (_this.timer > 2) {
                    _this.setStateAnswered();
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
            if (DEBUG) {
                var g = this.game.add.graphics(this.target.x, this.target.y);
                g.beginFill(0x000000);
                g.drawCircle(0, 0, 4);
                g.endFill();
                this.debugText = new Phaser.Text(game, 0, this.phone.height, '', { font: "36px Arial", fill: "#000000" });
                this.addChild(this.debugText);
            }
        }
        Phone.prototype.setStateRinging = function () {
            this.state = 4 /* RINGING */;
            this.phone.tint = 0xffcc00;
            this.ringingTween.isPaused ? this.ringingTween.resume() : this.ringingTween.start();
            this.flag.visible = false;
            this.countDownText.visible = false;
        };
        Phone.prototype.setStateWaitForPlayer = function (player) {
            this.state = 9 /* WAITING */;
            this.player = player;
        };
        Phone.prototype.setStateAnswering = function () {
            this.state = 8 /* ANSWERING */;
            this.ringingTween.pause();
            this.phone.scale.setTo(1, 1);
            this.timer = 0;
            this.countDownText.visible = true;
            this.flag.loadTexture('fr', null);
            this.flag.visible = true;
        };
        Phone.prototype.setStateAnswered = function () {
            var _this = this;
            this.phone.tint = 0xdc1616;
            this.timer = -1;
            this.player.moveToCenter();
            //create checkmark anim?
            //this.phone.tint = 0x338000;
            setTimeout(function () {
                _this.setStateAvailable();
            }, 2000);
        };
        Phone.prototype.setStateAvailable = function () {
            this.state = 0 /* AVAILABLE */;
            this.phone.tint = 0x000000;
            this.player = null;
            this.flag.visible = false;
            this.countDownText.visible = false;
            this.timer = -1;
        };
        Phone.prototype.update = function () {
            var _this = this;
            if (DEBUG) {
            }
            if (this.state === 9 /* WAITING */ && this.target.distance(this.player.position) < 100) {
                this.setStateAnswering();
            }
            if (this.state === 4 /* RINGING */) {
                var player = Object.keys(this.game.state.getCurrentState().players).map(function (k) {
                    return _this.game.state.getCurrentState().players[k];
                }).filter(function (p) {
                    return p.phone === null;
                }).shift();
                if (player) {
                    player.moveToPhone(this);
                    this.setStateWaitForPlayer(player);
                }
            }
        };
        return Phone;
    })(Phaser.Group);
    var Phone;
    (function (Phone) {
        (function (State) {
            State[State["AVAILABLE"] = 0] = "AVAILABLE";
            State[State["RINGING"] = 4] = "RINGING";
            State[State["ANSWERING"] = 8] = "ANSWERING";
            State[State["WAITING"] = 9] = "WAITING";
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
            _super.call(this, game, 400, 700, new Phaser.RenderTexture(game, 100, 100, 'empty'));
            this.score = 0;
            this.target = new Phaser.Point;
            this.phone = null;
            this.home = new Phaser.Point(game.world.width / 2, game.world.height / 3);
            this.anchor.setTo(0.5, 0.5);
            game.physics.p2.enable(this, DEBUG);
            this.body.setMaterial(this.game.playerMaterial);
            this.body.fixedRotation = true;
            this.body.damping = 0.9;
            this.body.angularDamping = 0.9;
            this.body.moveUp(60);
            var shadow = this.makeIcon(i, true);
            shadow.position.setTo(-44, -44);
            this.addChild(shadow);
            var icon = this.makeIcon(i);
            icon.position.setTo(-50, -50);
            this.addChild(icon);
            this.moveToCenter();
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
                this.color = 0xffffff;
                graphics.beginFill(this.color);
                graphics.lineStyle(2, 0xffffff, 0.6);
                graphics.tint = 0x000000;
                graphics.alpha = 0.6;
            }
            else {
                this.color = colors[type];
                graphics.beginFill(this.color);
                graphics.lineStyle(2, 0xffffff);
            }
            this.drawIcon(graphics, type);
            graphics.endFill();
            return graphics;
        };
        Player.prototype.moveToPhone = function (phone) {
            this.target.copyFrom(phone.target);
            this.phone = phone;
        };
        Player.prototype.moveToCenter = function () {
            this.target.copyFrom(this.home);
            this.phone = null;
        };
        Player.prototype.update = function () {
            var speed = 400;
            var angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.body.force.x = Math.cos(angle) * speed; // accelerateToObject 
            this.body.force.y = Math.sin(angle) * speed;
            var trails = this.game.state.getCurrentState().trailsBitmap;
            var s = '00' + this.color.toString(16);
            trails.context.fillStyle = '#' + s.substr(s.length - 6);
            trails.context.fillRect(this.x - this.width, this.y - this.height / 2, 4, 4);
            trails.dirty = true;
        };
        return Player;
    })(Phaser.Sprite);
    var Player;
    (function (Player) {
        Player.SIZE = 100;
    })(Player || (Player = {}));
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