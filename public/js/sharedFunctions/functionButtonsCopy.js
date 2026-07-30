function copyDisponibilidade(botao) {
    const texto = `O/A senhor/a poderia me informar uma disponibilidade de horário para atender os técnicos *(período da manhã, período da tarde ou qualquer horário)*?:`
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copyDataMudanca(botao) {
    const texto = `Poderia me informar se já realizou a mudança para o novo local?`
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copyTipoTelhado(botao) {
    const texto = `Poderia me informar qual seria o modelo/tipo de telhado (Cerâmica, Eternit ou Zinco)?`
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copyOrientacaoTelhado(botao) {
    const texto = `Como o telhado seria de Eternit/Zinco é necessário que o/a senhor/a seja responsável por providenciar a abertura e o fechamento do telhado no dia da visita técnica (Pedreiro/Telhadista ou próprio cliente), para que os técnicos realizem o atendimento com segurança. Tudo bem?`
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copyPosteLocal(botao) {
    const texto = `Poderia me informar se há mais de um poste de energia atendendo dentro do imóvel?`
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copyNovoEndereco(botao) {
    const texto = `Poderia me mandar as informações do novo endereço? (Se não souber algum, não tem problema)
    \n(Estado) (Cidade) (CEP) (Bairro) - (Rua, número)`
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copyNomeTelefone(botao) {
    const texto = `O nome e telefone do agendamento, seria o mesmo que estamos falando? Ou gostaria de alterar/adicionar?`
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copyColetaCompleta(botao) {
    const texto = `O/A senhor/a poderia me informar estes dados para eu abrir a ordem de serviço: \nNome: \nTelefone:  
Disponibilidade de horário para atender os técnicos *(período da manhã, período da tarde ou qualquer horário)*?:`
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copyColetaRuralCompleta(botao) {
    const texto = `O/A senhor/a poderia me informar estes dados para eu abrir a ordem de serviço: \nNome: \nTelefone: \nLocalização:   
Disponibilidade de horário para atender os técnicos *(período da manhã, período da tarde ou qualquer horário)*?:`
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📋'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copyMudancaEnderecoCompleta(botao) {
    const texto = `De acordo com a Lei Geral de Proteção de Dados (LGPD), eu preciso confirmar seus dados para realizar a mudança de endereço. 
\nPoderia enviar um ÁUDIO informando seu nome completo e os 4 últimos dígitos do seu CPF por gentileza? (TITULAR)
\nTambém poderia me enviar uma foto do tipo SELFIE segurando algum documento com foto por gentileza? (TITULAR)
\n----------------------------------------------------\n
Poderia me passar algumas informações? 
\n*1. Já realizou a mudança para o no local? Se não, poderia me informar quando irá realizar a mudança?* \nR: 
\n*2. Qual seria o modelo/tipo de telhado (Cerâmica, Eternit ou Zinco)?* \nR: 
\n*3. Há mais de um poste de energia atendendo dentro do imóvel?* \nR: 
\n*4. O nome e telefone do agendamento seria o mesmo com quem estamos falando? Ou gostaria de alterar?* \nR: 
\n*5. Poderia me mandar as informações do novo endereço? (Se não souber algum, não tem problema)* 
\n(Estado) (Cidade) (CEP) (Bairro) - (Rua, número)
\n6. Poderia me passar uma disponibilidade de horário para atender os técnicos (Período da *MANhÃ*, *TARDE* ou *QUALQUER HORÁRIO*)? \nR:`
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, '📦'))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}