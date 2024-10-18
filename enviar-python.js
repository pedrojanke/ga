async function buscarDados() {
    const lucros = [];
    const pesos = [];
    let capacidades = [];

    const modelJsonString = showModel();
    const modelJson = JSON.parse(modelJsonString);

    if (modelJson) {
        modelJson
            .linkDataArray
            .forEach(element => {
                if (element.from === "Preco Items" && element.to === "Pesos") {
                    lucros.push(Number(element.fromPort));
                    pesos.push(Number(element.toPort));
                }
                if (element.to === "Capacidade") {
                    capacidades.push(Number(element.toPort));
                }
            });

        capacidades = [...new Set(capacidades)];
        capacidades = capacidades.length === 1
            ? capacidades[0]
            : capacidades;

        console.log(lucros)
        console.log(pesos)
        console.log(capacidades)

        enviar(lucros, pesos, capacidades);
    } else {
        console.error("linkDataArray não encontrado ou está vazio.");
    }
}

async function enviar(lucros, pesos, capacidade) {
    const url = 'http://127.0.0.1:5000/ga';

    const dados = {
        profit: lucros,
        weight: pesos,
        capacity: capacidade
    };

    console.log(dados);

    try {
        const resposta = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.statusText}`);
        }

        const resultado = await resposta.json();
        console.log('Resultado:', resultado);
        alert(resultado.resultado);
    } catch (erro) {
        console.error('Erro ao enviar dados:', erro);
    }
}

document
    .getElementById('botao')
    .addEventListener('click', () => buscarDados());
