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

	data: function () {
		return {
			grid: [
				[' ', ' ', ' '],
				[' ', ' ', ' '],
				[' ', ' ', ' ']
			]
		};
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
		symbolsNotPicked: function () {
			return this.players.map(x => x.symbolId).indexOf(-1) !== -1;
		}
	},

	events: {
		symbolPicked: function (symbol) {
			const playerTypeId = this.types.findIndex(x => x === 'player');
			const player = this.players.find(x => x.typeId === playerTypeId);
			const bot = this.players.find(x => x.typeId !== playerTypeId);

			player.symbolId = this.symbols.indexOf(symbol);
			bot.symbolId = this.symbols.findIndex(x => x !== symbol);
		}
	}
});
