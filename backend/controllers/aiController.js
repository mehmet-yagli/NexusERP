const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const Asset = require('../models/Asset'); // Demirbaş verilerini de analize dahil ettim

// API Key'in sisteme doğru gelip gelmediğini kontrol etmek için küçük bir güvenlik testi.
console.log("Sistem Başlatıldı: API Key son 4 hane:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(-4) : "KEY BULUNAMADI!");

// 1. DASHBOARD İÇİN GENEL ÖZET 
exports.getInventoryInsights = async (req, res) => {
  let products = []; 
  try {
    // 1. Veritabanından ürünleri çek
    products = await Product.find();
    
    // Debug: İşlem anında anahtar kontrolü
    console.log("Analiz Başlatılıyor: API Key Durumu:", process.env.GEMINI_API_KEY ? "AKTİF" : "PASİF");

    if (!products || products.length === 0) {
      return res.status(200).json({ message: "Analiz edilecek stok verisi bulunamadı." });
    }

    // 2. Yapay zeka için özeti hazırla
    const inventorySummary = products.map(p => `${p.name}: ${p.quantity} adet`).join(', ');

    // 3. Gemini AI'ı Başlat (Environment Variable garantili)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Çalışmayan 1.5 ve pro versiyonalrından sonra Dashboard özetleri için yeni nesil hızlı Flash modeli eklendi.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Sen bir şirket yöneticisine tavsiye veren profesyonel bir ERP ve stok analisti yapay zekasın. Şu anki depomuzdaki bazı stoklar şunlar: ${inventorySummary}. Bu verilere bakarak yöneticiye stoklarla, tüketimle veya sipariş planlamasıyla ilgili sadece 1 veya en fazla 2 cümlelik çok kısa, mantıklı ve profesyonel bir tavsiye yaz. "Merhaba, ben yapay zekayım" gibi girişler yapma.`;

    // 4. İsteği gönder ve yanıtı al
    const result = await model.generateContent(prompt);
    const aiMessage = result.response.text();

    res.status(200).json({ message: aiMessage });

  } catch (error) {
    // Teknik hata loglaması
    console.error("AI Entegrasyon Hatası (Insights):", error.message);

    // Veritabanı verileriyle yerel analiz yaparak sistemin her zaman cevap vermesini sağlıyoruz.
    const criticalProducts = products.filter(p => p.quantity <= p.minQuantity);
    let fallbackMessage = "Envanter analizi tamamlandı: Mevcut stok devir hızınız normal seyrediyor. Kritik kalemleri takipte kalın.";
    
    if (criticalProducts.length > 0) {
      fallbackMessage = `Sistem Analizi: Şu an ${criticalProducts.length} üründe kritik stok seviyesi saptandı. Tedarik zinciri sürekliliği için acil alım planlanması önerilir.`;
    }

    res.status(200).json({ message: fallbackMessage });
  }
};

// 2. DETAYLI RAPOR VE ETKİLEŞİMLİ SORULAR İÇİN YENİ FONKSİYON
exports.askNexusAI = async (req, res) => {
  try {
    const { query } = req.body; 
    
    const [products, assets] = await Promise.all([
      Product.find().populate('supplier'),
      Asset.find()
    ]);

    // Fiyat bilgisi de p.price üzerinden aktarılıyor.
    const context = `
      SİSTEM VERİLERİ:
      Ürünler: ${products.map(p => `${p.name} (Stok: ${p.quantity}, Kategori: ${p.category}, Fiyat: ${p.price || 0}TL)`).join(' | ')}
      Demirbaşlar: ${assets.map(a => `${a.name} (Değer: ${a.purchasePrice || 0}TL, Durum: ${a.status})`).join(' | ')}
      Toplam Varlık Değeri: ${assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0)} TL
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // burası da güncellendi yeni ai versiyonuyla
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Sen NexusERP sisteminin uzman veri analistisin. Aşağıdaki sistem verilerine hakimsin:
    ${context}
    
    Kullanıcı sana şu soruyu sordu: "${query}"
    
    Lütfen bu soruya sistem verilerini analiz ederek, profesyonel, somut rakamlar veren ve çözüm odaklı bir yanıt ver. Eğer soru sistemde olmayan bir veriyle ilgiliyse nazikçe belirt.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.status(200).json({ answer });

  } catch (error) {
    console.error("Soru Cevaplama Hatası (AskAI):", error.message);
    res.status(500).json({ answer: "Şu an teknik bir aksaklık nedeniyle verileri analiz edemiyorum. Lütfen manuel raporları kontrol edin." });
  }
};