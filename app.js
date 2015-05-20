/// <reference path='phaser.comments.d.ts' />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var GestionAirTV;
(function (GestionAirTV) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 1920, 1080, Phaser.CANVAS, 'content', new MenuState());
        }
        Game.prototype.boot = function () {
            _super.prototype.boot.call(this);
            this.simulator = new Simulator(this);
        };
        Game.prototype.update = function (time) {
            _super.prototype.update.call(this, time);
            this.simulator.update();
        };
        Game.prototype.handleEvent = function (event) {
            switch (event.type) {
                case 'GAME_START':
                    this.gameState = new GameState(event);
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
        };
        return Game;
    })(Phaser.Game);
    GestionAirTV.Game = Game;
    var Simulator = (function () {
        function Simulator(game) {
            this.timeouts = [];
            this.game = game;
            this.state = 'OFF';
            this.startSimulation();
        }
        Simulator.prototype.startSimulation = function () {
            var _this = this;
            var duration = 60 * 1000;
            var intro = 6 * 1000;
            var outro = 6 * 1000;
            var gameStartEvent = {
                type: 'GAME_START',
                endTime: new Date(new Date().getTime() + duration + intro),
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
            //plan end of round
            setTimeout(function () {
                _this.game.handleEvent({
                    type: 'GAME_END'
                });
                _this.state = 'OFF';
                //cancel pending timeouts
                _this.timeouts.forEach(function (id) {
                    clearTimeout(id);
                });
                _this.timeouts.splice(0);
                //timeout before next round
                setTimeout(_this.startSimulation.bind(_this), outro);
            }, duration);
            //start
            this.game.handleEvent(gameStartEvent);
            //wait intro
            setTimeout(function () {
                _this.state = 'ON';
            }, intro);
        };
        Simulator.prototype.update = function () {
            var _this = this;
            var phone;
            var player;
            if (this.game.gameState && this.state === 'ON') {
                //make phones ring (max 2 phones not used)
                var availablePhones = Object.keys(this.game.gameState.phones).map(function (k) {
                    return _this.game.gameState.phones[k];
                }).filter(function (phone) {
                    return phone.state === 0 /* AVAILABLE */;
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
                var ringingPhones = Object.keys(this.game.gameState.phones).map(function (k) {
                    return _this.game.gameState.phones[k];
                }).filter(function (phone) {
                    return phone.state === 4 /* RINGING */;
                });
                var freePlayers = Object.keys(this.game.gameState.players).map(function (k) {
                    return _this.game.gameState.players[k];
                }).filter(function (p) {
                    return p.phone === null;
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
                    this.timeouts.push(setTimeout(function () {
                        _this.game.handleEvent({
                            type: 'PLAYER_ANSWERED',
                            playerId: player.id,
                            number: phone.number,
                            correct: _this.game.rnd.integerInRange(0, 1)
                        });
                    }, this.game.rnd.integerInRange(6, 20) * 1000));
                }
            }
        };
        return Simulator;
    })();
    var Game;
    (function (Game) {
        Game.COLOR_CORRECT = 0x338000;
        Game.COLOR_WRONG = 0xdc1616;
    })(Game = GestionAirTV.Game || (GestionAirTV.Game = {}));
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
        };
        return MenuState;
    })(Phaser.State);
    var GameState = (function (_super) {
        __extends(GameState, _super);
        function GameState(init) {
            _super.call(this);
            this.phones = {};
            this.players = {};
            this.flags = ['gb', 'de', 'fr'];
            this.initData = init;
            this.duration = this.initData.endTime.getTime() - new Date().getTime();
        }
        GameState.prototype.preload = function () {
            var _this = this;
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.load.image('phone', 'images/phone72.png');
            this.game.load.image('correct', 'images/checked21.png');
            this.game.load.image('wrong', 'images/delete102.png');
            this.game.load.bitmapFont('digital-7', 'fonts/digital-7.mono.png', 'fonts/digital-7.mono.xml');
            this.flags.forEach(function (lg) {
                _this.game.load.image(lg, 'images/flags/' + lg + '.png');
            });
        };
        GameState.prototype.create = function () {
            var _this = this;
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
            this.progressBar = this.game.add.graphics(100, 30);
            this.progressBar.beginFill(0xff0000);
            this.progressBar.drawRect(0, 0, 1720, 20);
            this.progressBar.endFill();
            this.trailsBitmap = this.game.add.bitmapData(1720, 700);
            this.game.add.image(100, 50, this.trailsBitmap, null);
            this.initData.phones.forEach(function (phoneData) {
                var phone = new Phone(_this.game, phoneData);
                _this.phones[phoneData.number] = phone;
                _this.add.existing(phone);
            });
            this.initData.players.forEach(function (playerData, i) {
                var playerScore = new PlayerScore(_this.game, playerData, i);
                _this.add.existing(playerScore);
                var t = _this.game.time.create();
                t.start();
                t.add(i * 2000, function () {
                    var player = new Player(_this.game, playerData, i, playerScore);
                    _this.players[playerData.id] = player;
                    _this.add.existing(player);
                }, _this);
            });
        };
        GameState.prototype.update = function () {
            this.progressBar.width = Math.max(Math.round(1720 * ((this.initData.endTime.getTime() - new Date().getTime()) / this.duration)), 0);
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
                if (_this.timer === -1) {
                    _this.setStateRinging();
                }
                if (_this.timer > 2) {
                    _this.setStateAnswered(false);
                }
                if (isDoubleClick(pointer)) {
                    if (_this.timer > 2) {
                        _this.setStateAnswered(false);
                    }
                    else {
                        _this.setStateAnswering();
                    }
                }
            });
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
        Phone.prototype.setFlag = function (flag) {
            this.flag.loadTexture(flag, null);
            this.flag.name = flag;
        };
        Phone.prototype.setStateAnswering = function () {
            this.state = 8 /* ANSWERING */;
            this.phone.tint = 0xffa200;
            this.ringingTween.pause();
            this.phone.scale.setTo(1, 1);
            this.timer = 0;
            this.countDownText.visible = true;
            this.flag.visible = true;
        };
        Phone.prototype.setStateAnswered = function (correct) {
            var _this = this;
            if (correct) {
                this.phone.tint = Game.COLOR_CORRECT;
            }
            else {
                this.phone.tint = Game.COLOR_WRONG;
            }
            this.timer = -1;
            this.player.moveToHome();
            //TODO create checkmark anim? + add to playerScore
            this.player.playerScore.addAnswer(this.flag.name, correct);
            setTimeout(function () {
                _this.setStateAvailable();
            }, 2000);
        };
        Phone.prototype.setStateAvailable = function () {
            this.state = 0 /* AVAILABLE */;
            this.ringingTween.pause();
            this.phone.scale.setTo(1, 1);
            this.phone.tint = 0x000000;
            this.player = null;
            this.flag.visible = false;
            this.countDownText.visible = false;
            this.timer = -1;
        };
        Phone.prototype.update = function () {
            if (this.state === 9 /* WAITING */ && this.target.distance(this.player.position) < 1) {
                this.setStateAnswering();
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
        function Player(game, conf, i, playerScore) {
            _super.call(this, game, 400, 700, new Phaser.RenderTexture(game, 100, 100, 'empty'));
            this.score = 0;
            this.target = new Phaser.Point;
            this.phone = null;
            this.id = conf.id;
            this.home = new Phaser.Point(game.world.width / 2 - ((-3 + i) * (Player.SIZE + 20)), game.world.height / 3);
            this.anchor.setTo(0.5, 0.5);
            this.color = Player.colors[i];
            this.addChild(new PlayerIcon(game, 0, 0, i, this.color));
            this.playerScore = playerScore;
            this.moveToHome();
        }
        Player.prototype.moveToPhone = function (phone) {
            this.target.copyFrom(phone.target);
            this.phone = phone;
            this.moveToTarget();
        };
        Player.prototype.jumpToPhone = function (phone) {
            if (this.tween) {
                this.tween.stop();
            }
            this.position.copyFrom(phone.target);
            this.phone = phone;
        };
        Player.prototype.moveToHome = function () {
            this.target.copyFrom(this.home);
            this.phone = null;
            this.moveToTarget();
        };
        Player.prototype.moveToExit = function () {
            var _this = this;
            this.target.setTo(1400, 700);
            this.phone = null;
            this.moveToTarget();
            this.tween.onComplete.add(function () {
                _this.destroy();
            });
        };
        Player.prototype.moveToTarget = function () {
            if (this.tween) {
                this.tween.stop();
            }
            this.tween = this.game.add.tween(this).to(this.target, Math.abs(this.target.distance(this.position) / 200) * 1000, Phaser.Easing.Sinusoidal.InOut, true, 0, 0, false);
        };
        Player.prototype.update = function () {
            var trails = this.game.state.getCurrentState().trailsBitmap;
            var s = '00' + this.color.toString(16);
            trails.context.beginPath();
            trails.context.fillStyle = '#' + s.substr(s.length - 6);
            trails.context.arc(this.x - this.width, this.y - this.height / 2, 2, 0, 360, false);
            trails.context.closePath();
            trails.context.fill();
            trails.dirty = true;
        };
        return Player;
    })(Phaser.Sprite);
    var PlayerIcon = (function (_super) {
        __extends(PlayerIcon, _super);
        function PlayerIcon(game, x, y, type, color) {
            _super.call(this, game, x, y);
            var shadow = this.makeIcon(type, null, true);
            shadow.position.setTo(-44, -44);
            this.addChild(shadow);
            var icon = this.makeIcon(type, color);
            icon.position.setTo(-50, -50);
            this.addChild(icon);
        }
        PlayerIcon.prototype.drawIcon = function (graphics, type) {
            if (type === 0) {
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 35, 30, 2, 35, 26, 58, 21, 90, 50, 75, 79, 90, 74, 58, 98, 35, 65, 30, 50, 0).points);
            }
            else if (type === 1) {
                graphics.drawPolygon(new Phaser.Polygon(5, 5, 5, 95, 95, 95, 95, 5, 5, 5).points);
            }
            else if (type === 2) {
                graphics.drawPolygon(new Phaser.Polygon(0, 86, 100, 86, 50, 0, 0, 86).points);
            }
            else if (type === 3) {
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 2, 35, 21, 90, 79, 90, 98, 35, 50, 0).points);
            }
            else if (type === 4) {
                graphics.drawPolygon(new Phaser.Polygon(50, 0, 35, 35, 0, 50, 35, 65, 50, 100, 65, 65, 100, 50, 65, 35, 50, 0).points);
            }
            else if (type === 5) {
                graphics.drawCircle(50, 50, 100);
            }
        };
        PlayerIcon.prototype.makeIcon = function (type, color, shadow) {
            var graphics = new Phaser.Graphics(this.game, 0, 0);
            if (shadow) {
                graphics.beginFill(0xffffff);
                graphics.tint = 0x000000;
                graphics.alpha = 0.6;
            }
            else {
                graphics.beginFill(color);
                graphics.lineStyle(2, 0xffffff);
            }
            this.drawIcon(graphics, type);
            graphics.endFill();
            return graphics;
        };
        return PlayerIcon;
    })(Phaser.Graphics);
    var Player;
    (function (Player) {
        Player.SIZE = 100;
        Player.colors = [0xffcc00, 0xff0066, 0xabc837, 0x0055d4, 0xff6600, 0xc87137];
    })(Player || (Player = {}));
    var PlayerScore = (function (_super) {
        __extends(PlayerScore, _super);
        function PlayerScore(game, conf, i) {
            _super.call(this, game, (i % 3) * 500 + 200, 850 + (i > 2 ? 150 : 0));
            this.answerCount = 0;
            game.state.getCurrentState().add.existing(this);
            this.addChild(new PlayerIcon(game, 0, 0, i, Player.colors[i]));
            var text = new Phaser.Text(game, 80, -56, conf.name, { font: "48px Arial", fill: "#ffffff" });
            text.setShadow(2, 2, 'rgba(0, 0, 0, 0.5)');
            this.addChild(text);
        }
        PlayerScore.prototype.addAnswer = function (flagLang, correct) {
            var flag = this.game.make.sprite(80 + 80 * this.answerCount, 0, flagLang);
            flag.scale.set(0.1);
            this.addChild(flag);
            var check = this.game.make.sprite(90 + 80 * this.answerCount, 10, correct ? 'correct' : 'wrong');
            check.scale.set(0.08);
            check.tint = correct ? Game.COLOR_CORRECT : Game.COLOR_WRONG;
            this.addChild(check);
            this.answerCount++;
        };
        return PlayerScore;
    })(Phaser.Graphics);
})(GestionAirTV || (GestionAirTV = {}));
var gestionAirTV;
window.onload = function () {
    gestionAirTV = new GestionAirTV.Game();
};
//# sourceMappingURL=app.js.map