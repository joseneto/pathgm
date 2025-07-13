import i18next from 'i18next'
import Backend from 'i18next-fs-backend'

export async function initI18n() {
  await i18next.use(Backend).init({
    fallbackLng: 'en',
    preload: ['en', 'pt'],
    supportedLngs: ['en', 'pt'],
    backend: {
      loadPath: './locales/{{lng}}/translation.json',
    },
    interpolation: {
      escapeValue: false,
    },
  })
}