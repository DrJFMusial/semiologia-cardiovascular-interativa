# Temas — v1.1.0

O botão **Tema** (ícone de lua) na barra da aula alterna entre claro e escuro. O estado pressionado indica tema escuro ativo. Funciona com clique, toque, Enter ou Espaço quando o botão recebe foco.

O tema claro continua sendo o padrão. A escolha é salva em `localStorage` (`e2m08-theme`) e restaurada antes da montagem da aula, inclusive ao trocar de modo apresentação/estudo. Se o navegador bloquear armazenamento, a escolha continua funcional na página atual. A versão offline usa a mesma implementação; persistência depende das permissões do navegador para arquivos locais.

O tema escuro adapta superfícies, texto, controles, menu, traçados, ECG e o manômetro. As cores vermelho/azul mantêm a distinção fisiológica; ilustrações anatômicas preservam suas cores originais. Os canvases de áudio são redesenhados ao trocar o tema, sem recriar sons nem mudar respostas.

Não foram alterados os conceitos médicos ou os parâmetros dos simuladores. A validação inclui os testes existentes e inspeção funcional do tema, persistência, teclado, modos de uso e largura móvel. Isso não constitui certificação integral de acessibilidade.
