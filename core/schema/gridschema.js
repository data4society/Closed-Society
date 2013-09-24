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

ncos.Grids.ChecksEn = [
	{
		name: 'ncoName',
    label: 'NGO name',
		editable: false,
    cell: 'string'
  },
  {
    name: 'regionEn',
    label: 'Region',
		editable: false,
    cell: 'string'
  },
  {
    name: 'sectorEn',
    label: 'Sector',
		editable: false,
    cell: 'string'
  },
  {
    name: 'currentStateEn',
    label: 'Current state',
		editable: false,
    cell: 'string'
	}
];

ncos.Grids.FilteredChecksEn = [
	{
  	name: 'ncoName',
    label: 'NGO',
		editable: false,
    cell: 'string'
  },
  {
  	name: 'currentStateDate',
    label: 'Date',
		editable: false,
    cell: Backgrid.Extension.MomentCell.extend({
      modelFormat: "X",
      displayFormat: "DD.MM.YYYY",
      displayInUTC: false
    })
  },
  {
    name: 'currentStateEn',
    label: 'Current state',
		editable: false,
    cell: 'string'
  },
  {
    name: 'currentStateSource',
    label: 'Source',
		editable: false,
    cell: 'uri'
  },
  {
    name: 'ncoFullName',
    label: 'Full name',
		editable: false,
		renderable: false,
    cell: 'string'
  }
];

ncos.Grids.CheckSubGridsEn = {
	cases: {
		settings: {
			class: '.check-cases',
			name: 'cases',
			grid: true
		},
		columns: [
			{
      	name: 'authorityName',
      	label: 'Authority',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'checkName',
      	label: 'Inspection',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'currentState',
      	label: 'Current state',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'currentStateDate',
      	label: 'Date',
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
      	label: 'Authority',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'caseName',
      	label: 'Case',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'currentState',
      	label: 'Current state',
				editable: false,
      	cell: 'string'
      },
      {
      	name: 'currentStateDate',
      	label: 'Date',
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