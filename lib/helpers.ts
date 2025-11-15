// Función para formatear con decimales dinámicos basados en dígitos antes del punto
export const formatAmount = (value: string): string => {
  const num = parseFloat(value)
  if (isNaN(num)) return value

  // Obtener la parte entera
  const integerPart = Math.floor(num).toString()
  const integerDigits = integerPart.length

  // Calcular decimales basados en dígitos de la parte entera
  // Más dígitos = menos decimales para mantener legibilidad
  let maxDecimals: number
  if (integerDigits >= 7) {
    maxDecimals = 0 // Sin decimales para números muy grandes (1M+)
  } else if (integerDigits >= 6) {
    maxDecimals = 1 // 1 decimal para números grandes (100K-999K)
  } else if (integerDigits >= 5) {
    maxDecimals = 2 // 2 decimales para números medianos-grandes (10K-99K)
  } else if (integerDigits >= 3) {
    maxDecimals = 4 // 4 decimales para números medianos (100-9999)
  } else {
    maxDecimals = 6 // 6 decimales para números pequeños (<100)
  }

  // Formatear y remover ceros al final
  return num.toFixed(maxDecimals).replace(/\.?0+$/, '')
}
