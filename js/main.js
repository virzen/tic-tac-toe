/* global Vue */

const defaultGrid = [
	['_', '_', '_'],
	['_', '_', '_'],
	['_', '_', '_']
];

Vue.component('side-picker', {
	template: '#side-picker-template',

	props: ['symbols'],

	methods: {
		pickSymbol: function (symbol) {
			this.$dispatch('symbolPicked', symbol);
		}
	}
});

Vue.component('game-board', {
	template: '#game-board-template',

	props: ['player', 'bot', 'symbols'],

	data: function () {
		return {
			grid: [...defaultGrid],
			prevFirstPlayerId: -1
		};
	},

	methods: {
		playerWon: function (player) {
			const symbol = this.getSymbol(player.symbolId);
			const rows = this.grid.map(row => row.filter(x => x === symbol));
			const threeInRow = rows.reduce((a, b) => a || b.length === 3, false);

			if (threeInRow) {
				return true;
			}
			else {

			}
		},
		getSymbol: function (symbolId) {
			return this.symbols[symbolId];
		},
		resetGrid: function () {
			this.grid = [...defaultGrid];
		},
		makeMove: function (player, rowIndex, colIndex) {
			if (this.grid[rowIndex][colIndex] === '_') {
				const symbol = this.getSymbol(player.symbolId);
				this.grid[rowIndex].$set(colIndex, symbol);

				return player;
			}
			else {
				return null;
			}
		},
		// TODO: implement real bot
		botMove: function () {
			const colIndex = Math.floor(Math.random() * 3);
			const rowIndex = Math.floor(Math.random() * 3);

			if (!this.makeMove(this.bot, rowIndex, colIndex)) {
				this.botMove();
			}
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
					// TODO: display results
					console.log('Player won.');
					this.startGame();
				}
				else {
					this.botMove();
					if (this.playerWon(this.bot)) {
						// TODO: display results
						this.startGame();
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
				symbolId: -1
			},
			{
				id: 1,
				typeId: 1,
				symbolId: -1
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
		}
	}
});
