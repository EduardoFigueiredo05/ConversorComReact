import { MAX_AMOUNT } from '../constants';
import { formatNumber } from './formatters';

/**
 * Máscara "de caixa eletrônico": os dígitos digitados entram pela direita
 * (1 -> 0,01 ; 12 -> 0,12 ; 125000 -> 1.250,00). Evita estados inválidos
 * como "1,2,3" e funciona bem com teclado numérico no celular.
 */
export function parseAmountInput(rawText) {
  const digits = String(rawText).replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return 0;
  const value = Number(digits) / 100;
  return Math.min(value, MAX_AMOUNT);
}

export function formatAmountInput(value) {
  return formatNumber(Number.isFinite(value) ? value : 0, 2);
}

export function validateConversion({ amount, from, to }) {
  if (!from || !to) return 'Selecione as moedas de origem e de destino.';
  if (from === to) return 'Escolha moedas diferentes para converter.';
  if (!Number.isFinite(amount) || amount <= 0) return 'Informe um valor maior que zero.';
  if (amount >= MAX_AMOUNT) return 'Valor acima do limite permitido.';
  return null;
}
