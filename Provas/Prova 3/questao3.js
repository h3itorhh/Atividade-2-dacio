function proximo() {

    document.getElementById("grupoA").innerHTML = `
        <h2>Grupo D</h2>
        <ul>
            <li>Estados Unidos</li>
            <li>Paraguai</li>
            <li>Austrália</li>
            <li>Turquia</li>
        </ul>
        <details>
            <summary>Saiba mais</summary>
            <p>EUA jogam em casa.</p>
        </details>
    `;

    document.getElementById("grupoB").innerHTML = `
        <h2>Grupo E</h2>
        <ul>
            <li>Alemanha</li>
            <li>Equador</li>
            <li>Costa do Marfim</li>
            <li>Curaçao</li>
        </ul>
        <details>
            <summary>Saiba mais</summary>
            <p>Alemanha costuma ir bem.</p>
        </details>
    `;

    document.getElementById("grupoC").innerHTML = `
        <h2>Grupo F</h2>
        <ul>
            <li>Holanda</li>
            <li>Japão</li>
            <li>Tunísia</li>
            <li>Suécia</li>
        </ul>
        <details>
            <summary>Saiba mais</summary>
            <p>Grupo equilibrado.</p>
        </details>
    `;
}
