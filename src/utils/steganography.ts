// Canvas-based LSB Steganography (Least Significant Bit) for Lossless PNG Images

export async function hideMessageInImage(
  imageFile: File,
  message: string
): Promise<{ blob: Blob; dataUrl: string; capacityBytes: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Kunne ikke lese bilde'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Ugyldig bildeformat'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Kunne ikke opprette canvas 2D kontekst'));

          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          const msgBytes = new TextEncoder().encode(message);
          const msgLen = msgBytes.length;

          // Each pixel has 3 usable channels (R, G, B) = 3 bits per pixel
          const maxCapacityBytes = Math.floor((data.length / 4 * 3 - 32) / 8);

          if (msgLen > maxCapacityBytes) {
            return reject(
              new Error(
                `Meldingen er for stor for dette bildet (${msgLen} bytes). Bildets kapasitet er ${maxCapacityBytes} bytes. Vennligst bruk et større bilde.`
              )
            );
          }

          // Build bit array: 32 bits of length header + 8 bits per byte
          const bits: number[] = [];
          for (let i = 0; i < 32; i++) {
            bits.push((msgLen >> (31 - i)) & 1);
          }
          for (let i = 0; i < msgBytes.length; i++) {
            const byte = msgBytes[i];
            for (let b = 7; b >= 0; b--) {
              bits.push((byte >> b) & 1);
            }
          }

          // Embed bits into LSB of RGB channels
          let bitIndex = 0;
          for (let i = 0; i < data.length && bitIndex < bits.length; i++) {
            if ((i + 1) % 4 === 0) continue; // Skip Alpha channel

            // Clear lowest bit and set new bit
            data[i] = (data[i] & ~1) | bits[bitIndex];
            bitIndex++;
          }

          ctx.putImageData(imgData, 0, 0);

          canvas.toBlob(blob => {
            if (!blob) return reject(new Error('Feil ved generering av stego-bilde'));
            const dataUrl = canvas.toDataURL('image/png');
            resolve({
              blob,
              dataUrl,
              capacityBytes: maxCapacityBytes
            });
          }, 'image/png');
        } catch (err: any) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(imageFile);
  });
}

export async function extractMessageFromImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Kunne ikke lese bilde'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Ugyldig bildeformat'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Kunne ikke opprette canvas 2D kontekst'));

          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Extract 32 bits for length
          let bitCount = 0;
          let lengthVal = 0;
          let byteOffset = 0;

          while (byteOffset < data.length && bitCount < 32) {
            if ((byteOffset + 1) % 4 !== 0) {
              const bit = data[byteOffset] & 1;
              lengthVal = (lengthVal << 1) | bit;
              bitCount++;
            }
            byteOffset++;
          }

          const maxPossibleBytes = Math.floor((data.length / 4 * 3 - 32) / 8);
          if (lengthVal <= 0 || lengthVal > maxPossibleBytes) {
            return reject(
              new Error('Ingen skjult melding funnet i dette bildet (eller ugyldig stego-hode).')
            );
          }

          // Extract message bytes
          const extractedBytes = new Uint8Array(lengthVal);
          let currentByte = 0;
          let currentBit = 0;
          let extractedCount = 0;

          while (byteOffset < data.length && extractedCount < lengthVal) {
            if ((byteOffset + 1) % 4 !== 0) {
              const bit = data[byteOffset] & 1;
              currentByte = (currentByte << 1) | bit;
              currentBit++;

              if (currentBit === 8) {
                extractedBytes[extractedCount] = currentByte;
                extractedCount++;
                currentByte = 0;
                currentBit = 0;
              }
            }
            byteOffset++;
          }

          if (extractedCount < lengthVal) {
            return reject(new Error('Ufullstendig steganografisk melding i bildet.'));
          }

          const decoder = new TextDecoder('utf-8', { fatal: true });
          const text = decoder.decode(extractedBytes);
          resolve(text);
        } catch {
          reject(new Error('Kunne ikke dekode melding. Bildet inneholder kanskje ikke tekst eller er komprimert.'));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(imageFile);
  });
}
