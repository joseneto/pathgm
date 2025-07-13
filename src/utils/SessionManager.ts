export interface SessionContext {
  stepId: string;
  inputType: 'text' | 'callback';
  lastMessageId?: number;
  buttonData?: string;
  messageText?: string;
  messageId?: number;
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

    // Ignore direct commands
    if (messageText?.startsWith('/')) {
      return false;
    }

    // Only handle if expecting text input
    return this.isExpecting(ctx, 'text');
  }

  private static validateContext(context: SessionContext | null): boolean {
    if (!context) {
      return false;
    }

    if (!context.stepId || !context.inputType) {
      console.warn('SessionManager: currentContext missing required fields', context);
      return false;
    }

    return true;
  }

  private static async handleCorruptedSession(ctx: any, reason: string): Promise<void> {
    console.warn(`SessionManager: Corrupted session detected - ${reason}`);

    if (ctx.session) {
      ctx.session.currentContext = null;
      ctx.session.paginationEnabled = false;
    }

    try {
      const [t] = require('../helpers/commandHelpers').getTranslation(ctx);
      await ctx.reply(t('session_reset_try_again'));
    } catch (error) {
      console.error('SessionManager: Failed to send reset message', error);
    }
  }


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
  }

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

  static updateParams(ctx: any, newParams: any) {
    if (!this.validateSession(ctx)) {
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
  }

  static captureButtonData(ctx: any) {
    if (!this.validateSession(ctx) || !ctx.callbackQuery?.data) {
      return;
    }

    const current = ctx.session.currentContext;
    if (!this.validateContext(current)) {
      return;
    }

    current.buttonData = ctx.callbackQuery.data;
  }

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

  static getButtonData(ctx: any): string | null {
    const current = this.getCurrentContext(ctx);
    return current?.buttonData || null;
  }

  static getMessageText(ctx: any): string | null {
    const current = this.getCurrentContext(ctx);
    return current?.messageText || null;
  }

  static getParams(ctx: any): any {
    const current = this.getCurrentContext(ctx);
    return current?.params || {};
  }

  static clearSession(ctx: any) {
    if (!this.validateSession(ctx)) {
      ctx.session = {};
      return;
    }

    ctx.session.currentContext = null;
  }

  static isExpecting(ctx: any, inputType: 'text' | 'callback'): boolean {
    const context = this.getCurrentContext(ctx);

    const sessionExpectsInput = context && context.inputType === inputType;

    const hasCallbackQuery = inputType === 'callback' && !!(ctx.update?.callback_query || ctx.callbackQuery);

    const hasTextMessage = inputType === 'text' && !!(ctx.message?.text || ctx.update?.message?.text);

    return sessionExpectsInput || hasCallbackQuery || hasTextMessage;
  }

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
      return await context.handler(ctx, input);
    } catch (error: any) {
      await this.handleCorruptedSession(ctx, `Handler execution failed: ${error?.message || 'Unknown error'}`);
      return false;
    }
  }
}
