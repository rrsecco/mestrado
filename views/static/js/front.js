const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

document.querySelector('.buttonStart').addEventListener('click', async () => {
    let infos = getInfos();
    
    if (!infos.user || !infos.password) {
        alert("Campos não preenchidos");
        return;
    }

    let emailValid = emailRegex.test(infos.user); 

    if (!emailValid) {
        alert("Email invalido");
        return;
    }

    clearInfos();

    try {
        let response = await fetch(`https://web-c391urlhqs1y.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/intranet/login/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(infos) 
        });

        if (response.ok) {
            console.log("Login bem-sucedido")
            // Adicionar ação depois
        } else {
            let errorData = await response.json();
            console.error("Erro ao fazer login: ", errorData.message);
            alert(errorData.message || "Erro ao fazer login"); 
        }
    } catch (error) {
        console.error("Erro no login", error);
        alert("Erro ao conectar ao servidor");
    }
});

function getInfos() {
    let GetUser = document.getElementById('id_email').value;
    let GetPassword = document.getElementById('id_senha').value;

    return { user: GetUser, password: GetPassword };
}

function clearInfos() {
    document.getElementById('id_email').value = "";
    document.getElementById('id_senha').value = "";
}
