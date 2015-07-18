# paleo2015-gestionair-tv


## Supported events

```javascript
gameStartEvent = {
                type: 'GAME_START',
                endTime: new Date(new Date().getTime() + duration+intro),
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
```
enum Orientation { TOP = 0, RIGHT = 1, BOTTOM = 2, LEFT = 3 }

```javascript
phoneRingingEvent = {
                        type: 'PHONE_RINGING',
                        number: __phone.number__
	                }
```

```javascript
phoneStopRingingEvent = {
                        type: 'PHONE_STOPRINGING',
                        number: __phone.number__
	                }
```

```javascript
phoneStopRingingEvent = {
                        type: 'PHONE_OFFLINE',
                        number: __phone.number__
	                }
```

```javascript
phoneStopRingingEvent = {
                        type: 'PHONE_ONLINE',
                        number: __phone.number__
	                }
```

```javascript
playerStartAnsweringEvent = {
                        type: 'PLAYER_ANSWERING',
                        playerId: __player.id__,
                        number: __phone.number__,
                        flag: 'gb' //de, fr, ...
                    }
```

```javascript
playerAnsweredEvent = {
                            type: 'PLAYER_ANSWERED',
                            playerId: __player.id__,
                            number: __phone.number__,
                            correct: 1 //0
							// maybe new score for player??
                        }
```

```javascript
gameEndEvent = {
                    type: 'GAME_END',
                    game: 33,
					scores:[{id: 1, name: 'a', score: 43, languages: [{lang:'gb', correct: 0}, {lang:'de', correct: 1}]},
                {id: 2, name: 'b', score: 23, languages:[{lang:'gb', correct: 0}, {lang:'de', correct: 1}]},
                {id: 3, name: 'c', score: 23, languages:[{lang:'gb', correct: 0}, {lang:'de', correct: 1}]},
                {id: 4, name: 'd', score: 23, languages:[{lang:'gb', correct: 0}, {lang:'de', correct: 1}]},
                {id: 5, name: 'e', score: 23, languages:[{lang:'gb', correct: 0}, {lang:'de', correct: 1}]},
                {id: 6, name: 'f', score: 23, languages:[{lang:'gb', correct: 0}, {lang:'de', correct: 1}]}]
                }
```


## Resources

* http://flagpedia.net/download
* http://www.flaticon.com/free-icon/checked-mark_64410
* http://www.flaticon.com/free-icon/delete-cross_64145
* http://www.flaticon.com/free-icon/phone-symbol-of-an-auricular-inside-a-circle_34067
* http://kvazars.com/littera/