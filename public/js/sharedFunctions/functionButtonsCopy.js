function feedbackBtn(botao, textoOriginal) {
    mostrarAlerta('Copiado com sucesso!', 'sucesso');
    if (!botao) return;
    if (!botao.dataset.originalText) {
        botao.dataset.originalText = botao.classList.contains('template-btn')
            ? botao.innerHTML
            : (textoOriginal || botao.textContent);
    }
    const restaurar = botao.dataset.originalText;
    botao.textContent = '✅ Copiado!';
    botao.disabled = true;
    setTimeout(() => {
        if (botao.classList.contains('template-btn')) {
            botao.innerHTML = restaurar;
        } else {
            botao.textContent = restaurar;
        }
        botao.disabled = false;
    }, 1000);
}

function copiarTextoTemplate(texto, botao) {
    const textoOrig = botao ? botao.textContent : '📋 Copiar';
    navigator.clipboard.writeText(texto)
        .then(() => feedbackBtn(botao, textoOrig))
        .catch(() => mostrarAlerta('Erro ao copiar!'));
}

function copiarTemplateValores(tipo, botao) {
    let resolvedTipo = tipo;
    if (tipo === 'verificacao') {
        const area = document.querySelector('input[name="area-verificacao"]:checked')?.value;
        resolvedTipo = area === 'v_rural' ? 'verificacao-rural' : 'verificacao-urbana';
    } else if (tipo === 'config') {
        const area = document.querySelector('input[name="area-config"]:checked')?.value;
        resolvedTipo = area === 'c_rural' ? 'config-rural' : 'config-urbana';
    }
    const mapId = {
        'comodo':             'servicos-valores-comodo',
        'passagem':           'servicos-valores-passagem',
        'verificacao-urbana': 'servicos-verificacao-urbana',
        'verificacao-rural':  'servicos-verificacao-rural',
        'config-urbana':      'servicos-config-urbana',
        'config-rural':       'servicos-config-rural'
    };
    const id = mapId[resolvedTipo] || resolvedTipo;
    const item = TEMPLATES_CATALOGO.find(t => t.id === id);
    if (!item) return;
    copiarTextoTemplate(item.texto, botao);
    try { salvarHistorico(item.texto, item.titulo); } catch (e) {}
}

function copyDisponibilidade(botao) {
    const texto = `O/A senhor/a poderia me informar uma disponibilidade de horário para atender os técnicos *(período da manhã, período da tarde ou qualquer horário)*?:`;
    copiarTextoTemplate(texto, botao);
}

function copyDataMudanca(botao) {
    const texto = `Poderia me informar se já realizou a mudança para o novo local?`;
    copiarTextoTemplate(texto, botao);
}

function copyTipoTelhado(botao) {
    const texto = `Poderia me informar qual seria o modelo/tipo de telhado (Cerâmica, Eternit ou Zinco)?`;
    copiarTextoTemplate(texto, botao);
}

function copyOrientacaoTelhado(botao) {
    const texto = `Como o telhado seria de Eternit/Zinco é necessário que o/a senhor/a seja responsável por providenciar a abertura e o fechamento do telhado no dia da visita técnica (Pedreiro/Telhadista ou próprio cliente), para que os técnicos realizem o atendimento com segurança. Tudo bem?`;
    copiarTextoTemplate(texto, botao);
}

function copyPosteLocal(botao) {
    const texto = `Poderia me informar se há mais de um poste de energia atendendo dentro do imóvel?`;
    copiarTextoTemplate(texto, botao);
}

function copyNovoEndereco(botao) {
    const texto = `Poderia me mandar as informações do novo endereço? (Se não souber algum, não tem problema)\n\n(Estado) (Cidade) (CEP) (Bairro) - (Rua, número)`;
    copiarTextoTemplate(texto, botao);
}

function copyNomeTelefone(botao) {
    const texto = `O nome e telefone do agendamento, seria o mesmo que estamos falando? Ou gostaria de alterar/adicionar?`;
    copiarTextoTemplate(texto, botao);
}

function copyColetaCompleta(botao) {
    const texto = `O/A senhor/a poderia me informar estes dados para eu abrir a ordem de serviço: \nNome: \nTelefone:  \nDisponibilidade de horário para atender os técnicos *(período da manhã, período da tarde ou qualquer horário)*?:`;
    copiarTextoTemplate(texto, botao);
}

function copyColetaRuralCompleta(botao) {
    const texto = `O/A senhor/a poderia me informar estes dados para eu abrir a ordem de serviço: \nNome: \nTelefone: \nLocalização:   \nDisponibilidade de horário para atender os técnicos *(período da manhã, período da tarde ou qualquer horário)*?:`;
    copiarTextoTemplate(texto, botao);
}

function copyMudancaEnderecoCompleta(botao) {
    const texto = `De acordo com a Lei Geral de Proteção de Dados (LGPD), eu preciso confirmar seus dados para realizar a mudança de endereço. \n\nPoderia enviar um ÁUDIO informando seu nome completo e os 4 últimos dígitos do seu CPF por gentileza? (TITULAR)\n\nTambém poderia me enviar uma foto do tipo SELFIE segurando algum documento com foto por gentileza? (TITULAR)\n\n----------------------------------------------------\n\nPoderia me passar algumas informações? \n\n*1. Já realizou a mudança para o novo local? Se não, poderia me informar quando irá realizar a mudança?* \nR: \n\n*2. Qual seria o modelo/tipo de telhado (Cerâmica, Eternit ou Zinco)?* \nR: \n\n*3. Há mais de um poste de energia atendendo dentro do imóvel?* \nR: \n\n*4. O nome e telefone do agendamento seria o mesmo com quem estamos falando? Ou gostaria de alterar?* \nR: \n\n*5. Poderia me mandar as informações do novo endereço? (Se não souber algum, não tem problema)* \n\n(Estado) (Cidade) (CEP) (Bairro) - (Rua, número)\n\n*6. Poderia me passar uma disponibilidade de horário para atender os técnicos (Período da MANHÃ, TARDE ou QUALQUER HORÁRIO)?* \nR:`;
    copiarTextoTemplate(texto, botao);
}

function copyReboot(botao) {
    const texto = `Poderia realizar um procedimento?\nPreciso que retire o roteador da tomada, atrás do roteador vai ter alguns cabos conectados, não precisa tirar esses cabos do lugar, mas dá uma forçadinha neles pra dar uma encaixada melhor, depois pode voltar o roteador na tomada por gentileza?`;
    copiarTextoTemplate(texto, botao);
}

function copyPatchCordService(botao) {
    const texto = `Poderia realizar um procedimento?\nPreciso que retire o roteador da tomada. Em seguida, em baixo ou atrás do roteador há um cabo com a ponta verde conectado, por gentileza retire essa ponta e conecte-o novamente, garantindo que estejam bem encaixados, além de reconectar os demais cabos conectados atrás do equipamento além da fibra. Depois, pode ligar o roteador novamente na tomada.`;
    copiarTextoTemplate(texto, botao);
}

function copyPatchCordBridge(botao) {
    const texto = `Poderia realizar um procedimento?\nPreciso que retire o roteador e a caixinha da tomada. Em seguida, atrás de ambos há alguns cabos conectados, por gentileza, retire esses cabos e conecte-os novamente, garantindo que estejam bem encaixados. Depois, pode ligar o roteador e a ONU (Caixinha sem antenas) novamente na tomada.`;
    copiarTextoTemplate(texto, botao);
}

function copyPatchCordRadio(botao) {
    const texto = `Preciso que retire o roteador da tomada. Em seguida, atrás há alguns cabos conectados, por gentileza, retire esses cabos e conecte-os novamente, garantindo que estejam bem encaixados. Depois, pode ligar o roteador novamente na tomada.\n\nTambém realize esse procedimento na PoE (Que seria o equipamento branco/preto onde recebe um cabo do rádio e conecta outro cabo no roteador), lembrando que os cabos devem estar conectados no mesmo lugar de antes.`;
    copiarTextoTemplate(texto, botao);
}

function copyTemplateVerificacaoUrbana(botao) {
    const texto = `Verifiquei e é necessário realizar uma visita técnica com custo no local, pois o serviço seria uma Verificação de Rede Interna.\nO valor do serviço é de R$ 50,00. Sendo necessário realizar o pagamento antecipado.\nCaso haja necessidade de realizar algum serviço com cobrança no local, será informado pelo técnico e cobrado na próxima mensalidade.\n\nCustos adicionais caso deseje realizar no local:\nPassagem de cabo por Cômodo adicional: R$ 50,00\nMetragem de cabo de rede (caso necessário): R$ 3,75\nConector RJ45 (cada): R$ 2,50`;
    copiarTextoTemplate(texto, botao);
}

function copyTemplateConfigRotUrbana(botao) {
    const texto = `Prazo: A Configuração de Roteador terá um prazo de 48 horas úteis, caso não ocorra nenhum imprevisto\nValores: Mão de obra: R$ 50,00\nTaxa: A taxa de R$ 50,00 (mão de obra) deverá ser paga antecipadamente\nPoderá ser apresentado um orçamento adicional no local dependendo da avaliação do técnico\n\nCaso deseje realizar a passagem de cabo durante a visita, esses são os valores:\nMetragem de cabo de rede (Caso necessário): R$ 3,75\nConector RJ45 (cada): R$ 2,50\nCômodo adicional: R$ 50,00\nPrazo pagamento da metragem: Metragem de cabo utilizado será cobrado na próxima mensalidade`;
    copiarTextoTemplate(texto, botao);
}

function copyTemplateConfigRotRural(botao) {
    const texto = `Prazo: A Configuração de Roteador terá um prazo de 48 horas úteis, caso não ocorra nenhum imprevisto\nValores: Mão de obra: R$ 100,00\nTaxa: A taxa de R$ 100,00 (mão de obra) deverá ser paga antecipadamente\nPoderá ser apresentado um orçamento adicional no local dependendo da avaliação do técnico\n\nCaso deseje realizar a passagem de cabo durante a visita, esses são os valores:\nMetragem de cabo de rede (Caso necessário): R$ 3,75\nConector RJ45 (cada): R$ 2,50\nCômodo adicional: R$ 50,00\nPrazo pagamento da metragem: Metragem de cabo utilizado será cobrado na próxima mensalidade`;
    copiarTextoTemplate(texto, botao);
}

// ── Catálogo Completo de Templates por Screen (baseado nos arquivos .md) ──────
const TEMPLATES_CATALOGO = [
    // ==================== GERAL / INÍCIO ====================
    {
        id: 'apresentacao-continuidade',
        screens: ['/', '/atendimento', '/nivel2'],
        categoria: '👋 Apresentação e Triagem',
        titulo: '👋 Apresentação (Continuidade)',
        texto: `Boa tarde!\nSou *{{nome_atendente}}*, do Suporte Técnico do Grupo CedNet, tudo bem?\nVou dar continuidade ao seu atendimento`
    },
    {
        id: 'apresentacao-manha',
        screens: ['/', '/atendimento'],
        categoria: '👋 Apresentação e Triagem',
        titulo: '☀️ Apresentação (Manhã)',
        texto: `Bom dia! Sou *{{nome_atendente}}*, do Suporte Técnico do Grupo CedNet, tudo bem?\nVou dar início ao seu atendimento, como posso ajudar?`
    },
    {
        id: 'apresentacao-tarde',
        screens: ['/', '/atendimento'],
        categoria: '👋 Apresentação e Triagem',
        titulo: '🌤️ Apresentação (Tarde)',
        texto: `Boa tarde! Sou *{{nome_atendente}}*, do Suporte Técnico do Grupo CedNet, tudo bem?\nVou dar início ao seu atendimento, como posso ajudar?`
    },
    {
        id: 'apresentacao-noite',
        screens: ['/', '/atendimento'],
        categoria: '👋 Apresentação e Triagem',
        titulo: '🌙 Apresentação (Noite)',
        texto: `Boa noite! Sou *{{nome_atendente}}*, do Suporte Técnico do Grupo CedNet, tudo bem?\nVou dar início ao seu atendimento, como posso ajudar?`
    },
    {
        id: 'apresentacao-massiva',
        screens: ['/', '/atendimento', '/sem-conexao'],
        categoria: '👋 Apresentação e Triagem',
        titulo: '🚨 Apresentação (Alto Fluxo / Massiva)',
        texto: `Boa tarde, meu nome é *{{nome_atendente}}*, sou atendente do suporte técnico.\nPeço desculpas pela demora no atendimento, estamos com um alto fluxo de chamados.\nPoderia verificar se sua conexão está normalizada por gentileza?\nCaso ainda esteja com algum problema, informar o nome completo do cadastro e a cidade fazendo um favor.`
    },
    {
        id: 'pedir-nome-cidade',
        screens: ['/', '/atendimento', '/sem-conexao', '/conexao-lenta'],
        categoria: '👋 Apresentação e Triagem',
        titulo: '🪪 Solicitar Nome + Cidade',
        texto: `Poderia informar o nome completo do cadastro e a cidade fazendo um favor?`
    },
    {
        id: 'confirmacao-lgpd',
        screens: ['/', '/atendimento', '/mudanca-endereco', '/servicos', '/verificacao-rede', '/duvidas', '/pagamento'],
        categoria: '🔒 Confirmação LGPD',
        titulo: '🔒 Solicitar Áudio + Selfie (LGPD)',
        texto: `De acordo com a Lei Geral de Proteção de Dados (LGPD), eu preciso confirmar seus dados.\n\nPoderia enviar um ÁUDIO informando seu nome completo e os 4 últimos dígitos do seu CPF por gentileza? (TITULAR)\n\nTambém poderia me enviar uma foto do tipo SELFIE segurando algum documento com foto por gentileza? (TITULAR) - Segue o exemplo:`
    },
    {
        id: 'alerta-inatividade',
        screens: ['/', '/atendimento', '/sem-conexao', '/conexao-lenta', '/duvidas'],
        categoria: '✅ Finalização e Interação',
        titulo: '⏳ Alerta de Inatividade',
        texto: `Olá, gostaria de prosseguir com o atendimento?`
    },
    {
        id: 'ajudar-algo-mais',
        screens: ['/', '/atendimento', '/sem-conexao', '/conexao-lenta', '/mudanca-endereco', '/servicos', '/sva', '/pagamento', '/duvidas'],
        categoria: '✅ Finalização e Interação',
        titulo: '❓ Posso ajudar em algo mais?',
        texto: `Posso ajudar em algo mais?`
    },
    {
        id: 'finalizacao-opa-24h',
        screens: ['/', '/atendimento', '/sem-conexao', '/conexao-lenta', '/mudanca-endereco', '/servicos', '/sva', '/pagamento', '/duvidas'],
        categoria: '✅ Finalização e Interação',
        titulo: '🏁 Finalização Opa! Suite (24/7)',
        texto: `Caso precise de algo ou tenha dúvidas, pode retornar contato conosco! Nossa equipe está disponível 24h os 7 dias da semana (Incluindo feriados).`
    },

    // ==================== PROCEDIMENTOS (SEM CONEXÃO / CONEXÃO LENTA) ====================
    {
        id: 'verificando-conexao',
        screens: ['/sem-conexao', '/conexao-lenta'],
        categoria: '🔍 Diagnóstico em Andamento',
        titulo: '🔍 Estou verificando a conexão',
        texto: `Estou verificando a conexão, só um momento`
    },
    {
        id: 'alteracoes-conexao',
        screens: ['/conexao-lenta', '/sem-conexao'],
        categoria: '🔍 Diagnóstico em Andamento',
        titulo: '⚙️ Realizando alterações (pode cair)',
        texto: `Estou realizando algumas alterações em sua conexão e pode ser que ela caia por um momento, tudo bem?`
    },
    {
        id: 'assim-que-reestabelecer',
        screens: ['/conexao-lenta', '/sem-conexao'],
        categoria: '🔍 Diagnóstico em Andamento',
        titulo: '📶 Verificar se normalizou após voltar',
        texto: `Assim que ela reestabelecer, verifique e me informe por gentileza se a conexão normalizou`
    },
    {
        id: 'foto-adesivo-roteador',
        screens: ['/sem-conexao', '/conexao-lenta'],
        categoria: '🔍 Diagnóstico em Andamento',
        titulo: '📸 Pedir foto do adesivo do roteador',
        texto: `Embaixo do roteador, tem um adesivo colado nele, poderia me enviar uma foto desse adesivo por gentileza?`
    },
    {
        id: 'proc-reboot',
        screens: ['/', '/atendimento', '/sem-conexao', '/conexao-lenta'],
        categoria: '🔌 Procedimentos (Reboot e Cabos)',
        titulo: '🔄 Reboot Simples (Forçar cabos)',
        texto: `Poderia realizar um procedimento?\nPreciso que retire o roteador da tomada, atrás do roteador vai ter alguns cabos conectados, não precisa tirar esses cabos do lugar, mas dá uma forçadinha neles pra dar uma encaixada melhor, depois pode voltar o roteador na tomada por gentileza?`
    },
    {
        id: 'proc-patch-service',
        screens: ['/', '/atendimento', '/sem-conexao', '/conexao-lenta'],
        categoria: '🔌 Procedimentos (Reboot e Cabos)',
        titulo: '🔌 Patch Cord Service (Ponta Verde)',
        texto: `Poderia realizar um procedimento?\nPreciso que retire o roteador da tomada. Em seguida, em baixo ou atrás do roteador há um cabo com a ponta verde conectado, por gentileza retire essa ponta e conecte-o novamente, garantindo que estejam bem encaixados, além de reconectar os demais cabos conectados atrás do equipamento além da fibra. Depois, pode ligar o roteador novamente na tomada.`
    },
    {
        id: 'proc-patch-bridge',
        screens: ['/', '/atendimento', '/sem-conexao', '/conexao-lenta'],
        categoria: '🔌 Procedimentos (Reboot e Cabos)',
        titulo: '🔌 Patch Cord Bridge (Roteador + ONU)',
        texto: `Poderia realizar um procedimento?\nPreciso que retire o roteador e a caixinha da tomada. Em seguida, atrás de ambos há alguns cabos conectados, por gentileza, retire esses cabos e conecte-os novamente, garantindo que estejam bem encaixados. Depois, pode ligar o roteador e a ONU (Caixinha sem antenas) novamente na tomada.`
    },
    {
        id: 'proc-patch-radio',
        screens: ['/', '/atendimento', '/sem-conexao', '/conexao-lenta'],
        categoria: '🔌 Procedimentos (Reboot e Cabos)',
        titulo: '📡 Patch Cord Rádio + PoE',
        texto: `Preciso que retire o roteador da tomada. Em seguida, atrás há alguns cabos conectados, por gentileza, retire esses cabos e conecte-os novamente, garantindo que estejam bem encaixados. Depois, pode ligar o roteador novamente na tomada.\n\nTambém realize esse procedimento na PoE (Que seria o equipamento branco/preto onde recebe um cabo do rádio e conecta outro cabo no roteador), lembrando que os cabos devem estar conectados no mesmo lugar de antes.`
    },
    {
        id: 'proc-avise-quando-fizer',
        screens: ['/sem-conexao', '/conexao-lenta'],
        categoria: '🔌 Procedimentos (Reboot e Cabos)',
        titulo: '🗣️ Me avise quando finalizar',
        texto: `Me avise assim que realizar esse procedimento, por gentileza`
    },
    {
        id: 'proc-aguarde-3min',
        screens: ['/sem-conexao', '/conexao-lenta'],
        categoria: '🔌 Procedimentos (Reboot e Cabos)',
        titulo: '⏱️ Aguardar 3 min (Geral)',
        texto: `Belezinha, aguarde 3 minutinhos e verifique se a conexão normalizou`
    },
    {
        id: 'proc-aguarde-1min-los',
        screens: ['/sem-conexao'],
        categoria: '🔌 Procedimentos (Reboot e Cabos)',
        titulo: '🔴 Aguardar 1 min (Luz Vermelha / LOS)',
        texto: `Beleza, aguarde 1 minutinho e verifique se a luz vermelha ainda aparece e se a conexão normalizou`
    },
    {
        id: 'proc-reiniciar-aparelhos',
        screens: ['/conexao-lenta', '/sem-conexao'],
        categoria: '🔌 Procedimentos (Reboot e Cabos)',
        titulo: '📱 Reiniciar Celulares / PCs / TVs',
        texto: `Sua conexão irá cair e retornar em seguida, por gentileza:\n\nREINICIE CELULARES\nREINICIE COMPUTADORES\nREINICIE TVS\n\nApós, reconecte na rede e teste novamente ok!`
    },

    // ==================== MASSIVA / CAIXA OFF / BASE OFF (SEM CONEXÃO) ====================
    {
        id: 'caixa-off-simples',
        screens: ['/sem-conexao'],
        categoria: '🚨 Caixa OFF / Base OFF / Massiva',
        titulo: '📦 Caixa OFF (Aviso Simples)',
        texto: `Verifiquei e há um problema no local afetando a conexão de uma pequena região, pois foi identificado um problema na caixa. Os técnicos já foram avisados e realizarão a manutenção assim que possível`
    },
    {
        id: 'caixa-off-prazo-6h',
        screens: ['/sem-conexao'],
        categoria: '🚨 Caixa OFF / Base OFF / Massiva',
        titulo: '📦 B.O Caixa + Prazo 6h (JIRA)',
        texto: `Verifiquei e está constando um problema na CAIXA de conexão do local afetando uma pequena região. Já foi aberto um chamado e assim que possível os técnicos serão encaminhados para a manutenção no local.\nProvavelmente um possível rompimento de fibra e/ou problema na caixa.\n\nO prazo inicial de manutenção da Caixa (caso não ocorra nenhum imprevisto) é de 6 horas corridas. O setor responsável está verificando a disponibilidade das equipes, assim que disponível, os técnicos irão ao local.`
    },
    {
        id: 'prazo-radio-base',
        screens: ['/sem-conexao'],
        categoria: '🚨 Caixa OFF / Base OFF / Massiva',
        titulo: '📡 Problema na Base / Região (Com Prazo)',
        texto: `Identifiquei um problema em sua base/região que está afetando a sua conexão.\nNossa equipe técnica já está ciente e trabalhando para resolver o problema.\n\nA previsão inicial para a normalização da sua conexão é até [DATA] às [HORA], podendo ser restabelecida antes desse horário.\n\nNo entanto, informo que, em algumas situações, o prazo pode ser estendido devido a fatores externos, como tempestades, condições climáticas severas ou locais de difícil acesso, que podem dificultar a execução do serviço dentro do tempo estimado.\n\nCaso a conexão não seja restabelecida até o horário previsto, peço que entre em contato novamente para que possamos realizar uma nova verificação e dar continuidade ao atendimento, garantindo a restauração completa do serviço.\n\nPeço desculpas pelo transtorno e agradeço sua compreensão e paciência.\n\nEstou à disposição para qualquer dúvida.`
    },
    {
        id: 'sem-prazo-massiva',
        screens: ['/sem-conexao'],
        categoria: '🚨 Caixa OFF / Base OFF / Massiva',
        titulo: '🌐 Massiva / Região (Sem Previsão)',
        texto: `Identificamos um problema geral na sua região que está afetando a conexão. Nossa equipe técnica já está ciente da situação e trabalhando para normalizar o serviço o mais rápido possível.\n\nNo momento, infelizmente, ainda não temos uma previsão exata para a resolução, mas estamos empenhados em solucionar o problema o quanto antes, para que sua conexão seja restabelecida com a maior brevidade possível.\n\nPedimos desculpas pelos transtornos causados e agradecemos muito pela sua compreensão e paciência neste momento. Sabemos o quanto a conexão é importante no dia a dia e estamos fazendo o possível para resolver a situação o mais rápido possível.\n\nAgradecemos pela compreensão e permanecemos à disposição caso precise de algum esclarecimento adicional.`
    },
    {
        id: 'desculpas-transtorno',
        screens: ['/sem-conexao', '/conexao-lenta', '/duvidas'],
        categoria: '🚨 Caixa OFF / Base OFF / Massiva',
        titulo: '🙏 Pedido de Desculpas pelo Transtorno',
        texto: `Novamente, pedimos desculpas pelo transtorno.\nReforçamos que nossa equipe está empenhada em solucionar o problema o mais rápido possível`
    },
    {
        id: 'jira-encerrado-os',
        screens: ['/sem-conexao'],
        categoria: '🚨 Caixa OFF / Base OFF / Massiva',
        titulo: '✅ Encerramento de O.S. (JIRA Encerrado)',
        texto: `Chamado no JIRA encerrado.\nCliente conectado e navegando.\nProtocolo encerrado.`
    },

    // ==================== CONEXÃO LENTA (ESPECÍFICOS) ====================
    {
        id: 'retorno-conexao-lenta',
        screens: ['/conexao-lenta'],
        categoria: '🐢 Triagem e Explicações (Conexão Lenta)',
        titulo: '📞 Retornando Contato (Conexão Lenta)',
        texto: `Olá, boa tarde, tudo bem?\n\nEstou entrando em contato referente ao protocolo de 'Conexão Lenta' aberto em nosso sistema. Poderia me informar se a conexão permanece lenta ou se já foi normalizada?`
    },
    {
        id: 'pergunta-equipamento-tv',
        screens: ['/conexao-lenta'],
        categoria: '🐢 Triagem e Explicações (Conexão Lenta)',
        titulo: '📺 Em qual equipamento ocorre?',
        texto: `Esse problema está acontecendo em algum equipamento em específico? Somente na TV, somente computador, somente no celular? Ou em ambos?`
    },
    {
        id: 'pergunta-smart-tvbox',
        screens: ['/conexao-lenta', '/sva'],
        categoria: '🐢 Triagem e Explicações (Conexão Lenta)',
        titulo: '📦 TV é Smart ou TV Box?',
        texto: `Sua TV é smart ou você utiliza aqueles equipamentos TV BOX?`
    },
    {
        id: 'explicacao-manutencao-remota',
        screens: ['/conexao-lenta', '/sem-conexao'],
        categoria: '🐢 Triagem e Explicações (Conexão Lenta)',
        titulo: '🛠️ Explicação Diagnóstico Remoto',
        texto: `Para garantir um atendimento ágil e eficiente, iniciamos com uma etapa de diagnóstico remoto, onde realizamos testes para verificar se a situação pode ser solucionada de imediato ou, caso persista, identificar com maior precisão a sua causa. Esse processo permite resolver a maioria dos casos sem a necessidade de deslocamento. No entanto, se for constatada a necessidade de intervenção técnica presencial, o agendamento da visita será realizado prontamente.`
    },
    {
        id: 'explicacao-distancia-wifi',
        screens: ['/conexao-lenta', '/duvidas'],
        categoria: '🐢 Triagem e Explicações (Conexão Lenta)',
        titulo: '📶 Explicação Alcance / Obstáculos Wi-Fi',
        texto: `Gostaríamos de informar que a qualidade e o alcance do sinal Wi-Fi podem sofrer interferências devido a diversos fatores, como *paredes, portas fechadas, móveis, espelhos, distância do roteador e o local onde o equipamento está instalado*.\n\nEsses obstáculos podem reduzir a intensidade do sinal, fazendo com que alguns cômodos recebam uma conexão mais fraca ou até mesmo fiquem sem cobertura Wi-Fi adequada.\n\nÉ importante ressaltar que a cobertura Wi-Fi pode variar de acordo com as características do imóvel e os obstáculos presentes. Por esse motivo, *não é possível garantir que o sinal alcance todos os ambientes com a mesma intensidade e qualidade*.\n\nAgradecemos pela compreensão e permanecemos à disposição para auxiliá-lo no que for necessário!`
    },
    {
        id: 'explicacao-24g-5g',
        screens: ['/conexao-lenta', '/duvidas'],
        categoria: '🐢 Triagem e Explicações (Conexão Lenta)',
        titulo: '📡 Diferença 2.4GHz vs 5GHz vs Cabo',
        texto: `Sobre as conexões eu irei explicar para o senhor:\n\n2.4Ghz - Conexão de potência menor porém longo alcance e disponibilidade para praticamente todos os dispositivos. Varia de 20/40/60/90 megas\n\n5G - Conexão de potência maior, maior passagem de banda para o aparelho porém alcance menor e disponível para aparelhos atuais.\nQuanto mais distante do aparelho e obstáculos no caminho (como paredes, armários, etc) a conexão 5G fica lenta e desconecta praticamente sozinho, então as conexões irão variar de acordo com a distância\n\nCabeada - Caso equipamento seja compatível, irá passar banda total!\n\nQuanto mais distante, conexão 2.4Ghz\nQuanto mais próximo aos aparelhos, conexão 5G\nBanda total, somente cabeada`
    },
    {
        id: 'explicacao-speedtest-100',
        screens: ['/conexao-lenta', '/duvidas'],
        categoria: '🐢 Triagem e Explicações (Conexão Lenta)',
        titulo: '🚀 Garantia de Velocidade (40% / 80% / 100%)',
        texto: `Trabalhamos para entregar sempre 100% da velocidade contratada. No entanto, podem ocorrer oscilações ou limitações técnicas que fogem ao controle do Grupo CedNet, como a capacidade dos dispositivos do cliente (computadores ou celulares mais antigos, que podem não suportar altas velocidades), e eventuais lentidões nos sites ou serviços acessados.\n\nEntão, para garantir a qualidade do serviço, seguimos os seguintes parâmetros: durante os testes, a velocidade instantânea não poderá ser inferior a 40% do plano contratado, e a média mensal não poderá ser inferior a 80%.\n\nE para obter os resultados mais precisos, orientamos que os testes sejam realizados em um computador conectado diretamente ao roteador por cabo de rede, evitando interferências comuns do Wi-Fi.\n\n*Exemplo:* Em um plano de 600 mega, a velocidade via cabo de rede deve ser de no mínimo 240 mega, ou seja, 40%. E a média mensal deve ser de pelo menos 480 mega (80%). Porém, reforçamos que esses números representam garantias mínimas estabelecidas no contrato, mas não limitam o nosso padrão de qualidade. Nosso compromisso é sempre disponibilizar a maior velocidade possível, buscando entregar 100% da velocidade contratada.\n_(Conforme a Cláusula 4ª do seu Termo de Adesão)_`
    },
    {
        id: 'os-instalar-care',
        screens: ['/conexao-lenta'],
        categoria: '📋 Modelos Extras de O.S.',
        titulo: '📋 Modelo O.S. Instalar CARE (/100 -> /1GB)',
        texto: `Cliente: \nTelefone:  / ligar antes\nDisponibilidade:  / ligar antes\nDescrição: Instalar CARE\n\nCliente entrou em contato com conexão lenta\n\nPPPoe UP\nONU normal - DBm\n\nApós reboot manual, normalizou conexão no local\n\nVerificado sem acesso remoto\nVerificado sem ACS\nVerificado SSH = /100 Mbps\nVerificado DmView = /100 Mbps\nVerificado e possui um roteador /100 no local\nVerificado plano: \n\nOrientado cliente que eu estaria abrindo uma O.S e pedindo a troca de seu equipamento, cliente aceitou\n\nPOR GENTILEZA INSTALAR CARE /1GB NO LOCAL\n\nCLIENTE CIENTE DO PRAZO DE 48 HORAS ÚTEIS\n\nVerificar integridade da fibra\nVerificar equipamentos\nVerificar cabeamentos\nVerificar configuração\nEfetuar testes junto ao mesmo\n\nPPPoE:\nUsuário: \nSenha: `
    },

    // ==================== AGENDAMENTO E PRAZOS ====================
    {
        id: 'coleta-confirmacao-fibra',
        screens: ['/sem-conexao', '/conexao-lenta'],
        categoria: '📅 Coleta de Agendamento e Prazos',
        titulo: '📋 Coleta Visita Fibra (Com Explicação)',
        texto: `Realizei todas as verificações e será necessário realizar uma visita técnica para os técnicos analisarem os cabos e equipamentos do local, ok?\n\nO senhor/a poderia me informar estes dados para eu abrir a ordem de serviço:\n\nNome:\nTelefone:\nDisponibilidade de horário para atender os técnicos *(período da manhã, período da tarde ou qualquer horário)*?:`
    },
    {
        id: 'coleta-confirmacao-rural',
        screens: ['/sem-conexao', '/conexao-lenta'],
        categoria: '📅 Coleta de Agendamento e Prazos',
        titulo: '🌾 Coleta Visita Rural (Com Localização)',
        texto: `Realizei todas as verificações e será necessário realizar uma visita técnica para os técnicos analisarem os cabos e equipamentos do local, ok?\n\nO senhor/a poderia me informar estes dados para eu abrir a ordem de serviço:\n\nNome:\nTelefone:\nLocalização:\nDisponibilidade de horário para atender os técnicos *(período da manhã, período da tarde ou qualquer horário)*?:`
    },
    {
        id: 'prazo-sem-conexao-24h',
        screens: ['/sem-conexao', '/duvidas'],
        categoria: '📅 Coleta de Agendamento e Prazos',
        titulo: '⏱️ Prazo Sem Conexão (24h corridas)',
        texto: `Perfeito! Agendamento realizado!\n\nO prazo máximo para a realização da visita técnica é de *24 horas corridas*, porém sempre buscamos enviar o técnico o mais rápido possível.\nO setor responsável pelo agendamento verificará a disponibilidade, assim que definido, a confirmação do dia e horário será feita por ligação ou mensagem.\n\nPoderia ajudar em algo mais?`
    },
    {
        id: 'prazo-conexao-lenta-48h',
        screens: ['/conexao-lenta', '/mudanca-endereco', '/servicos', '/verificacao-rede', '/duvidas'],
        categoria: '📅 Coleta de Agendamento e Prazos',
        titulo: '⏱️ Prazo Visita / Serviços (48h úteis)',
        texto: `Perfeito! Agendamento realizado!\n\nO prazo máximo para a realização da visita técnica é de *48 horas ÚTEIS*, porém sempre buscamos enviar o técnico o mais rápido possível.\nO setor responsável pelo agendamento verificará a disponibilidade, assim que definido, a confirmação do dia e horário será feita por ligação ou mensagem.\n\nPoderia ajudar em algo mais?`
    },
    {
        id: 'prazo-corporativo-4h',
        screens: ['/sem-conexao', '/conexao-lenta', '/duvidas'],
        categoria: '📅 Coleta de Agendamento e Prazos',
        titulo: '🏢 Prazo Cliente Corporativo (4 horas)',
        texto: `Perfeito! Agendamento realizado!\n\nO prazo máximo para a realização da visita técnica é de *4 horas*, porém sempre buscamos enviar o técnico o mais rápido possível.\nO setor responsável pelo agendamento verificará a disponibilidade, assim que definido, a confirmação do dia e horário será feita por ligação ou mensagem.\n\nPoderia ajudar em algo mais?`
    },
    {
        id: 'prazo-30-dias',
        screens: ['/duvidas', '/servicos'],
        categoria: '📅 Coleta de Agendamento e Prazos',
        titulo: '🗓️ Prazo 30 Dias',
        texto: `Perfeito! Agendamento realizado!\n\nO prazo máximo para a realização da visita técnica é de *30 DIAS*, porém sempre buscamos enviar o técnico o mais rápido possível.\nO setor responsável pelo agendamento verificará a disponibilidade, assim que definido, a confirmação do dia e horário será feita por ligação ou mensagem.\n\nPoderia ajudar em algo mais?`
    },
    {
        id: 'disponibilidade-equipes',
        screens: ['/sem-conexao', '/conexao-lenta', '/duvidas'],
        categoria: '📅 Coleta de Agendamento e Prazos',
        titulo: '🚗 Equipes verificando disponibilidade',
        texto: `O setor responsável está verificando a disponibilidade das equipes, assim que disponível, entrarão em contato avisando`
    },
    {
        id: 'ja-agendado-24h',
        screens: ['/sem-conexao', '/duvidas'],
        categoria: '📅 Coleta de Agendamento e Prazos',
        titulo: '📌 Visita já agendada (Prazo 24h)',
        texto: `Sr(a)., o agendamento já foi realizado e tem o prazo de 24h caso não ocorra nenhum imprevisto. Os técnicos irão realizar a manutenção no local assim que possível.`
    },

    // ==================== MUDANÇA DE ENDEREÇO ====================
    {
        id: 'mudanca-completa-6-perguntas',
        screens: ['/', '/atendimento', '/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço',
        titulo: '📦 Questionário Completo (LGPD + 6 Perguntas)',
        texto: `De acordo com a Lei Geral de Proteção de Dados (LGPD), eu preciso confirmar seus dados para realizar a mudança de endereço.\n\nPoderia enviar um ÁUDIO informando seu nome completo e os 4 últimos dígitos do seu CPF por gentileza? (TITULAR)\n\nTambém poderia me enviar uma foto do tipo SELFIE segurando algum documento com foto por gentileza? (TITULAR)\n\n----------------------------------------------------\n\nPoderia me passar algumas informações?\n\n*1. Já realizou a mudança para o novo local? Se não, poderia me informar quando irá realizar a mudança?*\nR:\n\n*2. Qual seria o modelo/tipo de telhado (Cerâmica, Eternit ou Zinco)?*\nR:\n\n*3. Há mais de um poste de energia atendendo dentro do imóvel?*\nR:\n\n*4. O nome e telefone do agendamento seria o mesmo com quem estamos falando? Ou gostaria de alterar?*\nR:\n\n*5. Poderia me mandar as informações do novo endereço? (Se não souber algum, não tem problema)*\n\n(Estado) (Cidade) (CEP) (Bairro) - (Rua, número)\n\n*6. Poderia me passar uma disponibilidade de horário para atender os técnicos (Período da MANHÃ, TARDE ou QUALQUER HORÁRIO)?*\nR:`
    },
    {
        id: 'mudanca-pergunta-rural-urbana',
        screens: ['/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço (Passo a Passo)',
        titulo: '🌍 Novo endereço é Rural ou Urbano?',
        texto: `Seu novo endereço seria área RURAL ou URBANA?`
    },
    {
        id: 'mudanca-pergunta-retirada-equip',
        screens: ['/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço (Passo a Passo)',
        titulo: '🔌 Cliente pode retirar e levar equipamentos?',
        texto: `Poderia me informar se poderia fazer a retirada dos equipamentos e levar para a nova residência?`
    },
    {
        id: 'mudanca-pergunta-ja-mudou',
        screens: ['/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço (Passo a Passo)',
        titulo: '🏠 1. Já realizou a mudança?',
        texto: `Perfeito! Poderia me informar se já realizou a mudança para o novo local?`
    },
    {
        id: 'mudanca-pergunta-telhado',
        screens: ['/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço (Passo a Passo)',
        titulo: '🧱 2. Qual o tipo de telhado?',
        texto: `Poderia me informar qual seria o modelo/tipo de telhado (Cerâmica, Eternit ou Zinco)?`
    },
    {
        id: 'mudanca-aviso-eternit-zinco',
        screens: ['/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço (Passo a Passo)',
        titulo: '⚠️ Aviso Telhado Eternit / Zinco',
        texto: `Como o telhado seria de Eternit/Zinco é necessário que o/a senhor/a seja responsável por providenciar a abertura e o fechamento do telhado no dia da visita técnica (Pedreiro/Telhadista ou próprio cliente), para que os técnicos realizem o atendimento com segurança. Tudo bem?`
    },
    {
        id: 'mudanca-pergunta-poste',
        screens: ['/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço (Passo a Passo)',
        titulo: '⚡ 3. Há mais de um poste no imóvel?',
        texto: `Poderia me informar se há mais de um poste de energia atendendo dentro do imóvel?`
    },
    {
        id: 'mudanca-pergunta-nome-tel',
        screens: ['/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço (Passo a Passo)',
        titulo: '📞 4. Confirmar Nome e Telefone',
        texto: `Certo, o nome e telefone do agendamento seria o mesmo com quem estamos falando? Ou gostaria de alterar?`
    },
    {
        id: 'mudanca-confirmar-antigo',
        screens: ['/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço (Passo a Passo)',
        titulo: '📍 Confirmar Endereço Antigo',
        texto: `Poderia me confirmar se o seguinte endereço seria o antigo?:\n\n(Estado) (Cidade) (CEP) (Bairro) - (Rua, número)`
    },
    {
        id: 'mudanca-pedir-novo-endereco',
        screens: ['/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço (Passo a Passo)',
        titulo: '🗺️ 5. Solicitar Novo Endereço',
        texto: `Poderia me mandar as informações do novo endereço? (Se não souber algum, não tem problema)\n\n(Estado) (Cidade) (CEP) (Bairro) - (Rua, número)`
    },
    {
        id: 'mudanca-pedir-disponibilidade',
        screens: ['/mudanca-endereco'],
        categoria: '📦 Mudança de Endereço (Passo a Passo)',
        titulo: '🕐 6. Solicitar Disponibilidade',
        texto: `Poderia me passar uma disponibilidade de horário para atender os técnicos (Período da *MANHÃ*, *TARDE* ou *QUALQUER HORÁRIO*)?`
    },

    // ==================== SERVIÇOS COM CUSTO ====================
    {
        id: 'servicos-valores-comodo',
        screens: ['/servicos'],
        categoria: '🧰 Valores e Prazos (Para Enviar ao Cliente)',
        titulo: '🚪 Valores: Mudança de Cômodo (R$ 100)',
        texto: `A mudança de cômodo terá um prazo de 48 horas úteis, caso não ocorra nenhum imprevisto.\n\nEste serviço possui os seguintes valores:\n\nMão de obra: R$ 100,00\nMetragem de cabo de rede (caso necessário): R$ 3,75\nConector RJ45 (cada): R$ 2,50\n\nSe precisar passar cabos em outros cômodos, será acrescentado um valor de R$ 50,00 por passagem adicional.\n\nA taxa de R$ 100,00 deverá ser paga antecipadamente para que possamos efetuar o agendamento, enquanto o valor referente à metragem de cabo utilizado será cobrado na próxima mensalidade.`
    },
    {
        id: 'servicos-valores-passagem',
        screens: ['/servicos'],
        categoria: '🧰 Valores e Prazos (Para Enviar ao Cliente)',
        titulo: '🔌 Valores: Passagem de Cabo (R$ 100)',
        texto: `A passagem de cabo de rede terá um prazo de 48 horas úteis, caso não ocorra nenhum imprevisto.\n\nEste serviço possui os seguintes valores:\n\nMão de obra (primeira passagem): R$ 100,00\nMetragem de cabo de rede: R$ 3,75\nConector RJ45 (cada): R$ 2,50\n\nSe precisar passar cabos em outros cômodos, será acrescentado um valor de R$ 50,00 por passagem adicional.\n\nA taxa de R$ 100,00 deverá ser paga antecipadamente para que possamos efetuar o agendamento, enquanto o valor referente à metragem de cabo utilizado será cobrado na próxima mensalidade.`
    },
    {
        id: 'servicos-verificacao-urbana',
        screens: ['/servicos', '/verificacao-rede', '/conexao-lenta'],
        categoria: '🧰 Valores e Prazos (Para Enviar ao Cliente)',
        titulo: '🏠 Valores: Verificação Rede Interna Urbana (R$ 50)',
        texto: `Verifiquei e é necessário realizar uma visita técnica com custo no local, pois o serviço seria uma Verificação de Rede Interna.\nO valor do serviço é de R$ 50,00. Sendo necessário realizar o pagamento antecipado.\nCaso haja necessidade de realizar algum serviço com cobrança no local, será informado pelo técnico e cobrado na próxima mensalidade.\n\nCustos adicionais caso deseje realizar no local:\nPassagem de cabo por Cômodo adicional: R$ 50,00\nMetragem de cabo de rede (caso necessário): R$ 3,75\nConector RJ45 (cada): R$ 2,50`
    },
    {
        id: 'servicos-verificacao-rural',
        screens: ['/servicos', '/verificacao-rede', '/conexao-lenta'],
        categoria: '🧰 Valores e Prazos (Para Enviar ao Cliente)',
        titulo: '🌾 Valores: Verificação Rural ou 3+ Roteadores (R$ 100)',
        texto: `Verifiquei e é necessário realizar uma visita técnica com custo no local, pois o serviço seria uma Verificação de Rede Interna.\nO valor do serviço é de R$ 100,00. Sendo necessário realizar o pagamento antecipado.\nCaso haja necessidade de realizar algum serviço com cobrança no local, será informado pelo técnico e cobrado na próxima mensalidade.\n\nCustos adicionais caso deseje realizar no local:\nPassagem de cabo por Cômodo adicional: R$ 50,00\nMetragem de cabo de rede (caso necessário): R$ 3,75\nConector RJ45 (cada): R$ 2,50`
    },
    {
        id: 'servicos-config-urbana',
        screens: ['/servicos', '/verificacao-rede'],
        categoria: '🧰 Valores e Prazos (Para Enviar ao Cliente)',
        titulo: '⚙️ Valores: Config. Roteador Urbana (R$ 50)',
        texto: `A configuração de roteador terá um prazo de 48 horas úteis, caso não ocorra nenhum imprevisto.\n\nValores:\nMão de obra: R$ 50,00 (deverá ser paga antecipadamente)\n\nCaso deseje realizar a passagem de cabo durante a visita, esses são os valores:\nMetragem de cabo de rede (caso necessário): R$ 3,75\nConector RJ45 (cada): R$ 2,50\nCômodo adicional: R$ 50,00\nO valor referente à metragem de cabo utilizado será cobrado na próxima mensalidade.`
    },
    {
        id: 'servicos-config-rural',
        screens: ['/servicos', '/verificacao-rede'],
        categoria: '🧰 Valores e Prazos (Para Enviar ao Cliente)',
        titulo: '🌾 Valores: Config. Roteador Rural (R$ 100)',
        texto: `A configuração de roteador terá um prazo de 48 horas úteis, caso não ocorra nenhum imprevisto.\n\nValores:\nMão de obra: R$ 100,00 (deverá ser paga antecipadamente)\n\nCaso deseje realizar a passagem de cabo durante a visita, esses são os valores:\nMetragem de cabo de rede (caso necessário): R$ 3,75\nConector RJ45 (cada): R$ 2,50\nCômodo adicional: R$ 50,00\nO valor referente à metragem de cabo utilizado será cobrado na próxima mensalidade.`
    },

    // ==================== SUPORTE DE SVA's ====================
    {
        id: 'sva-acesso-cednet-play',
        screens: ['/sva'],
        categoria: '🔑 Acessos e Explicações CedNet',
        titulo: '▶️ Acesso CedNet Play',
        texto: `*Acesso ao CedNet Play:*\nLogin: E-mail cadastral\nSenha: CPF do/a titular (Sem os pontos e traços)`
    },
    {
        id: 'sva-acesso-cednet-plus',
        screens: ['/sva', '/pagamento'],
        categoria: '🔑 Acessos e Explicações CedNet',
        titulo: '➕ Acesso CedNet Plus (App)',
        texto: `*Acesso ao CedNet Plus:*\nLogin: CPF do/a titular (Sem os pontos e traços, apenas números)\nSenha: CPF do/a titular (Sem os pontos e traços)`
    },
    {
        id: 'sva-explicacao-play-playmax',
        screens: ['/sva', '/duvidas'],
        categoria: '🔑 Acessos e Explicações CedNet',
        titulo: '📺 Explicação CedNet Play vs PlayMax',
        texto: `O aplicativo 'CedNet Play' é para todos os planos, é um recurso de canais abertos que pode ser utilizado no Celular (App ou navegador), pelo computador/notebook e/ou por TVs que são compatíveis com o App.\nTemos também o App CedNet PlayMax que é um plano que acompanha canais de TV como se fosse Sky, canais pagos (canais fechados).`
    },
    {
        id: 'sva-globoplay-celetihub',
        screens: ['/sva'],
        categoria: '🔴 GloboPlay e Premiere',
        titulo: '📧 Ativação via E-mail (CELETIHUB - 1h)',
        texto: `Você vai receber um e-mail da CELETIHUB no prazo máximo de 1 hora.\nFavor verificar sua caixa de entrada e caixa de SPAM nesse tempo (caso não receba o e-mail, nos informar).\nAo abrir o e-mail, vai ter um botão laranja escrito "ATIVAR", ao clicar nesse botão, irá abrir a página da Globo.\nSe você já tiver uma conta da Globo, só acessar com o usuário e senha para sincronizar o benefício.\nCaso ainda não tiver uma conta, só clicar em CRIAR CONTA, após esse procedimento, o benefício será sincronizado com a conta criada.\nAgora só entrar no site ou aplicativo da GloboPlay/Premiere e acessar com o usuário e senha da sua conta.`
    },
    {
        id: 'sva-globoplay-reativacao-aviso',
        screens: ['/sva'],
        categoria: '🔴 GloboPlay e Premiere',
        titulo: '🔄 Aviso de Reativação GloboPlay',
        texto: `Estou entrando em contato referente ao benefício do GloboPlay incluído em seu contrato. Devido a uma atualização na plataforma, é necessário realizar a ativação do serviço novamente. Estou à disposição para auxiliá-lo(a) nesse processo, a fim de que o acesso ao GloboPlay seja restabelecido e o senhor(a) possa utilizar o serviço normalmente.`
    },
    {
        id: 'sva-globoplay-passo-a-passo-sms',
        screens: ['/sva'],
        categoria: '🔴 GloboPlay e Premiere',
        titulo: '📲 Passo a Passo Ativação GloboPlay (SMS)',
        texto: `Estarei enviando o Passo a passo:\n\n- Passo 1: O assinante recebe, via SMS, o link para ativação do Globoplay.\n- Passo 2: Ao acessar o link, informa seu número de telefone, marca a opção “Não sou um robô” e escolhe como deseja receber o código de validação: por WhatsApp ou SMS.\n- Passo 3: Em seguida, insere o código recebido e clica em “Próximo”.\n- Passo 4: Após a validação, será exibida uma mensagem de boas-vindas. Basta clicar no botão “Iniciar ativação” para ser redirecionado à etapa de criação da conta.\n- Passo 5: A partir desse momento, o cliente seguirá com o processo de criação da conta diretamente no ambiente do Globoplay.\n\nhttps://globoplay.globo.com/`
    },
    {
        id: 'sva-passo-a-passo-exitlag',
        screens: ['/sva', '/duvidas'],
        categoria: '🎮 Outros Tutoriais (ExitLag / Chromecast)',
        titulo: '🎮 Passo a Passo ExitLag',
        texto: `Passo a passo ExitLag:\n\n1º Chegará um e-mail da própria EXIT LAG no e-mail do cadastro onde terá um botão para "criar sua senha".\n2º Ao clicar, encaminhará para o próprio site da mesma onde você criará sua senha de acesso.\n3º Assim que criar, já será direcionado para sua aba de cadastro e, verificando na parte superior do site terá um botão escrito DOWNLOAD para baixar o mesmo em seu desktop.\n4º Assim que baixar o .exe, execute a instalação e efetue o login com o e-mail do cadastro e a senha criada.\n5º Pronto, só utilizar!`
    },
    {
        id: 'sva-passo-a-passo-chromecast',
        screens: ['/sva', '/duvidas'],
        categoria: '🎮 Outros Tutoriais (ExitLag / Chromecast)',
        titulo: '📺 Configurar Chromecast na TV (Google Home)',
        texto: `CONFIGURAÇÕES CHROMECAST NA TV:\n\n1º Na TV, selecione a entrada onde conectou o Chromecast (Ex: HDMI).\n2º Em seu celular, baixe o app "Google Home".\n3º Acesse o Google Home em seu celular e crie uma "Casa":\n- Nome para a casa\n- Endereço (pode pular)\n- Ativar localização e Bluetooth e procure sua TV (ficará com o nome do Chromecast)\n- Selecione o código correto em seu celular (código aparecerá na TV)\n- Selecione um nome para o dispositivo (Ex: Quarto, Sala, Cozinha)\n4º Após, irão aparecer as redes Wi-Fi: selecione a sua, coloque a senha e conecte.\n5º Pode ir pulando as opções até o fim.\n6º Pronto, só espelhar seus aplicativos!`
    },
    {
        id: 'sva-coleta-os',
        screens: ['/sva'],
        categoria: '📅 Coleta SVA',
        titulo: '📋 Solicitar Dados para O.S. de SVA',
        texto: `O senhor/a poderia me informar estes dados para eu abrir a ordem de serviço:\n\nNome:\nTelefone:\nDisponibilidade de horário para atender os técnicos *(período da manhã, período da tarde ou qualquer horário)*?:`
    },

    // ==================== PAGAMENTO / FINANCEIRO ====================
    {
        id: 'pag-confirmado-liberacao',
        screens: ['/pagamento'],
        categoria: '💲 Mensagens Financeiras',
        titulo: '✅ Pagamento Consta / Liberação Automática',
        texto: `Perfeito! Pagamento já consta em nosso sistema, caso esteja com conexão lenta ou tenha sido reduzida, a conexão é liberada automaticamente!\n\nPosso ajudar em algo mais?`
    },
    {
        id: 'pag-explicacao-carne-lgpd',
        screens: ['/pagamento', '/duvidas'],
        categoria: '💲 Mensagens Financeiras',
        titulo: '📄 Explicação Carnê / Fatura (LGPD)',
        texto: `Informamos que, por questões de segurança e em conformidade com a Lei Geral de Proteção de Dados (LGPD), não é mais permitido o envio de carnês de pagamento por canais de atendimento.\n\nCaso necessite da sua fatura, ela será encaminhada diretamente para o e-mail cadastrado em nosso sistema. Se não tiver acesso ao e-mail ou precisar de auxílio, você pode solicitar a fatura por meio de nossos canais de atendimento via WhatsApp ou ligação, após a devida confirmação dos dados do titular.\n\nAlém disso, o pagamento pode ser realizado de forma rápida e prática pelo site da CedNet ou pelo aplicativo CedNet Plus, onde também é possível consultar faturas, emitir segunda via e acompanhar outras informações da sua conexão.`
    },
    {
        id: 'pag-menu-opcoes',
        screens: ['/pagamento'],
        categoria: '💲 Mensagens Financeiras',
        titulo: '🔢 Opções (1. Comprovante / 2. Encerrar / 3. Outro)',
        texto: `Deseja agora:\n1. Enviar comprovante\n2. Encerrar atendimento\n3. Outro`
    },
    {
        id: 'pag-financeiro-fora-expediente',
        screens: ['/pagamento', '/duvidas'],
        categoria: '💲 Mensagens Financeiras',
        titulo: '🕒 Financeiro Fora do Expediente',
        texto: `Boa tarde!\nVerifiquei que o/a senhor/a gostaria de analisar questões financeiras.\nNo momento, o nosso setor FINANCEIRO não está trabalhando.\n\nO/A senhor/a poderia me informar os dados abaixo para que eles possam retornar o contato com o senhor assim que possível.\n\nNome:\nContato:\nDisponibilidade para retorno:`
    },

    // ==================== DÚVIDAS / COMERCIAL / CANCELAMENTO ====================
    {
        id: 'duv-comercial-fora-expediente',
        screens: ['/duvidas'],
        categoria: '🏢 Comercial e Cancelamento',
        titulo: '💼 Comercial Fora do Expediente (Completo)',
        texto: `Boa tarde!\nVerifiquei que o/a senhor/a gostaria de contratar um plano para sua empresa/casa.\nNo momento, o nosso setor comercial não está trabalhando.\n\nO/A senhor/a poderia me informar os dados abaixo para que eles possam retornar o contato com o senhor assim que possível.\n\nNome:\nContato:\nCPF:\nCidade/Endereço:\nE-mail:\nDisponibilidade para retorno:`
    },
    {
        id: 'duv-comercial-lead-rural',
        screens: ['/duvidas', '/mudanca-endereco'],
        categoria: '🏢 Comercial e Cancelamento',
        titulo: '🌾 Comercial Fora do Expediente (Com Rural)',
        texto: `Olá tudo bem? Infelizmente nosso comercial não está trabalhando no momento mas pode ficar tranquilo que irei informar eles para retornarem no dia seguinte! Poderia me informar:\n\nNome:\nTelefone:\nDisponibilidade de atendimento:\nEndereço:\n\nCaso seja Rural me encaminhar a localização:`
    },
    {
        id: 'duv-transferencia-comercial',
        screens: ['/duvidas', '/mudanca-endereco'],
        categoria: '🏢 Comercial e Cancelamento',
        titulo: '➡️ Transferindo para o Comercial',
        texto: `Maravilha, só um momentinho que irei te transferir para nossa representante do comercial apresentar os planos, benefícios e tirar todas as dúvidas que tiver ok!`
    },
    {
        id: 'duv-cancelamento-opcoes',
        screens: ['/duvidas'],
        categoria: '🏢 Comercial e Cancelamento',
        titulo: '🛑 Opções antes de Cancelar',
        texto: `Certo, neste caso podemos prosseguir das seguintes formas:\n\nTROCA DE TITULARIDADE\nMUDANÇA DE ENDEREÇO\nCANCELAMENTO\n\nPor gentileza, poderia me informar qual deseja:`
    },
    {
        id: 'duv-cancelamento-fora-expediente',
        screens: ['/duvidas'],
        categoria: '🏢 Comercial e Cancelamento',
        titulo: '🕒 Cancelamento Fora do Expediente',
        texto: `Certo, o setor de CANCELAMENTO não estaria em expediente no momento, sendo assim abrirei um protocolo pedindo o retorno para você!\nPor gentileza me informe:\n\nNome:\nTelefone:\nDisponibilidade de atendimento (das 08:00 às 17:00):\n\nEncaminhe também uma selfie segurando um documento com foto para confirmar a titularidade:`
    },

    // ==================== NÍVEL 2 / TROCA DE TITULARIDADE / SSH ====================
    {
        id: 'n2-ssh-ultron',
        screens: ['/nivel2', '/troca-titularidade', '/sem-conexao', '/conexao-lenta'],
        categoria: '💻 Comandos SSH / MobaXterm',
        titulo: '💻 Ultron: Display access-user',
        texto: `Display access-user username  verbose`
    },
    {
        id: 'n2-ssh-onu-status',
        screens: ['/nivel2', '/troca-titularidade', '/sem-conexao', '/conexao-lenta'],
        categoria: '💻 Comandos SSH / MobaXterm',
        titulo: '💻 OLT: show interface gpon onu',
        texto: `show interface gpon 1/1/ onu `
    },
    {
        id: 'n2-ssh-onu-ethernet',
        screens: ['/nivel2', '/troca-titularidade', '/sem-conexao', '/conexao-lenta'],
        categoria: '💻 Comandos SSH / MobaXterm',
        titulo: '💻 OLT (Bridge): show onu ethernet',
        texto: `show interface gpon 1/1/ onu  ethernet`
    },
    {
        id: 'n2-ssh-log-tail',
        screens: ['/nivel2', '/troca-titularidade', '/sem-conexao', '/conexao-lenta'],
        categoria: '💻 Comandos SSH / MobaXterm',
        titulo: '💻 OLT: Filtrar Logs da ONU',
        texto: `show log tail 20000 | include 1/1//`
    },
    {
        id: 'n2-ssh-pon-down',
        screens: ['/nivel2', '/troca-titularidade', '/sem-conexao'],
        categoria: '💻 Comandos SSH / MobaXterm',
        titulo: '💻 OLT: Filtrar ONUs DOWN na PON',
        texto: `show interface gpon 1/1/ onu | include DOWN`
    },
    {
        id: 'n2-ssh-caixa-cto',
        screens: ['/nivel2', '/troca-titularidade', '/sem-conexao'],
        categoria: '💻 Comandos SSH / MobaXterm',
        titulo: '💻 OLT: Filtrar Caixa de Atendimento',
        texto: `show interface gpon 1/1/ onu | include CX_`
    },
    {
        id: 'n2-ssh-alarme-moba',
        screens: ['/nivel2', '/troca-titularidade', '/sem-conexao'],
        categoria: '💻 Comandos SSH / MobaXterm',
        titulo: '💻 OLT: show alarm (Moba)',
        texto: `show alarm | include 1/1//`
    },
    {
        id: 'n2-guia-faturar-boleto',
        screens: ['/nivel2', '/troca-titularidade', '/pagamento', '/servicos'],
        categoria: '📖 Guias Rápidos IXC / N2',
        titulo: '🧾 Passo a Passo Faturar Boleto (IXC)',
        texto: `GERAR BOLETO NO IXC:\n1. Saídas -> 2. Pedidos -> 3. Pedidos de Venda\n4. Achar o cliente -> 5. Concluir pedido\n6. Verificar se está como "301 - Pedido de Venda - Serviços"\n7. Colocar OBS (Protocolo + Serviço a ser realizado)\n8. Finalizar saída -> Lupa\n9. Carteira de cobrança:\n   - Carteira 23 – Sicredi PF (exclusivo CPF)\n   - Carteira 25 – Sicredi 2006 (exclusivo CNPJ)\n10. Salvar e gerar financeiro -> Editar data de vencimento -> Salvar\n11. Validar e finalizar -> Conferir se o boleto apareceu no financeiro do cliente.`
    },
    {
        id: 'n2-codigos-encerramento',
        screens: ['/nivel2', '/troca-titularidade', '/', '/atendimento'],
        categoria: '📖 Guias Rápidos IXC / N2',
        titulo: '📌 Códigos de Diagnóstico de Encerramento',
        texto: `DIAGNÓSTICOS DE ENCERRAMENTO:\n• 233 – Encerrado por Inatividade (cliente não interagiu no SLA)\n• 22 – Resolvido Interno (solucionado sem encaminhamento)\n• 23 – Direcionado Externo (agendamento de visita técnica)\n• 30 – Cliente Desistiu do Serviço (passagem de cabo, mudança, etc.)\n• 123 – Direcionado para NOC\n• 125 – Direcionado para Infra`
    }
];

let modoFiltroTemplates = 'tela'; // 'tela' ou 'todos'
let buscaTemplatesTexto = '';

function obterScreenAtual() {
    const p = window.location.pathname.replace(/\/+$/, '') || '/';
    return p;
}

function setModoFiltroTemplates(modo) {
    modoFiltroTemplates = modo;
    renderizarTemplatesSidebar();
}

function filtrarBuscaTemplates(valor) {
    buscaTemplatesTexto = (valor || '').toLowerCase().trim();
    renderizarTemplatesSidebar();
}

function copiarTemplatePorId(id, botao) {
    const item = TEMPLATES_CATALOGO.find(t => t.id === id);
    if (!item) return;
    copiarTextoTemplate(item.texto, botao);
}

function toggleGuiaRef(id, botao) {
    const el = document.getElementById(id);
    if (!el) return;
    const aberto = el.style.display !== 'none';
    el.style.display = aberto ? 'none' : 'block';
    if (botao) {
        botao.classList.toggle('active', !aberto);
    }
}

function inserirTextoDescricao(texto, textareaId = 'descricao') {
    const ta = document.getElementById(textareaId);
    if (!ta) return;
    const atual = ta.value.trim();
    ta.value = atual ? `${atual}\n${texto}` : texto;
    ta.focus();
    mostrarAlerta('Inserido na Descrição da OS!', 'sucesso');
}

function inserirLocalidadeOS(localidade, limite) {
    const msg = `Localidade (${localidade}) possui limite técnico de velocidade de até ${limite}. Cliente ciente.`;
    const cardRadio = document.getElementById('card-radio');
    const cardFibra = document.getElementById('card-fibra');
    if (cardRadio && cardRadio.style.display !== 'none') {
        inserirTextoDescricao(msg, 'descricao-radio');
    } else if (cardFibra && cardFibra.style.display !== 'none') {
        inserirTextoDescricao(msg, 'descricao');
    } else {
        navigator.clipboard.writeText(msg)
            .then(() => mostrarAlerta(`Copiado: ${localidade} (máx. ${limite})`, 'sucesso'))
            .catch(() => mostrarAlerta('Erro ao copiar!'));
    }
}

function renderizarTemplatesSidebar() {
    const container = document.getElementById('templates-module');
    if (!container) return;

    const screenAtual = obterScreenAtual();
    const nomesTelas = {
        '/': 'Menu Inicial',
        '/atendimento': 'Coleta de Dados',
        '/sem-conexao': 'Sem Conexão',
        '/conexao-lenta': 'Conexão Lenta',
        '/mudanca-endereco': 'Mudança de Endereço',
        '/servicos': 'Serviços',
        '/verificacao-rede': 'Verificação / Config',
        '/sva': 'Suporte SVA',
        '/pagamento': 'Financeiro',
        '/duvidas': 'Dúvidas',
        '/nivel2': 'Nível 2',
        '/troca-titularidade': 'Troca de Titularidade'
    };
    const nomeTela = nomesTelas[screenAtual] || 'Tela Atual';

    const listaFiltrada = TEMPLATES_CATALOGO.filter(item => {
        const bateTela = modoFiltroTemplates === 'todos' || item.screens.includes(screenAtual);
        if (!bateTela) return false;
        if (!buscaTemplatesTexto) return true;
        return (
            item.titulo.toLowerCase().includes(buscaTemplatesTexto) ||
            item.categoria.toLowerCase().includes(buscaTemplatesTexto) ||
            item.texto.toLowerCase().includes(buscaTemplatesTexto)
        );
    });

    // Agrupar por categoria
    const grupos = {};
    listaFiltrada.forEach(item => {
        if (!grupos[item.categoria]) grupos[item.categoria] = [];
        grupos[item.categoria].push(item);
    });

    const gruposHtml = Object.keys(grupos).length === 0
        ? `<div class="history-empty">🔍 Nenhum template encontrado</div>`
        : Object.entries(grupos).map(([cat, itens]) => `
            <div class="template-group">
                <div class="template-group-title">${cat}</div>
                ${itens.map(item => `
                    <button class="template-btn" title="${item.texto.replace(/"/g, '&quot;')}" onclick="copiarTemplatePorId('${item.id}', this)">
                        ${item.titulo}
                    </button>
                `).join('')}
            </div>
        `).join('');

    // Preserva o foco se o usuário estiver digitando na busca
    const buscaExistente = document.getElementById('template-search-input');
    const tinhaFoco = document.activeElement === buscaExistente;
    const posCursor = buscaExistente ? buscaExistente.selectionStart : 0;

    container.innerHTML = `
        <div class="templates-toolbar">
            <button type="button" class="btn-expand-modal-sidebar" onclick="abrirModalGuia('tela')">
                ⛶ Abrir Painel Amplo de Templates & Guias
            </button>
            <div class="templates-filter-tabs">
                <button type="button" class="tpl-filter-btn ${modoFiltroTemplates === 'tela' ? 'active' : ''}" onclick="setModoFiltroTemplates('tela')">
                    📍 ${nomeTela}
                </button>
                <button type="button" class="tpl-filter-btn ${modoFiltroTemplates === 'todos' ? 'active' : ''}" onclick="setModoFiltroTemplates('todos')">
                    📚 Todos (${TEMPLATES_CATALOGO.length})
                </button>
            </div>
            <input
                type="search"
                id="template-search-input"
                class="template-search-input"
                placeholder="🔍 Buscar template..."
                value="${buscaTemplatesTexto.replace(/"/g, '&quot;')}"
                oninput="filtrarBuscaTemplates(this.value)"
            >
        </div>
        <div class="templates-list">
            ${gruposHtml}
        </div>
    `;

    if (tinhaFoco) {
        const novoInput = document.getElementById('template-search-input');
        if (novoInput) {
            novoInput.focus();
            novoInput.setSelectionRange(posCursor, posCursor);
        }
    }
}

// ── Dados Estruturados: Alarmes OLT & Localidades com Limite ─────────────────
const ALARMES_OLT_DATA = [
    {
        codigo: 'LOSi',
        nome: 'Loss of Signal',
        nivel: 'danger',
        significado: 'A fibra que conecta essa ONU foi rompida, a ONU possui falha de hardware (mas continua alimentada) ou está com defeito.',
        osTexto: 'Alarme OLT: LOSi (Loss of Signal) — possível rompimento na fibra ou falha na ONU.'
    },
    {
        codigo: 'DGi',
        nome: 'ONUi-Dying Gasp',
        nivel: 'warn',
        significado: 'Falha na alimentação elétrica da ONU (a ONU foi desligada da energia).',
        osTexto: 'Alarme OLT: DGi (Dying Gasp) — falha na alimentação elétrica da ONU (desligada da energia).'
    },
    {
        codigo: 'SUFi',
        nome: 'ONUi-Startup Failure',
        nivel: 'warn',
        significado: 'Atenuação da fibra fora do padrão, possivelmente suja ou com conectores danificados.',
        osTexto: 'Alarme OLT: SUFi (Startup Failure) — atenuação da fibra fora do padrão / conector sujo ou danificado.'
    },
    {
        codigo: 'LOFi',
        nome: 'Loss of Frame',
        nivel: 'danger',
        significado: 'A fibra que conecta essa ONU foi rompida, a ONU possui falha de hardware (mas continua alimentada) ou está com defeito.',
        osTexto: 'Alarme OLT: LOFi (Loss of Frame) — possível rompimento na fibra ou defeito na ONU.'
    },
    {
        codigo: 'LCDG',
        nome: 'Loss of GEM Channel Delineation',
        nivel: 'warn',
        significado: 'Conexão de fibra imprópria, conector danificado, fibra suja/danificada, muita atenuação até a ONU ou ONU com defeito.',
        osTexto: 'Alarme OLT: LCDG — possível conector/fibra danificada, alta atenuação ou ONU com defeito.'
    },
    {
        codigo: 'LOAMi',
        nome: 'Loss of PLOAM for ONU',
        nivel: 'warn',
        significado: 'Possível defeito na fibra ou equipamento.',
        osTexto: 'Alarme OLT: LOAMi (Loss of PLOAM) — possível defeito na fibra ou equipamento.'
    },
    {
        codigo: 'SF',
        nome: 'Signal Fail (SDi)',
        nivel: 'danger',
        significado: 'A ONU está com defeito.',
        osTexto: 'Alarme OLT: SF (Signal Fail) — ONU apresentando defeito.'
    },
    {
        codigo: 'SD',
        nome: 'Signal Degraded',
        nivel: 'danger',
        significado: 'A ONU está com defeito (degradação de sinal).',
        osTexto: 'Alarme OLT: SD (Signal Degraded) — ONU apresentando degradação/defeito.'
    },
    {
        codigo: 'DOWi',
        nome: 'ONUi-Drift Of Window',
        nivel: 'danger',
        significado: 'A ONU está com defeito.',
        osTexto: 'Alarme OLT: DOWi (Drift Of Window) — ONU apresentando defeito.'
    }
];

const LOCALIDADES_LIMITE_DATA = [
    { localidade: 'Córrego Fundo',      cidade: 'Ourinhos',                limite: '90 Mbps', nivel: 'info' },
    { localidade: 'Praia Morena',       cidade: 'Arandu',                  limite: '90 Mbps', nivel: 'info' },
    { localidade: 'Pontal',             cidade: 'Cerqueira César',         limite: '90 Mbps', nivel: 'info' },
    { localidade: 'Nova Piraju',        cidade: 'Tejupá',                  limite: '90 Mbps', nivel: 'info' },
    { localidade: 'Banco da Terra',     cidade: 'Sarutaiá',                limite: '60 Mbps', nivel: 'warn' },
    { localidade: 'Cágado',             cidade: 'Piraju',                  limite: '60 Mbps', nivel: 'warn' },
    { localidade: 'Fazenda Bela Vista', cidade: 'Ipaussu',                 limite: '60 Mbps', nivel: 'warn' },
    { localidade: 'Fazenda Cocaes',     cidade: 'Santa Cruz do Rio Pardo', limite: '60 Mbps', nivel: 'warn' },
    { localidade: 'Fazenda Estado',     cidade: 'Manduri',                 limite: '60 Mbps', nivel: 'warn' }
];

// ── Modal Amplo de Templates & Guias Rápidos ─────────────────────────────────
let abaModalGuiaAtiva = 'tela'; // 'tela' | 'olt' | 'localidades' | 'todos'
let categoriaModalAtiva = 'todas';
let buscaModalGuiaTexto = '';

function garantirModalGuiaDOM() {
    let overlay = document.getElementById('guia-modal-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'guia-modal-overlay';
    overlay.className = 'guia-modal-overlay';
    overlay.style.display = 'none';
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharModalGuia();
    });

    overlay.innerHTML = `
        <div class="guia-modal-card" role="dialog" aria-modal="true" aria-labelledby="guia-modal-title">
            <div class="guia-modal-header">
                <div class="guia-modal-title-wrap">
                    <h2 id="guia-modal-title" class="guia-modal-title">💬 Central de Templates & Guias Rápidos</h2>
                    <span class="guia-modal-subtitle">Visualize os textos completos, copie com 1 clique ou insira direto na O.S.</span>
                </div>
                <div class="guia-modal-header-right">
                    <input
                        type="search"
                        id="guia-modal-search"
                        class="guia-modal-search"
                        placeholder="🔍 Buscar por título, alarme, localidade ou texto..."
                        oninput="filtrarBuscaModalGuia(this.value)"
                    >
                    <button type="button" class="guia-modal-close" onclick="fecharModalGuia()" title="Fechar (Esc)">✕</button>
                </div>
            </div>
            <div class="guia-modal-tabs" id="guia-modal-tabs"></div>
            <div class="guia-modal-subcats" id="guia-modal-subcats" style="display:none"></div>
            <div class="guia-modal-body" id="guia-modal-body"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.style.display !== 'none') {
            fecharModalGuia();
        }
    });

    return overlay;
}

function abrirModalGuia(aba = 'tela') {
    const overlay = garantirModalGuiaDOM();
    abaModalGuiaAtiva = aba || 'tela';
    categoriaModalAtiva = 'todas';
    buscaModalGuiaTexto = '';
    const searchInput = document.getElementById('guia-modal-search');
    if (searchInput) searchInput.value = '';
    overlay.style.display = 'flex';
    renderizarConteudoModalGuia();
}

function fecharModalGuia() {
    const overlay = document.getElementById('guia-modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

function setAbaModalGuia(aba) {
    abaModalGuiaAtiva = aba;
    categoriaModalAtiva = 'todas';
    renderizarConteudoModalGuia();
}

function setCategoriaModalGuia(cat) {
    categoriaModalAtiva = cat;
    renderizarConteudoModalGuia();
}

function filtrarBuscaModalGuia(valor) {
    buscaModalGuiaTexto = (valor || '').toLowerCase().trim();
    renderizarConteudoModalGuia();
}

function escapeHtmlGuia(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function inserirAlarmeOSModal(idx) {
    const item = ALARMES_OLT_DATA[idx];
    if (!item) return;
    const ta = document.getElementById('descricao');
    if (ta) {
        inserirTextoDescricao(item.osTexto, 'descricao');
        fecharModalGuia();
    } else {
        navigator.clipboard.writeText(item.osTexto)
            .then(() => mostrarAlerta(`Copiado: ${item.codigo}`, 'sucesso'))
            .catch(() => mostrarAlerta('Erro ao copiar!'));
    }
}

function copiarAlarmeModal(idx, botao) {
    const item = ALARMES_OLT_DATA[idx];
    if (!item) return;
    copiarTextoTemplate(`${item.codigo} (${item.nome}): ${item.significado}`, botao);
}

function inserirLocalidadeOSModal(idx) {
    const item = LOCALIDADES_LIMITE_DATA[idx];
    if (!item) return;
    inserirLocalidadeOS(`${item.localidade} — ${item.cidade}`, item.limite);
    fecharModalGuia();
}

function copiarLocalidadeModal(idx, botao) {
    const item = LOCALIDADES_LIMITE_DATA[idx];
    if (!item) return;
    const msg = `Localidade (${item.localidade} — ${item.cidade}) possui limite técnico de velocidade de até ${item.limite}. Cliente ciente.`;
    copiarTextoTemplate(msg, botao);
}

function renderizarConteudoModalGuia() {
    const tabsEl = document.getElementById('guia-modal-tabs');
    const subcatsEl = document.getElementById('guia-modal-subcats');
    const bodyEl = document.getElementById('guia-modal-body');
    if (!tabsEl || !bodyEl || !subcatsEl) return;

    const screenAtual = obterScreenAtual();
    const nomesTelas = {
        '/': 'Menu Inicial',
        '/atendimento': 'Coleta de Dados',
        '/sem-conexao': 'Sem Conexão',
        '/conexao-lenta': 'Conexão Lenta',
        '/mudanca-endereco': 'Mudança de Endereço',
        '/servicos': 'Serviços',
        '/verificacao-rede': 'Verificação / Config',
        '/sva': 'Suporte SVA',
        '/pagamento': 'Financeiro',
        '/duvidas': 'Dúvidas',
        '/nivel2': 'Nível 2',
        '/troca-titularidade': 'Troca de Titularidade'
    };
    const nomeTela = nomesTelas[screenAtual] || 'Tela Atual';
    const qtdTela = TEMPLATES_CATALOGO.filter(t => t.screens.includes(screenAtual)).length;

    tabsEl.innerHTML = `
        <button type="button" class="guia-tab-btn ${abaModalGuiaAtiva === 'tela' ? 'active' : ''}" onclick="setAbaModalGuia('tela')">
            📍 Templates: ${nomeTela} <span class="guia-tab-count">${qtdTela}</span>
        </button>
        <button type="button" class="guia-tab-btn ${abaModalGuiaAtiva === 'olt' ? 'active' : ''}" onclick="setAbaModalGuia('olt')">
            🚨 Alarmes OLT <span class="guia-tab-count">${ALARMES_OLT_DATA.length}</span>
        </button>
        <button type="button" class="guia-tab-btn ${abaModalGuiaAtiva === 'localidades' ? 'active' : ''}" onclick="setAbaModalGuia('localidades')">
            📍 Localidades c/ Limite <span class="guia-tab-count">${LOCALIDADES_LIMITE_DATA.length}</span>
        </button>
        <button type="button" class="guia-tab-btn ${abaModalGuiaAtiva === 'todos' ? 'active' : ''}" onclick="setAbaModalGuia('todos')">
            📚 Todos os Templates <span class="guia-tab-count">${TEMPLATES_CATALOGO.length}</span>
        </button>
    `;

    // Aba 1: Alarmes OLT
    if (abaModalGuiaAtiva === 'olt') {
        subcatsEl.style.display = 'none';
        const filtrados = ALARMES_OLT_DATA.map((item, idx) => ({ ...item, idx })).filter(item => {
            if (!buscaModalGuiaTexto) return true;
            return (
                item.codigo.toLowerCase().includes(buscaModalGuiaTexto) ||
                item.nome.toLowerCase().includes(buscaModalGuiaTexto) ||
                item.significado.toLowerCase().includes(buscaModalGuiaTexto)
            );
        });

        bodyEl.innerHTML = `
            <div class="guia-modal-banner">
                <strong>💡 Guia de Diagnóstico OLT (DmView / Thermix):</strong> Consulte o significado de cada alarme abaixo. Clique em <strong>+ Inserir na OS</strong> para adicionar automaticamente ao campo de descrição ou em <strong>📋 Copiar</strong>.
            </div>
            <div class="guia-cards-grid">
                ${filtrados.map(item => `
                    <div class="guia-card-item">
                        <div class="guia-card-top">
                            <div class="guia-card-title-group">
                                <span class="guia-badge badge-${item.nivel}">${escapeHtmlGuia(item.codigo)}</span>
                                <span class="guia-card-title">${escapeHtmlGuia(item.nome)}</span>
                            </div>
                            <div class="guia-card-actions">
                                <button type="button" class="btn-guia-copy" onclick="copiarAlarmeModal(${item.idx}, this)">📋 Copiar</button>
                                <button type="button" class="btn-guia-os" onclick="inserirAlarmeOSModal(${item.idx})">+ Inserir na OS</button>
                            </div>
                        </div>
                        <div class="guia-card-preview">${escapeHtmlGuia(item.significado)}</div>
                    </div>
                `).join('')}
            </div>
        `;
        return;
    }

    // Aba 2: Localidades com Limite de Velocidade
    if (abaModalGuiaAtiva === 'localidades') {
        subcatsEl.style.display = 'none';
        const filtrados = LOCALIDADES_LIMITE_DATA.map((item, idx) => ({ ...item, idx })).filter(item => {
            if (!buscaModalGuiaTexto) return true;
            return (
                item.localidade.toLowerCase().includes(buscaModalGuiaTexto) ||
                item.cidade.toLowerCase().includes(buscaModalGuiaTexto) ||
                item.limite.toLowerCase().includes(buscaModalGuiaTexto)
            );
        });

        bodyEl.innerHTML = `
            <div class="guia-modal-banner">
                <strong>⚠️ Regra de Capacidade por Localidade:</strong> Vale principalmente para clientes que possuem plano acima da capacidade da localidade e entram em contato relatando <strong>conexão lenta</strong>.
            </div>
            <div class="guia-cards-grid">
                ${filtrados.map(item => `
                    <div class="guia-card-item">
                        <div class="guia-card-top">
                            <div class="guia-card-title-group">
                                <span class="guia-badge badge-${item.nivel}">Máx: ${escapeHtmlGuia(item.limite)}</span>
                                <div>
                                    <div class="guia-card-title">${escapeHtmlGuia(item.localidade)}</div>
                                    <div class="guia-card-sub">📍 Município: ${escapeHtmlGuia(item.cidade)}</div>
                                </div>
                            </div>
                            <div class="guia-card-actions">
                                <button type="button" class="btn-guia-copy" onclick="copiarLocalidadeModal(${item.idx}, this)">📋 Copiar</button>
                                <button type="button" class="btn-guia-os" onclick="inserirLocalidadeOSModal(${item.idx})">+ Inserir na OS</button>
                            </div>
                        </div>
                        <div class="guia-card-preview">Localidade (${escapeHtmlGuia(item.localidade)} — ${escapeHtmlGuia(item.cidade)}) possui limite técnico de velocidade de até ${escapeHtmlGuia(item.limite)}.</div>
                    </div>
                `).join('')}
            </div>
        `;
        return;
    }

    // Aba 3 e 4: Templates (da Tela Atual ou Todos)
    const baseTemplates = TEMPLATES_CATALOGO.filter(item =>
        abaModalGuiaAtiva === 'todos' || item.screens.includes(screenAtual)
    );

    const categoriasDisponiveis = [...new Set(baseTemplates.map(t => t.categoria))];
    if (categoriasDisponiveis.length > 1) {
        subcatsEl.style.display = 'flex';
        subcatsEl.innerHTML = `
            <button type="button" class="guia-subcat-pill ${categoriaModalAtiva === 'todas' ? 'active' : ''}" onclick="setCategoriaModalGuia('todas')">
                Todas (${baseTemplates.length})
            </button>
            ${categoriasDisponiveis.map(cat => {
                const count = baseTemplates.filter(t => t.categoria === cat).length;
                return `
                    <button type="button" class="guia-subcat-pill ${categoriaModalAtiva === cat ? 'active' : ''}" onclick="setCategoriaModalGuia('${cat.replace(/'/g, "\\'")}')">
                        ${escapeHtmlGuia(cat)} (${count})
                    </button>
                `;
            }).join('')}
        `;
    } else {
        subcatsEl.style.display = 'none';
    }

    const templatesFiltrados = baseTemplates.filter(item => {
        if (categoriaModalAtiva !== 'todas' && item.categoria !== categoriaModalAtiva) return false;
        if (!buscaModalGuiaTexto) return true;
        return (
            item.titulo.toLowerCase().includes(buscaModalGuiaTexto) ||
            item.categoria.toLowerCase().includes(buscaModalGuiaTexto) ||
            item.texto.toLowerCase().includes(buscaModalGuiaTexto)
        );
    });

    if (templatesFiltrados.length === 0) {
        bodyEl.innerHTML = `<div class="history-empty" style="padding:48px 0;font-size:0.95rem;">🔍 Nenhum template encontrado para essa busca.</div>`;
        return;
    }

    bodyEl.innerHTML = `
        <div class="guia-cards-grid">
            ${templatesFiltrados.map(item => `
                <div class="guia-card-item">
                    <div class="guia-card-top">
                        <div>
                            <span class="guia-card-cat">${escapeHtmlGuia(item.categoria)}</span>
                            <div class="guia-card-title">${escapeHtmlGuia(item.titulo)}</div>
                        </div>
                        <div class="guia-card-actions">
                            <button type="button" class="btn-guia-copy" onclick="copiarTemplatePorId('${item.id}', this)">📋 Copiar</button>
                        </div>
                    </div>
                    <pre class="guia-card-preview">${escapeHtmlGuia(item.texto)}</pre>
                </div>
            `).join('')}
        </div>
    `;
}


