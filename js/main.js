/* global Vue */



Vue.component('side-picker', {
	template: '#side-picker-template',

	props: ['symbols'],

	methods: {
		pickSymbol: function (symbol) {
			this.$dispatch('symbolPicked', symbol);
		}
	}
});

Vue.component('score-board', {
	template: '#score-board-template',

	props: ['player', 'bot', 'symbols'],

	data: function () {
		return {
			message: ''
		};
	},

	methods: {
		getSymbol: function (symbolId) {
			return this.symbols[symbolId];
		},
		clearMessage: function () {
			this.message = '';
		}
	},

	events: {
		gameWonBy: function (type) {
			const typeCap = type.charAt(0).toUpperCase() + type.slice(1);
			this.message = `${typeCap} wins!`;
			setTimeout(this.clearMessage, 1000);
		},
		tie: function () {
			this.message = `Tie!`;
			setTimeout(this.clearMessage, 1000);
		}
	}
});

Vue.component('game-board', {
	template: '#game-board-template',

	props: ['player', 'bot', 'symbols'],

	data: function () {
		const defaultGrid = Object.freeze([
			['_', '_', '_'],
			['_', '_', '_'],
			['_', '_', '_']
		]);
		return {
			defaultGrid: defaultGrid,
			grid: defaultGrid.map(x => Array.from(x)),
			prevFirstPlayerId: -1
		};
	},

	methods: {
		getSymbol: function (symbolId) {
			return this.symbols[symbolId];
		},
		isEmpty: function (cell) {
			return cell === '_';
		},
		playerWon: function (player) {
			const symbol = this.getSymbol(player.symbolId);
			const grid = this.grid;

			// rows
			for (let i = 0; i < 3; i++) {
				if (grid[i][0] === symbol && grid[i][1] === symbol && grid[i][2] === symbol) {
					return true;
				}
			}

			// cols
			for (let i = 0; i < 3; i++) {
				if (grid[0][i] === symbol && grid[1][i] === symbol && grid[2][i] === symbol) {
					return true;
				}
			}

			// diagonals
			// top-left to bottom-right
			if (grid[0][0] === symbol && grid[1][1] === symbol && grid[2][2] === symbol) {
				return true;
			}
			// top-right to bottom-left
			if (grid[0][2] === symbol && grid[1][1] === symbol && grid[2][0] === symbol) {
				return true;
			}
		},
		resetGrid: function () {
			this.grid = this.defaultGrid.map(x => Array.from(x));
		},
		makeMove: function (player, rowIndex, colIndex) {
			if (this.isEmpty(this.grid[rowIndex][colIndex])) {
				const symbol = this.getSymbol(player.symbolId);
				this.grid[rowIndex].$set(colIndex, symbol);

				return player;
			}
			else {
				return null;
			}
		},
		botMove: function () {
			const grid = this.grid;
			let coords = [];

			// middle
			if (this.isEmpty(grid[1][1])) {
				coords = [1, 1];
			}
			else {
				// corners
				if (this.isEmpty(grid[0][0])) {
					coords = [0, 0];
				}
				else if (this.isEmpty(grid[0][2])) {
					coords = [0, 2];
				}
				else if (this.isEmpty(grid[2][0])) {
					coords = [2, 0];
				}
				else if (this.isEmpty(grid[2][2])) {
					coords = [2, 2];
				}

				// anything that's left
				else {
					if (this.isEmpty(grid[0][1])) {
						coords = [0, 1];
					}
					else if (this.isEmpty(grid[1][0])) {
						coords = [1, 0];
					}
					else if (this.isEmpty(grid[1][2])) {
						coords = [1, 2];
					}
					else if (this.isEmpty(grid[2][1])) {
						coords = [2, 1];
					}

					// no move possible
					else {
						return false;
					}
				}
			}

			return this.makeMove(this.bot, ...coords);
		},
		startGame: function () {
			let currId = -1;
			const prevId = this.prevFirstPlayerId;

			if (prevId === -1) {
				currId === this.player.id;
			}
			else {
				// change 0 to 1 or 1 to 0
				currId = (prevId) ? 0 : 1;
				this.botMove();
			}

			this.prevFirstPlayerId = currId;
			// TODO: increment score
			this.resetGrid();
		},
		playerMove: function (rowIndex, colIndex) {
			if (this.makeMove(this.player, rowIndex, colIndex)) {
				if (this.playerWon(this.player)) {
					this.$dispatch('gameWonBy', this.player);
					setTimeout(this.startGame, 1000);
				}
				else {
					if (this.botMove()) {
						if (this.playerWon(this.bot)) {
							this.$dispatch('gameWonBy', this.bot);
							setTimeout(this.startGame, 1000);
						}
					}
					else {
						this.$dispatch('tie');
						setTimeout(this.startGame, 1000);
					}
				}
			}
		}
	}
});

new Vue({
	el: '#app',

	data: {
		symbols: [ 'O', 'X' ],
		types: [ 'player', 'bot' ],
		players: [
			{
				id: 0,
				typeId: 0,
				symbolId: -1,
				score: 0
			},
			{
				id: 1,
				typeId: 1,
				symbolId: -1,
				score: 0
			}
		],
	},

	computed: {
		symbolsPicked: function () {
			return this.players.map(x => x.symbolId).indexOf(-1) === -1;
		},
		player: function () {
			const playerTypeId = this.types.findIndex(x => x === 'player');
			const player = this.players.find(x => x.typeId === playerTypeId);

			return player;
		},
		bot: function () {
			const botTypeId = this.types.findIndex(x => x === 'bot');
			const bot = this.players.find(x => x.typeId === botTypeId);

			return bot;
		}
	},

	events: {
		symbolPicked: function (symbol) {
			// set symbolId for player
			this.player.symbolId = this.symbols.indexOf(symbol);
			// set symbolId of a different symbol than player's for bot
			this.bot.symbolId = this.symbols.findIndex(x => x !== symbol);
		},
		gameWonBy: function (player) {
			const type = this.types[player.typeId];

			player.score++;
			this.$broadcast('gameWonBy', type);
		},
		tie: function () {
			this.$broadcast('tie');
		}
	}
});
