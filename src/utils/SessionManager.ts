export interface SessionContext {
  stepId: string;
  inputType: 'text' | 'callback';
  lastMessageId?: number;
  buttonData?: string;
  messageText?: string; // ✅ ADICIONADO
  messageId?: number; // ✅ ADICIONADO
  params?: any;
  handler?: (ctx: any, input?: any) => Promise<boolean>;
}

export class SessionManager {
  /**
   * Valida se a sessão está em estado válido
   */
  private static validateSession(ctx: any): boolean {
    if (!ctx.session) {
      console.warn('SessionManager: ctx.session is null/undefined');
      return false;
    }
    return true;
  }

  static shouldHandleMessage(ctx: any): boolean {
    const messageText = ctx.message?.text?.trim();

    // ✅ Ignore direct commands
    if (messageText?.startsWith('/')) {
      return false;
    }

    // ✅ Only handle if expecting text input
    return this.isExpecting(ctx, 'text');
  }

  /**
   * Valida se o contexto atual está em estado válido
   */
  private static validateContext(context: SessionContext | null): boolean {
    if (!context) {
      console.warn('SessionManager: currentContext is null');
      return false;
    }
    
    if (!context.stepId || !context.inputType) {
      console.warn('SessionManager: currentContext missing required fields', context);
      return false;
    }
    
    return true;
  }

  /**
   * Limpa sessão corrompida e informa o usuário
   */
  private static async handleCorruptedSession(ctx: any, reason: string): Promise<void> {
    console.warn(`SessionManager: Corrupted session detected - ${reason}`);
    
    // Força limpeza completa
    if (ctx.session) {
      ctx.session.currentContext = null;
      ctx.session.paginationEnabled = false;
    }
    
    // Informa usuário de forma amigável
    try {
      await ctx.reply('🔄 Sessão foi resetada. Por favor, execute o comando novamente.');
    } catch (error) {
      console.error('SessionManager: Failed to send reset message', error);
    }
  }

  /**
   * Inicia um novo fluxo de callback - usado no início dos comandos
   */
  static initCommand(ctx: any, options: {
    stepId: string;
    inputType: 'text' | 'callback';
    lastMessageId?: number;
    params?: any;
    handler?: (ctx: any, input?: any) => Promise<boolean>;
  }) {
    if (!this.validateSession(ctx)) {
      ctx.session = {};
    }

    // Limpa callbacks anteriores quando inicia novo comando
    this.clearSession(ctx);
    
    const sessionContext: SessionContext = {
      stepId: options.stepId,
      inputType: options.inputType,
      lastMessageId: options.lastMessageId,
      params: options.params || {},
      handler: options.handler,
    };
    
    ctx.session.currentContext = sessionContext;
    
    if (options.lastMessageId) {
      ctx.session.lastMessageId = options.lastMessageId;
    }

    console.log(`SessionManager: Initialized command - stepId: ${options.stepId}, inputType: ${options.inputType}`);
  }

  /**
   * Adiciona um callback filho (para botões após text input)
   */
  static setCallback(ctx: any, callbackType: string, data?: any) {
    if (!this.validateSession(ctx)) {
      console.error('SessionManager.setCallback: Invalid session');
      return;
    }

    const sessionContext: SessionContext = {
      stepId: callbackType,
      inputType: 'callback',
      params: data
    };
    
    ctx.session.currentContext = sessionContext;
  }

  /**
   * Atualiza dados do callback atual
   */
  static updateParams(ctx: any, newParams: any) {
    if (!this.validateSession(ctx)) {
      console.error('SessionManager.updateParams: Invalid session');
      return;
    }

    const current = ctx.session.currentContext;
    if (!this.validateContext(current)) {
      console.error('SessionManager.updateParams: Invalid context');
      return;
    }
    
    current.params = {
      ...current.params,
      ...newParams
    };

    console.log(`SessionManager: Updated params for stepId: ${current.stepId}`);
  }

  /**
   * Transiciona para próximo step no mesmo callback
   */
  static nextStep(ctx: any, options: {
    stepId: string;
    inputType: 'text' | 'callback';
    lastMessageId?: number;
    params?: any;
    handler?: (ctx: any, input?: any) => Promise<boolean>;
  }) {
    if (!this.validateSession(ctx)) {
      console.error('SessionManager.nextStep: Invalid session');
      return;
    }

    const current = ctx.session.currentContext;
    if (!this.validateContext(current)) {
      console.error('SessionManager.nextStep: Invalid context');
      return;
    }
    
    // Preserva params anteriores e adiciona novos
    const updatedParams = {
      ...current.params,
      ...options.params
    };

    ctx.session.currentContext = {
      stepId: options.stepId,
      inputType: options.inputType,
      lastMessageId: options.lastMessageId || current.lastMessageId,
      params: updatedParams,
      handler: options.handler || current.handler
    };
    
    if (options.lastMessageId) {
      ctx.session.lastMessageId = options.lastMessageId;
    }

    console.log(`SessionManager: Next step - from ${current.stepId} to ${options.stepId}`);
  }

  /**
   * Atualiza apenas o lastMessageId
   */
  static updateLastMessageId(ctx: any, messageId: number) {
    if (!this.validateSession(ctx)) {
      console.error('SessionManager.updateLastMessageId: Invalid session');
      return;
    }

    const current = ctx.session.currentContext;
    if (!this.validateContext(current)) {
      console.error('SessionManager.updateLastMessageId: Invalid context');
      return;
    }
    
    current.lastMessageId = messageId;
    ctx.session.lastMessageId = messageId;
  }

  /**
   * Captura dados do botão (chamado automaticamente no safeWrapper)
   */
  static captureButtonData(ctx: any) {
    if (!this.validateSession(ctx) || !ctx.callbackQuery?.data) {
      return;
    }

    const current = ctx.session.currentContext;
    if (!this.validateContext(current)) {
      return;
    }

    current.buttonData = ctx.callbackQuery.data;
    console.log(`SessionManager: Captured button data: ${ctx.callbackQuery.data}`);
  }

  /**
   * Captura dados da mensagem (chamado automaticamente no safeWrapper)
   */
  static captureMessage(ctx: any) {
    if (!this.validateSession(ctx) || !ctx.message) {
      return;
    }

    const current = ctx.session.currentContext;
    if (!this.validateContext(current)) {
      return;
    }
    
    current.messageText = ctx.message.text?.trim();
    current.messageId = ctx.message.message_id;
  }

  /**
   * Recupera contexto atual com validação
   */
  static getCurrentContext(ctx: any): SessionContext | null {
    if (!this.validateSession(ctx)) {
      return null;
    }

    const current = ctx.session.currentContext;
    if (!this.validateContext(current)) {
      return null;
    }

    return current;
  }

  /**
   * Recupera dados do botão com validação
   */
  static getButtonData(ctx: any): string | null {
    const current = this.getCurrentContext(ctx);
    return current?.buttonData || null;
  }

  /**
   * Recupera texto da mensagem com validação
   */
  static getMessageText(ctx: any): string | null {
    const current = this.getCurrentContext(ctx);
    return current?.messageText || null;
  }

  /**
   * Recupera parâmetros com validação
   */
  static getParams(ctx: any): any {
    const current = this.getCurrentContext(ctx);
    return current?.params || {};
  }

  /**
   * Limpa sessão
   */
  static clearSession(ctx: any) {
    if (!this.validateSession(ctx)) {
      ctx.session = {};
      return;
    }

    ctx.session.currentContext = null;
    console.log('SessionManager: Session cleared');
  }

  static isExpecting(ctx: any, inputType: 'text' | 'callback'): boolean {
    const context = this.getCurrentContext(ctx);

    const sessionExpectsInput = context && context.inputType === inputType;

    const hasCallbackQuery = inputType === 'callback' && !!(ctx.update?.callback_query || ctx.callbackQuery);

    const hasTextMessage = inputType === 'text' && !!(ctx.message?.text || ctx.update?.message?.text);

    return sessionExpectsInput || hasCallbackQuery || hasTextMessage;
  }

  /**
   * Executa handler atual com validação robusta
   */
  static async executeCurrentHandler(ctx: any, input?: any): Promise<boolean> {
    const context = this.getCurrentContext(ctx);
    
    if (!context) {
      await this.handleCorruptedSession(ctx, 'No current context');
      return false;
    }
    
    if (!context.handler) {
      await this.handleCorruptedSession(ctx, 'No handler in context');
      return false;
    }
    
    try {
      console.log(`SessionManager: Executing handler for stepId: ${context.stepId}`);
      return await context.handler(ctx, input);
    } catch (error: any) {
      console.error(`SessionManager: Handler execution failed for stepId: ${context.stepId}`, error);
      await this.handleCorruptedSession(ctx, `Handler execution failed: ${error?.message || 'Unknown error'}`);
      return false;
    }
  }
}
