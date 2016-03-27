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

Vue.component('game-board', {
	template: '#game-board-template',

	props: ['player', 'bot', 'symbols'],

	data: function () {
		return {
			grid: [
				['_', '_', '_'],
				['_', '_', '_'],
				['_', '_', '_']
			]
		};
	},

	methods: {
		getSymbol: function (symbolId) {
			return this.symbols[symbolId];
		},
		makeMove: function (player, rowIndex, colIndex) {
			const symbol = this.getSymbol(player.symbolId);
			this.grid[rowIndex].$set(colIndex, symbol);
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
				typeId: 0,
				symbolId: -1
			},
			{
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
