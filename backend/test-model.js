const API_KEY = process.env.GEMINI_API_KEY;

async function modelleriGetir() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
      const modelIsimleri = data.models.map(m => m.name);
      console.log("Senin Hesabına Açık Modeller:\n", modelIsimleri.join('\n'));
    } else {
      console.log("Hata Detayı:", data);
    }
  } catch (error) {
    console.error("Bağlantı Hatası:", error.message);
  }
}

modelleriGetir();