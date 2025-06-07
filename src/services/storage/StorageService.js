const fs = require('fs');
const path = require('path');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    // Gunakan timestamp dan nama asli untuk membuat nama file unik
    const filename = `${+new Date()}-${meta.filename}`;
    const filePath = path.join(this._folder, filename);

    // Buat writable stream ke tujuan file
    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      // Jika terjadi error saat menulis, reject promise
      fileStream.on('error', (error) => reject(error));
      
      // Salurkan data dari file (payload Hapi) ke fileStream
      file.pipe(fileStream);
      
      // Ketika file selesai disalurkan (ditulis), resolve promise dengan nama file
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageService;
