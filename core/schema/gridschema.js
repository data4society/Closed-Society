ncos.Grids.Checks = [
	{
		name: 'ncoName',
    label: 'Название',
		editable: false,
    cell: 'string'
  },
  {
    name: 'region',
    label: 'Регион',
		editable: false,
    cell: 'string'
  },
  {
    name: 'sector',
    label: 'Сектор',
		editable: false,
    cell: 'string'
  },
  {
    name: 'currentState',
    label: 'Санкция',
		editable: false,
    cell: 'string'
	}
];

ncos.Grids.FilteredChecks = [
	{
  	name: 'ncoName',
    label: 'НКО',
		editable: false,
    cell: 'string'
  },
  {
  	name: 'currentStateDate',
    label: 'Дата санкции',
		editable: false,
    cell: Backgrid.Extension.MomentCell.extend({
      modelFormat: "X",
      displayFormat: "DD.MM.YYYY",
      displayInUTC: false
    })
  },
  {
    name: 'currentState',
    label: 'Санкция',
		editable: false,
    cell: 'string'
  },
  {
    name: 'currentStateSource',
    label: 'Источник',
		editable: false,
    cell: 'uri'
  },
  {
    name: 'ncoFullName',
    label: 'Полное название',
		editable: false,
		renderable: false,
    cell: 'string'
  }
];

ncos.Grids.CheckSubGrids = {
	cases: {
		settings: {
			class: '.check-cases',
			name: 'cases',
			grid: true
		},
		columns: [
			{
      	name: 'authorityName',
      	label: 'Орган',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'checkName',
      	label: 'Проверка',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'currentState',
      	label: 'Текущий статус',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'currentStateDate',
      	label: 'Дата статуса',
				editable: false,
      	cell: Backgrid.Extension.MomentCell.extend({
      		modelFormat: "X",
      		displayFormat: "DD.MM.YYYY",
      		displayInUTC: false
    		})
      }
    ]
	},
	sanctions: {
		settings: {
			class: '.check-sanctions',
			name: 'sanctions',
			grid: true
		},
		columns: [
			{
      	name: 'authorityName',
      	label: 'Орган',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'caseName',
      	label: 'Дело',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'currentState',
      	label: 'Текущий статус',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'currentStateDate',
      	label: 'Дата статуса',
				editable: false,
      	cell: Backgrid.Extension.MomentCell.extend({
      		modelFormat: "X",
      		displayFormat: "DD.MM.YYYY",
      		displayInUTC: false
    		})
      }
    ]
	},
	nco: {
		settings: {
			class: '.nco',
			name: 'nco',
			grid: false
		}
	}
}