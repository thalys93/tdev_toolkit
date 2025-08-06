# Padrão de Resposta da API

Este documento descreve o padrão de resposta padronizado implementado em todos os endpoints da API.

## Formato de Resposta de Sucesso

```json
{
  "data": "dados retornados pelo endpoint (se houver)",
  "status": "success",
  "code": 200,
  "key": "modulo/endpoint",
  "message": "Mensagem descritiva da operação"
}
```

## Formato de Resposta de Erro

```json
{
  "error": "Descrição do erro",
  "status": "error|validation_error|not_found|internal_error",
  "code": 400,
  "key": "modulo/endpoint",
  "message": "Mensagem adicional sobre o erro",
  "details": "Detalhes técnicos do erro (opcional)"
}
```

## Status Disponíveis

- `success`: Operação realizada com sucesso
- `error`: Erro geral
- `validation_error`: Erro de validação de dados
- `not_found`: Recurso não encontrado
- `internal_error`: Erro interno do servidor
- `webhook_processed`: Webhook processado com sucesso
- `webhook_ignored`: Webhook ignorado (ex: dados de teste)

## Chaves dos Endpoints

### Core Module
- `core/system-check`: Verificação do status do sistema
- `core/cloudinary-signature`: Geração de assinatura do Cloudinary

### Email Module
- `email/health`: Verificação do status do serviço de email
- `email/send`: Envio de email personalizado
- `email/send-template`: Envio de email usando template
- `email/send-welcome`: Envio de email de boas-vindas
- `email/send-password-reset`: Envio de email de redefinição de senha
- `email/send-notification`: Envio de email de notificação
- `email/send-test`: Envio de email de teste
- `email/templates`: Listagem de templates disponíveis
- `email/template-info`: Informações de um template específico

### Payment Module
- `payment/create`: Criação de pagamento
- `payment/webhook-stripe`: Webhook do Stripe
- `payment/webhook-mercadopago`: Webhook do MercadoPago
- `payment/webhook-abacatepay`: Webhook do AbacatePay

## Exemplos de Uso

### Resposta de Sucesso - Criação de Pagamento
```json
{
  "data": {
    "id": "pay_123456",
    "status": "pending",
    "amount": 1000,
    "currency": "BRL",
    "checkoutUrl": "https://checkout.stripe.com/..."
  },
  "status": "success",
  "code": 200,
  "key": "payment/create",
  "message": "Pagamento criado com sucesso"
}
```

### Resposta de Erro - Dados Inválidos
```json
{
  "error": "Dados inválidos para criação de pagamento",
  "status": "validation_error",
  "code": 400,
  "key": "payment/create",
  "message": "O campo 'amount' é obrigatório",
  "details": {
    "field": "amount",
    "value": null,
    "constraint": "isNotEmpty"
  }
}
```

### Resposta de Webhook Processado
```json
{
  "data": {
    "received": true,
    "eventId": "evt_123456",
    "eventType": "checkout.session.completed"
  },
  "status": "webhook_processed",
  "code": 200,
  "key": "payment/webhook-stripe",
  "message": "Webhook do Stripe processado com sucesso: checkout.session.completed"
}
```

## Implementação

O padrão é implementado usando:

1. **ApiResponseBuilder**: Classe utilitária para construir respostas padronizadas
2. **API_KEYS**: Constantes com as chaves de todos os endpoints
3. **API_STATUS**: Constantes com os status disponíveis
4. **GlobalExceptionFilter**: Filtro global para capturar e padronizar erros não tratados

## Benefícios

- **Consistência**: Todas as respostas seguem o mesmo formato
- **Rastreabilidade**: Cada endpoint tem uma chave única para identificação
- **Debugging**: Informações detalhadas sobre erros
- **Frontend-friendly**: Formato previsível facilita o desenvolvimento frontend
- **Monitoramento**: Facilita a implementação de logs e métricas