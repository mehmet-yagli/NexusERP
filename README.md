# 📦 NexusERP - Akıllı Envanter Yönetim Sistemi

**Yapay Zeka Destekli Akıllı Envanter Yönetim Sistemi**

![MERN Stack](https://img.shields.io/badge/MERN_Stack-000000?style=for-the-badge&logo=mongodb&logoColor=green)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) 
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) !
[Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white) 
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 📌 Proje Özeti
NexusERP, modern işletmelerin karmaşık stok ve varlık süreçlerini tek bir merkezden, akıllı bir şekilde yönetebilmesi için tasarlanmış Full-Stack (MERN) bir envanter yönetim sistemidir. Google Gemini API entegrasyonu sayesinde sistem, mevcut stok verilerini analiz ederek kullanıcılara öngörülü raporlar ve stratejik tavsiyeler sunar.

## 🚀 Öne Çıkan Özellikler

* 🤖 **Akıllı AI Asistanı:** Gemini API kullanılarak stok durumları, kritik seviyeler ve tedarik optimizasyonları için yapay zeka destekli anlık analiz.
* 🔐 **Güvenli Kimlik Doğrulama:** JWT (JSON Web Token) tabanlı oturum yönetimi ve rol bazlı erişim kontrolü.
* 📊 **Kapsamlı Modüler Mimari:**
  * **Ürün Yönetimi:** Stok takibi ve kategori yönetimi.
  * **Varlık & Bakım:** İşletme demirbaşlarının takibi ve bakım periyotlarının planlanması.
  * **Tedarikçi Yönetimi:** Tedarikçi bilgileri ve süreçlerinin organizasyonu.
* 📝 **Denetim Logları:** Sistem üzerinde yapılan her değişikliğin, hangi kullanıcı tarafından ne zaman yapıldığının kayıt altına alınması.

## 🛠️ Teknoloji Yığını

* **Frontend:** React.js, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Veritabanı:** MongoDB, Mongoose ORM
* **Yapay Zeka:** Google Gemini API

## 📂 Dosya Mimarisi

* /backend - API servisleri, veritabanı modelleri, AI fonksiyonları ve JWT yetkilendirme
* /frontend - Kullanıcı arayüzü, React bileşenleri ve Tailwind stil yapılandırması
* .gitignore - Git tarafından yok sayılacak modül ve gizli ortam değişkenleri
* README.md - Proje dokümantasyonu

## ⚙️ Kurulum ve Çalıştırma

Projeyi kendi yerel ortamınızda test etmek için şu adımları izleyebilirsiniz:

1. Repoyu klonlayın.
2. `backend` klasörü içinde bir `.env` dosyası oluşturun ve aşağıdaki tanımlamaları kendi bilgilerinizle doldurun:
   - PORT=5000
   - MONGO_URI=sizin_mongodb_baglanti_adresiniz
   - GEMINI_API_KEY=sizin_gemini_api_anahtariniz
3. Hem `backend` hem de `frontend` klasörlerinde terminal açarak `npm install` komutu ile kütüphaneleri kurun.
4. Sunucuları başlatmak için backend klasöründe `npm run dev`, frontend klasöründe ise `npm start` komutunu çalıştırın.

---
Geliştirici: [Mehmet Yağlı](https://github.com/mehmet-yagli)