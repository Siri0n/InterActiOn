export default [
	{
		name: "Level 1",
		height: 1,
		width: 5,
		objects: [
			{
				type: "alpha",
				position: {x: 1, y: 0}
			},
			{
				type: "omega",
				position: {x: 4, y: 0}
			},
			{
				type: "plus",
				position: {x: 0, y: 0}
			}
		]
	},
	{
		name: "Level 2",
		height: 4,
		width: 4,
		objects: [
			{
				type: "alpha",
				position: {x: 1, y: 2}
			},
			{
				type: "omega",
				position: {x: 3, y: 0}
			},
			{
				type: "plus",
				position: {x: 1, y: 3}
			},
			{
				type: "plus",
				position: {x: 0, y: 0}
			}
		]
	},
	{
		name: "Level 3",
		height: 5,
		width: 5,
		objects: [
			{
				type: "alpha",
				position: {x: 1, y: 3}
			},
			{
				type: "omega",
				position: {x: 4, y: 0}
			},
			{
				type: "plus",
				position: {x: 1, y: 4},
				power: 2
			},
			{
				type: "plus",
				position: {x: 1, y: 1}
			},
			{
				type: "plus",
				position: {x: 2, y: 4}
			},
			{
				type: "plus",
				position: {x: 0, y: 2}
			}
		]
	},
]