# POO---Compra-de-Passagens-Aereas

botão direito dentro da pasta backend, abrir CMD, executar npm run dev ou npm run test:sistema de novo.

Estrutura:

CHECKLIST GERAL DO PROJETO
🟦 BACKEND (fase atual)
Bloco 1 — Configuração inicial do projeto

 package.json
 tsconfig.json
 .gitignore
 Instruções de instalação (quais comandos npm install rodar)

Bloco 2 — Enums

 src/enums/TipoUsuario.ts
 src/enums/TipoVoo.ts
 src/enums/ClasseAssento.ts
 src/enums/StatusReserva.ts
 src/enums/StatusVoo.ts

Bloco 3 — Database (TypeORM + SQLite)

 src/database/data-source.ts

Bloco 4 — Models (entidades)

 src/models/Usuario.ts (classe abstrata base)
 src/models/UsuarioPadrao.ts
 src/models/UsuarioVIP.ts
 src/models/Admin.ts
 src/models/Voo.ts
 src/models/Assento.ts
 src/models/Reserva.ts
 src/models/Notificacao.ts
 src/models/Desconto.ts

Bloco 5 — Repositories

 src/repositories/UsuarioRepository.ts
 src/repositories/VooRepository.ts
 src/repositories/ReservaRepository.ts

Bloco 6 — Utils

 src/utils/GeradorId.ts

Bloco 7 — Services (regras de negócio)

 src/services/AuthService.ts
 src/services/VooService.ts
 src/services/ReservaService.ts
 src/services/PagamentoService.ts
 src/services/UpgradeVIPService.ts
 src/services/NotificacaoService.ts
 src/services/DescontoService.ts

Bloco 8 — Controllers (rotas Express)

 src/controllers/AuthController.ts
 src/controllers/UsuarioController.ts
 src/controllers/VooController.ts
 src/controllers/ReservaController.ts

Bloco 9 — App principal

 src/app.ts (monta o Express, registra rotas, inicializa DB)

Bloco 10 — Testes

 src/tests/testeSistema.ts (script que popula o banco e testa fluxos via chamadas HTTP ou direto nos services)

Bloco 11 — Documentação

 README.md completo (instalação, execução, exemplos de requisições, diagrama UML textual, etc.)


🟩 FRONTEND (fase futura — só o checklist por agora)

 Setup do projeto (provavelmente React + Vite + TypeScript)
 Tela de Login
 Tela de Cadastro
 Tela de listagem/busca de voos
 Tela de seleção de assento
 Tela de confirmação de pagamento (reserva)
 Tela "Minhas Reservas"
 Tela de upgrade VIP
 Painel Admin (CRUD de voos, descontos, relatórios)
 Componente de notificações
 Integração com a API do backend (fetch/axios)
 Estilização
