function add() {
    const imagem = document.querySelector('.card-img-top');
    imagem.src = 'img/_vinicius_junior.png';

    const spanNome = document.getElementById('Nome').querySelector('.placeholder');
    const spanRank = document.getElementById('Rank');
    const spanData = document.getElementById('Data_Nas');
    const spanAltura = document.getElementById('Alutra'); 
    const spanPosicao = document.getElementById('Posição '); 

    spanNome.innerText = "Vinícius José Paixão de Oliveira Júnior";
    spanRank.innerText = "9,5";
    spanData.innerText = "12/07/2000 (25 anos)";
    spanAltura.innerText = "1,76 m";
    spanPosicao.innerText = "Ponta-esquerda / Atacante";

    const elementosComPlaceholder = document.querySelectorAll('.placeholder');

    elementosComPlaceholder.forEach(el => {
        el.classList.remove('placeholder');
        el.classList.add('card-text');
    });

    const glows = document.querySelectorAll('.placeholder-glow');
    glows.forEach(g => g.classList.remove('placeholder-glow'));
    
    spanRank.classList.remove('text-bg-secondary');
    spanRank.classList.add('text-bg-warning');
}