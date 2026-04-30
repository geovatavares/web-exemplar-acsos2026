window.addEventListener("load", () => {
    if (window.ADHumanWCAG) {
        new window.ADHumanWCAG();
    } else {
        console.error("[ADHUMAN] Classe ADHumanWCAG não encontrada.");
    }
});
