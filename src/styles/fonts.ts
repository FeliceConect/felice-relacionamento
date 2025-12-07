import { Sarabun, Playfair_Display } from 'next/font/google'

/**
 * Sarabun - Fonte sans-serif para textos
 * Carregada do Google Fonts
 * Usada para corpo de texto, botões, labels, etc.
 */
export const sarabun = Sarabun({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  preload: true,
})

/**
 * Playfair Display - Fonte serifada para títulos (substituto do Butler)
 *
 * NOTA: A fonte Butler original é proprietária.
 * Playfair Display é uma alternativa de alta qualidade com características similares:
 * - Elegante e sofisticada
 * - Ótima legibilidade em títulos
 * - Estilo clássico que combina com a marca Felice
 *
 * Se você tiver os arquivos Butler (.woff2), pode configurar como localFont:
 *
 * import localFont from 'next/font/local'
 * export const butler = localFont({
 *   src: [
 *     { path: '../../public/fonts/Butler-Regular.woff2', weight: '400' },
 *     { path: '../../public/fonts/Butler-Medium.woff2', weight: '500' },
 *     { path: '../../public/fonts/Butler-Bold.woff2', weight: '700' },
 *   ],
 *   variable: '--font-butler',
 * })
 */
export const butler = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-butler',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  preload: true,
})

/**
 * Combina as variáveis CSS de todas as fontes
 * Uso no root layout: className={fontVariables}
 */
export const fontVariables = `${butler.variable} ${sarabun.variable}`

/**
 * Classes para aplicar fontes específicas diretamente
 */
export const fontClasses = {
  butler: butler.className,
  sarabun: sarabun.className,
}
