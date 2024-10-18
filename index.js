function init() {
    // Inicializa o diagrama
    myDiagram = new go.Diagram('myDiagramDiv', {
        validCycle: go.CycleMode.NotDirected, // não permite loops
        ModelChanged: (e) => {
            if (e.isTransactionFinished) showModel();
        },
        'undoManager.isEnabled': true
    });

    // Template para cada campo da tabela
    var fieldTemplate = new go.Panel('TableRow', {
        background: 'transparent',
        fromSpot: go.Spot.Right,
        toSpot: go.Spot.Left,
        fromLinkable: true,
        toLinkable: true
    })
        .bind('portId', 'name')
        .add(
            new go.Shape({
                width: 12,
                height: 12,
                column: 0,
                strokeWidth: 2,
                margin: 4,
                fromLinkable: false,
                toLinkable: false
            })
                .bind('figure', 'figure')
                .bind('fill', 'color'),
            new go.TextBlock({
                margin: new go.Margin(0, 5),
                column: 1,
                font: 'bold 13px sans-serif',
                alignment: go.Spot.Left,
                fromLinkable: false,
                toLinkable: false
            }).bind('text', 'name'),
            new go.TextBlock({
                margin: new go.Margin(0, 5),
                column: 2,
                font: '13px sans-serif',
                alignment: go.Spot.Left
            }).bind('text', 'info')
        );

    // Template para o nó (representa uma tabela)
    myDiagram.nodeTemplate = new go.Node('Auto', {
        copyable: false,
        deletable: false
    })
        .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
        .add(
            new go.Shape({ fill: '#EEEEEE' }),
            new go.Panel('Vertical')
                .add(
                    new go.Panel('Auto', { stretch: go.Stretch.Horizontal })
                        .add(
                            new go.Shape({ fill: '#1570A6', stroke: null }),
                            new go.TextBlock({
                                alignment: go.Spot.Center,
                                margin: 3,
                                stroke: 'white',
                                textAlign: 'center',
                                font: 'bold 12pt sans-serif'
                            }).bind('text', 'key')
                        ),
                    new go.Panel('Table', {
                        padding: 2,
                        minSize: new go.Size(100, 10),
                        defaultStretch: go.Stretch.Horizontal,
                        itemTemplate: fieldTemplate
                    }).bind('itemArray', 'fields')
                )
        );

    // Template de links
    myDiagram.linkTemplate = new go.Link({
        relinkableFrom: true,
        relinkableTo: true,
        toShortLength: 4,
        fromShortLength: 2
    })
        .add(
            new go.Shape({ strokeWidth: 1.5 }),
            new go.Shape({ toArrow: 'Standard', stroke: null })
        );

    // Configura o modelo inicial
    myDiagram.model = new go.GraphLinksModel({
        copiesArrays: true,
        copiesArrayObjects: true,
        linkFromPortIdProperty: 'fromPort',
        linkToPortIdProperty: 'toPort',
        nodeDataArray: [],
        linkDataArray: []
    });

    showModel();

    function showModel() {
        document.getElementById('mySavedModel').innerHTML = myDiagram.model.toJson();
        if (window.Prism) window.Prism.highlightAll();
    }

    // Adiciona interatividade para criar novos nós (tabelas)
    document.getElementById('createTable').addEventListener('click', () => {
        myDiagram.startTransaction('add table');
        const newNodeData = {
            key: `Table${myDiagram.model.nodeDataArray.length + 1}`,
            loc: `${myDiagram.lastInput.documentPoint.x} ${myDiagram.lastInput.documentPoint.y}`,
            fields: [
                { name: 'Column1', info: 'Info1', color: '#F7B84B', figure: 'Ellipse' },
                { name: 'Column2', info: 'Info2', color: '#F25022', figure: 'Rectangle' }
            ]
        };
        myDiagram.model.addNodeData(newNodeData);
        myDiagram.commitTransaction('add table');
    });

    // Adiciona interatividade para criar conexões entre tabelas
    document.getElementById('createLink').addEventListener('click', () => {
        const selectedNodes = myDiagram.selection;
        if (selectedNodes.count === 2) {
            const nodes = selectedNodes.toArray();
            myDiagram.startTransaction('add link');
            myDiagram.model.addLinkData({
                from: nodes[0].data.key,
                fromPort: nodes[0].data.fields[0].name,
                to: nodes[1].data.key,
                toPort: nodes[1].data.fields[0].name
            });
            myDiagram.commitTransaction('add link');
        } else {
            alert('Selecione exatamente duas tabelas para conectar.');
        }
    });
}

window.addEventListener('DOMContentLoaded', init);
