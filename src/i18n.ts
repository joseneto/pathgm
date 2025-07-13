import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import path from 'path'

export async function initI18n() {
  // Check if already initialized
  if (i18next.isInitialized) {
    return;
  }

  // Determine the correct path for translations
  // Handle both bot execution and web context execution
  let localesPath;
  const possiblePaths = [
    path.resolve(__dirname, '../locales/{{lng}}/translation.json'),
    path.resolve(__dirname, '../../bot/locales/{{lng}}/translation.json'),
    path.resolve(process.cwd(), 'packages/bot/locales/{{lng}}/translation.json'),
    path.resolve(process.cwd(), '../bot/locales/{{lng}}/translation.json'),
    path.resolve(__dirname, '../../../../packages/bot/locales/{{lng}}/translation.json')
  ];
  
  // Find which path exists
  console.log('🔍 Testing paths for locales:');
  for (const testPath of possiblePaths) {
    const actualPath = testPath.replace('{{lng}}', 'en');
    console.log(`  Testing: ${actualPath}`);
    if (require('fs').existsSync(actualPath)) {
      localesPath = testPath;
      console.log('📁 Using locales path:', localesPath);
      break;
    }
  }
  
  if (!localesPath) {
    console.error('❌ Could not find locales directory');
    throw new Error('Translation files not found');
  }
  
  await i18next.use(Backend).init({
    fallbackLng: 'en',
    preload: ['en', 'pt'],
    supportedLngs: ['en', 'pt'],
    backend: {
      loadPath: localesPath,
    },
    interpolation: {
      escapeValue: false,
    },
  })
}
