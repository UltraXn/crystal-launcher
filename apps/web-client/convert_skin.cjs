const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Manually specify the source path based on user metadata
const sourcePath = 'C:/Users/nacho/.gemini/antigravity/brain/c05c03ee-92ad-4d7e-a948-fb1109d150a0/uploaded_image_1766544257687.png';
const outputPath = path.join(__dirname, 'public', 'skins', 'killu.png');

console.log(`Intentando convertir desde: ${sourcePath}`);

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Convert to PNG
sharp(sourcePath)
    .png()
    .toFile(outputPath)
    .then(info => {
        console.log('Imagen convertida exitosamente a PNG:', outputPath);
        console.log(info);
    })
    .catch(err => {
        console.error('Error al convertir la imagen:', err);
         // Fallback: copy if sharp fails
         try {
             fs.copyFileSync(sourcePath, outputPath);
             console.log('Fallback: Imagen copiada directamente (sin procesar)');
         } catch (copyErr) {
             console.error('Fallback falló:', copyErr);
         }
    });
