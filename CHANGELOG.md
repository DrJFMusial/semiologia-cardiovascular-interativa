# Histórico de manutenção

## 1.1.1 — proposta para revisão, 23/10/2026

- Corrige ativação de simuladores altos em viewports baixos e conecta a troca de slides ao ciclo de vida dos componentes.
- Pausa animações e fontes sonoras ao ocultar/sair da página; impede disputa de reprodução entre componentes no estudo e desconecta nós Web Audio terminados.
- Compacta a barra na horizontal, reserva sua altura real, considera áreas seguras e permite reorganização no zoom.
- Corrige cortes de conteúdo em 320/390/1024 pixels; restringe as grades responsivas ao estudo para preservar a apresentação escalada.
- Protege controles de teclado contra navegação acidental; restaura foco no menu e nas opções de sopro recriadas.
- Oferece respostas por localização anatômica no exercício de focos e encerra a rodada ao mostrar o resultado.
- Reinicia a demonstração de edema ao trocar de grau; atualiza valvas imediatamente ao buscar um instante pausado e mantém a velocidade anunciada consistente com redução de movimento.
- Corrige destinos iniciais de estudo após carregamento de imagens/fontes e preserva a seção ao mudar de modo.
- Evita redesenhar o manômetro parado em cada quadro; incorpora favicon no HTML offline.
- Acrescenta testes de ciclo de vida/áudio, verificação estrutural dos builds e CI de pull request sem publicação.

## 1.1.0 — referência publicada

Tema claro/escuro persistente. Commit preservado: `0d518af0eb88188d63bc7d719197185cd04bdc4b`.

Histórico anterior: documentos em `docs/history/` e histórico Git.
