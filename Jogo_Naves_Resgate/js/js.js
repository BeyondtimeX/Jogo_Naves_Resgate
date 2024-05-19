function start() {
    // Esconde a tela de início
    $("#inicio").hide();

    // Adiciona elementos ao fundo do jogo
    $("#fundoGame").append("<div id='jogador' class='anima1'></div>");
    $("#fundoGame").append("<div id='inimigo1' class='anima2'></div>");
    $("#fundoGame").append("<div id='inimigo2'></div>");
    $("#fundoGame").append("<div id='amigo' class='anima3'></div>");
    $("#fundoGame").append("<div id='placar'></div>");
    $("#fundoGame").append("<div id='energia'></div>");

    // Inicializa variáveis do jogo
    let posicaoY = parseInt(Math.random() * 334);
    let pontos = 0, salvos = 0, perdidos = 0;
    let energiaAtual = 3;
    let velocidade = 5;
    let podeAtirar = true;
    let fimDeJogo = false;
    const jogo = { pressionou: [] };

    // Sons do jogo
    const sons = {
        disparo: document.getElementById("somDisparo"),
        explosao: document.getElementById("somExplosao"),
        musica: document.getElementById("musica"),
        gameover: document.getElementById("somGameover"),
        perdido: document.getElementById("somPerdido"),
        resgate: document.getElementById("somResgate")
    };

    // Configura a música de fundo em loop
    sons.musica.addEventListener("ended", () => { sons.musica.currentTime = 0; sons.musica.play(); }, false);
    sons.musica.play();

    // Teclas do jogo
    const TECLA = { W: 87, S: 83, P: 80 };

    // Eventos de teclado
    $(document).keydown((e) => { jogo.pressionou[e.which] = true; });
    $(document).keyup((e) => { jogo.pressionou[e.which] = false; });

    // Loop do jogo
    jogo.timer = setInterval(loop, 30);

    function loop() {
        moveFundo();
        moveJogador();
        moveInimigos();
        moveAmigo();
        verificarColisoes();
        atualizarPlacar();
        atualizarEnergia();
    }

    function moveFundo() {
        const esquerda = parseInt($("#fundoGame").css("background-position"));
        $("#fundoGame").css("background-position", esquerda - 1);
    }

    function moveJogador() {
        if (jogo.pressionou[TECLA.W]) {
            let topo = parseInt($("#jogador").css("top"));
            $("#jogador").css("top", topo - 10);
            if (topo <= 0) $("#jogador").css("top", topo + 10);
        }

        if (jogo.pressionou[TECLA.S]) {
            let topo = parseInt($("#jogador").css("top"));
            $("#jogador").css("top", topo + 10);
            if (topo >= 434) $("#jogador").css("top", topo - 10);
        }

        if (jogo.pressionou[TECLA.P]) disparar();
    }

    function moveInimigos() {
        moveInimigo1();
        moveInimigo2();
    }

    function moveInimigo1() {
        let inimigo1 = $("#inimigo1");
        let posicaoX = parseInt(inimigo1.css("left"));
        inimigo1.css("left", posicaoX - velocidade);
        inimigo1.css("top", posicaoY);
        if (posicaoX <= 0) {
            posicaoY = parseInt(Math.random() * 334);
            inimigo1.css("left", 694);
            inimigo1.css("top", posicaoY);
        }
    }

    function moveInimigo2() {
        let inimigo2 = $("#inimigo2");
        let posicaoX = parseInt(inimigo2.css("left"));
        inimigo2.css("left", posicaoX - 3);
        if (posicaoX <= 0) inimigo2.css("left", 775);
    }

    function moveAmigo() {
        let amigo = $("#amigo");
        let posicaoX = parseInt(amigo.css("left"));
        amigo.css("left", posicaoX + 1);
        if (posicaoX > 906) amigo.css("left", 0);
    }

    function disparar() {
        if (podeAtirar) {
            sons.disparo.play();
            podeAtirar = false;

            let jogador = $("#jogador");
            let topo = parseInt(jogador.css("top"));
            let posicaoX = parseInt(jogador.css("left"));
            let tiroX = posicaoX + 190;
            let topoTiro = topo + 37;

            $("#fundoGame").append("<div id='disparo'></div>");
            let disparo = $("#disparo");
            disparo.css("top", topoTiro);
            disparo.css("left", tiroX);

            let tempoDisparo = setInterval(() => {
                let posicaoX = parseInt(disparo.css("left"));
                disparo.css("left", posicaoX + 15);
                if (posicaoX > 900) {
                    clearInterval(tempoDisparo);
                    disparo.remove();
                    podeAtirar = true;
                }
            }, 10);
        }
    }

    function verificarColisoes() {
        let jogador = $("#jogador");
        let disparo = $("#disparo");
        let inimigo1 = $("#inimigo1");
        let inimigo2 = $("#inimigo2");
        let amigo = $("#amigo");

        if (jogador.collision(inimigo1).length > 0) {
            energiaAtual--;
            let inimigo1X = parseInt(inimigo1.css("left"));
            let inimigo1Y = parseInt(inimigo1.css("top"));
            explosao(inimigo1X, inimigo1Y, "explosao1");
            inimigo1.css("left", 694);
            inimigo1.css("top", posicaoY = parseInt(Math.random() * 334));
        }

        if (jogador.collision(inimigo2).length > 0) {
            energiaAtual--;
            let inimigo2X = parseInt(inimigo2.css("left"));
            let inimigo2Y = parseInt(inimigo2.css("top"));
            explosao(inimigo2X, inimigo2Y, "explosao2");
            inimigo2.remove();
            reposicionarInimigo2();
        }

        if (disparo.collision(inimigo1).length > 0) {
            pontos += 100;
            velocidade += 0.3;
            let inimigo1X = parseInt(inimigo1.css("left"));
            let inimigo1Y = parseInt(inimigo1.css("top"));
            explosao(inimigo1X, inimigo1Y, "explosao1");
            disparo.css("left", 950);
            inimigo1.css("left", 694);
            inimigo1.css("top", posicaoY = parseInt(Math.random() * 334));
        }

        if (disparo.collision(inimigo2).length > 0) {
            pontos += 50;
            let inimigo2X = parseInt(inimigo2.css("left"));
            let inimigo2Y = parseInt(inimigo2.css("top"));
            explosao(inimigo2X, inimigo2Y, "explosao2");
            disparo.css("left", 950);
            inimigo2.remove();
            reposicionarInimigo2();
        }

        if (jogador.collision(amigo).length > 0) {
            salvos++;
            sons.resgate.play();
            amigo.remove();
            reposicionarAmigo();
        }

        if (inimigo2.collision(amigo).length > 0) {
            pontos -= 50;
            perdidos++;
            let amigoX = parseInt(amigo.css("left"));
            let amigoY = parseInt(amigo.css("top"));
            explosao(amigoX, amigoY, "explosao3", true);
            amigo.remove();
            reposicionarAmigo();
        }
    }

    function explosao(x, y, tipo, anima = false) {
        sons.explosao.play();
        $("#fundoGame").append(`<div id='${tipo}' ${anima ? "class='anima4'" : ""}></div>`);
        let div = $(`#${tipo}`);
        div.css("top", y);
        div.css("left", x);
        div.animate({ width: 200, opacity: 0 }, "slow");
        setTimeout(() => div.remove(), 1000);
    }

    function reposicionarInimigo2() {
        setTimeout(() => {
            if (!fimDeJogo) $("#fundoGame").append("<div id='inimigo2'></div>");
        }, 5000);
    }

    function reposicionarAmigo() {
        setTimeout(() => {
            if (!fimDeJogo) $("#fundoGame").append("<div id='amigo' class='anima3'></div>");
        }, 6000);
    }

    function atualizarPlacar() {
        $("#placar").html(`<h2> Pontos: ${pontos} Salvos: ${salvos} Perdidos: ${perdidos}</h2>`);
    }

    function atualizarEnergia() {
        let energiaImg = `img/energia${energiaAtual}.png`;
        $("#energia").css("background-image", `url(${energiaImg})`);
        if (energiaAtual === 0) gameOver();
    }

    function gameOver() {
        fimDeJogo = true;
        sons.musica.pause();
        sons.gameover.play();
        clearInterval(jogo.timer);
        $("#jogador, #inimigo1, #inimigo2, #amigo").remove();
        $("#fundoGame").append("<div id='fim'></div>");
        $("#fim").html(`<h1> Game Over </h1><p>Pontuação: ${pontos}</p><div id='reinicia' onClick='reiniciaJogo()'><h3>Jogar Novamente</h3></div>`);
    }
}

function reiniciaJogo() {
    document.getElementById("somGameover").pause();
    $("#fim").remove();
    start();
}
