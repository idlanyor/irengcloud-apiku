# Commit Rules & Conventions (Conventional Commits)

Proyek **IrengCloud Universal API** menerapkan aturan standar **Conventional Commits 1.0.0** yang selaras dengan disiplin **SemVer (Semantic Versioning)**.

---

## 📌 Format Pesan Commit

Setiap commit **WAJIB** mengikuti format berikut:

```text
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

Contoh:
* `feat(hadits): add search endpoint with FTS5 support`
* `fix(server): resolve SQLite connection crash in docker environment`
* `chore(release): bump version to 1.1.0`

---

## 🏷️ Tipe Commit (`<type>`)

| Type | Penjelasan | Dampak SemVer |
| :--- | :--- | :--- |
| **`feat`** | Penambahan fitur / modul API baru (misal: `/api/v1/quran`). | `MINOR` (v1.**1**.0) |
| **`fix`** | Perbaikan bug atau kesalahan pada kode API. | `PATCH` (v1.0.**1**) |
| **`refactor`** | Perubahan kode tanpa menambah fitur atau mengubah respon API. | `PATCH` (v1.0.**1**) |
| **`perf`** | Optimasi performa (misal: query SQLite lebih cepat, caching). | `PATCH` (v1.0.**1**) |
| **`docs`** | Perubahan dokumentasi (README, API docs). | Tidak ada bump |
| **`style`** | Format kode (formatting, titik koma, linter) tanpa ubah logika. | Tidak ada bump |
| **`test`** | Menambah atau memperbaiki unit test. | Tidak ada bump |
| **`chore`** | Perubahan build, Dockerfile, dependency, atau konfigurasi. | `PATCH` (jika relefan) |

---

## 💥 Breaking Changes (Perubahan Yang Merusak)

Jika commit berisi **Breaking Changes** (menghapus rute, mengubah skema JSON response):
1. Tambahkan tanda **`!`** setelah tipe/scope: `feat(hadits)!: change response schema`
2. Sertakan penjelasan di bagian Footer: `BREAKING CHANGE: field 'id' is renamed to 'hadits_id'`
3. Dampak SemVer: **`MAJOR`** (v**2**.0.0)

---

## 📝 Lingkup (`<scope>`)

Gunakan scope berikut untuk memperjelas modul yang diubah:
* `hadits` - Modul API Hadits
* `server` - Core server Express & middleware
* `config` - File konfigurasi (SemVer, DB)
* `docker` - Dockerfile, Docker Compose
* `nginx` - Konfigurasi Reverse Proxy Nginx
* `scraper` - Script scraping data

---

## 🚀 Git Commit Message Template

Setel template commit pada Git lokal Anda dengan perintah:
```bash
git config commit.template .gitmessage
```
