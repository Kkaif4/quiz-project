/**
 * Pure TypeScript QR Code generator.
 * Produces crisp, scalable SVG QR codes without any external runtime dependencies.
 * Conforms to ISO/IEC 18004 standards for Error Correction Level M.
 */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGaloisField() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = val;
    GF_EXP[i + 255] = val;
    GF_LOG[val] = i;
    val <<= 1;
    if (val & 0x100) {
      val ^= 0x11d;
    }
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(numEc: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < numEc; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    const factor = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMul(poly[j], factor);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

function rsComputeRemainder(data: Uint8Array, numEc: number): Uint8Array {
  const genPoly = rsGeneratorPoly(numEc);
  const remainder = new Uint8Array(numEc);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    for (let j = 0; j < numEc - 1; j++) {
      remainder[j] = remainder[j + 1] ^ gfMul(genPoly[numEc - 1 - j], factor);
    }
    remainder[numEc - 1] = gfMul(genPoly[0], factor);
  }
  return remainder;
}

interface QRVersionSpec {
  version: number;
  totalCodewords: number;
  ecCodewordsPerBlock: number;
  group1Blocks: number;
  group1DataWords: number;
  group2Blocks: number;
  group2DataWords: number;
  remainderBits: number;
  alignments: number[];
}

const QR_SPECS: QRVersionSpec[] = [
  { version: 1, totalCodewords: 26, ecCodewordsPerBlock: 10, group1Blocks: 1, group1DataWords: 16, group2Blocks: 0, group2DataWords: 0, remainderBits: 0, alignments: [] },
  { version: 2, totalCodewords: 44, ecCodewordsPerBlock: 16, group1Blocks: 1, group1DataWords: 28, group2Blocks: 0, group2DataWords: 0, remainderBits: 7, alignments: [6, 18] },
  { version: 3, totalCodewords: 70, ecCodewordsPerBlock: 26, group1Blocks: 1, group1DataWords: 44, group2Blocks: 0, group2DataWords: 0, remainderBits: 7, alignments: [6, 22] },
  { version: 4, totalCodewords: 100, ecCodewordsPerBlock: 18, group1Blocks: 2, group1DataWords: 32, group2Blocks: 0, group2DataWords: 0, remainderBits: 7, alignments: [6, 26] },
  { version: 5, totalCodewords: 134, ecCodewordsPerBlock: 24, group1Blocks: 2, group1DataWords: 43, group2Blocks: 0, group2DataWords: 0, remainderBits: 7, alignments: [6, 30] },
  { version: 6, totalCodewords: 172, ecCodewordsPerBlock: 16, group1Blocks: 4, group1DataWords: 27, group2Blocks: 0, group2DataWords: 0, remainderBits: 7, alignments: [6, 34] },
  { version: 7, totalCodewords: 196, ecCodewordsPerBlock: 18, group1Blocks: 4, group1DataWords: 31, group2Blocks: 0, group2DataWords: 0, remainderBits: 0, alignments: [6, 22, 38] },
  { version: 8, totalCodewords: 242, ecCodewordsPerBlock: 22, group1Blocks: 2, group1DataWords: 38, group2Blocks: 2, group2DataWords: 39, remainderBits: 0, alignments: [6, 24, 42] },
  { version: 9, totalCodewords: 292, ecCodewordsPerBlock: 22, group1Blocks: 3, group1DataWords: 36, group2Blocks: 2, group2DataWords: 37, remainderBits: 0, alignments: [6, 26, 46] },
  { version: 10, totalCodewords: 346, ecCodewordsPerBlock: 26, group1Blocks: 4, group1DataWords: 43, group2Blocks: 1, group2DataWords: 44, remainderBits: 0, alignments: [6, 28, 50] },
];

function selectVersion(dataLen: number): QRVersionSpec {
  for (const spec of QR_SPECS) {
    const totalDataCapacity =
      spec.group1Blocks * spec.group1DataWords +
      spec.group2Blocks * spec.group2DataWords;
    const headerBits = 4 + (spec.version >= 10 ? 16 : 8);
    const requiredBytes = Math.ceil((headerBits + dataLen * 8 + 4) / 8);
    if (requiredBytes <= totalDataCapacity) {
      return spec;
    }
  }
  throw new Error("Text too long for supported QR versions (max version 10)");
}

class BitBuffer {
  private buffer: number[] = [];
  private length = 0;

  put(num: number, length: number) {
    for (let i = length - 1; i >= 0; i--) {
      this.putBit(((num >>> i) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  getLengthInBits(): number {
    return this.length;
  }
}

function encodeData(text: string, spec: QRVersionSpec): Uint8Array {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);
  const totalDataWords =
    spec.group1Blocks * spec.group1DataWords +
    spec.group2Blocks * spec.group2DataWords;

  const bb = new BitBuffer();
  bb.put(0b0100, 4); // Byte mode

  const countBits = spec.version >= 10 ? 16 : 8;
  bb.put(rawBytes.length, countBits);

  for (let i = 0; i < rawBytes.length; i++) {
    bb.put(rawBytes[i], 8);
  }

  const remainingBits = totalDataWords * 8 - bb.getLengthInBits();
  const termBits = Math.min(4, Math.max(0, remainingBits));
  bb.put(0, termBits);

  const padToByte = (8 - (bb.getLengthInBits() % 8)) % 8;
  if (padToByte > 0) {
    bb.put(0, padToByte);
  }

  const currentBytes = bb.getBytes();
  const padded = new Uint8Array(totalDataWords);
  padded.set(currentBytes);
  let padIdx = currentBytes.length;
  const padPatterns = [0xec, 0x11];
  let p = 0;
  while (padIdx < totalDataWords) {
    padded[padIdx++] = padPatterns[p];
    p = (p + 1) % 2;
  }

  const totalBlocks = spec.group1Blocks + spec.group2Blocks;
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];

  let offset = 0;
  for (let b = 0; b < spec.group1Blocks; b++) {
    const blockData = padded.slice(offset, offset + spec.group1DataWords);
    dataBlocks.push(blockData);
    ecBlocks.push(rsComputeRemainder(blockData, spec.ecCodewordsPerBlock));
    offset += spec.group1DataWords;
  }
  for (let b = 0; b < spec.group2Blocks; b++) {
    const blockData = padded.slice(offset, offset + spec.group2DataWords);
    dataBlocks.push(blockData);
    ecBlocks.push(rsComputeRemainder(blockData, spec.ecCodewordsPerBlock));
    offset += spec.group2DataWords;
  }

  const finalCodewords: number[] = [];
  const maxDataWords = Math.max(spec.group1DataWords, spec.group2DataWords);
  for (let i = 0; i < maxDataWords; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      if (i < dataBlocks[b].length) {
        finalCodewords.push(dataBlocks[b][i]);
      }
    }
  }

  for (let i = 0; i < spec.ecCodewordsPerBlock; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      finalCodewords.push(ecBlocks[b][i]);
    }
  }

  return new Uint8Array(finalCodewords);
}

const FORMAT_DIVISOR = 0x537;
const FORMAT_MASK = 0x5412;

function getFormatBits(mask: number): number {
  const data = (0b00 << 3) | mask; // 5 bits (Level M = 00)
  let remainder = data << 10;
  for (let i = 4; i >= 0; i--) {
    if ((remainder >>> (i + 10)) & 1) {
      remainder ^= FORMAT_DIVISOR << i;
    }
  }
  return ((data << 10) | remainder) ^ FORMAT_MASK;
}

const VERSION_DIVISOR = 0x1f25;
function getVersionBits(version: number): number {
  let remainder = version << 12;
  for (let i = 5; i >= 0; i--) {
    if ((remainder >>> (i + 12)) & 1) {
      remainder ^= VERSION_DIVISOR << i;
    }
  }
  return (version << 12) | remainder;
}

function maskCondition(mask: number, r: number, c: number): boolean {
  switch (mask) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    default: return false;
  }
}

/**
 * Generates a 2D boolean QR matrix for the given text.
 * True indicates a dark module, false indicates light.
 */
export function generateQrMatrix(text: string): boolean[][] {
  const spec = selectVersion(text.length);
  const size = 17 + 4 * spec.version;

  const modules: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );

  function setFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          isFunction[nr][nc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            modules[nr][nc] =
              r === 0 ||
              r === 6 ||
              c === 0 ||
              c === 6 ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          } else {
            modules[nr][nc] = false;
          }
        }
      }
    }
  }

  // Place Finder Patterns
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    isFunction[6][i] = true;
    modules[6][i] = i % 2 === 0;
    isFunction[i][6] = true;
    modules[i][6] = i % 2 === 0;
  }

  // Alignment patterns
  const aligns = spec.alignments;
  for (const r of aligns) {
    for (const c of aligns) {
      if (isFunction[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          isFunction[nr][nc] = true;
          modules[nr][nc] =
            Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
        }
      }
    }
  }

  // Dark module
  const darkRow = 4 * spec.version + 9;
  isFunction[darkRow][8] = true;
  modules[darkRow][8] = true;

  // Reserve Format Info
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      isFunction[8][i] = true;
      isFunction[i][8] = true;
    }
  }
  for (let i = size - 8; i < size; i++) {
    isFunction[8][i] = true;
  }
  for (let i = size - 7; i < size; i++) {
    isFunction[i][8] = true;
  }

  // Reserve Version Info for version >= 7
  if (spec.version >= 7) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        isFunction[r][size - 11 + c] = true;
        isFunction[size - 11 + c][r] = true;
      }
    }
  }

  // Encode data
  const codewords = encodeData(text, spec);
  const bitStream: boolean[] = [];
  for (let i = 0; i < codewords.length; i++) {
    for (let b = 7; b >= 0; b--) {
      bitStream.push(((codewords[i] >>> b) & 1) === 1);
    }
  }
  for (let i = 0; i < spec.remainderBits; i++) {
    bitStream.push(false);
  }

  // Place data in matrix
  let bitIndex = 0;
  let dirUp = true;
  for (let rightCol = size - 1; rightCol > 0; rightCol -= 2) {
    if (rightCol === 6) rightCol = 5;
    const leftCol = rightCol - 1;

    const rowStart = dirUp ? size - 1 : 0;
    const rowEnd = dirUp ? -1 : size;
    const rowStep = dirUp ? -1 : 1;

    for (let r = rowStart; r !== rowEnd; r += rowStep) {
      for (const col of [rightCol, leftCol]) {
        if (!isFunction[r][col]) {
          if (bitIndex < bitStream.length) {
            modules[r][col] = bitStream[bitIndex++];
          } else {
            modules[r][col] = false;
          }
        }
      }
    }
    dirUp = !dirUp;
  }

  // Select best mask (0-7)
  let lowestPenalty = Infinity;
  let bestModules: boolean[][] = [];

  for (let mask = 0; mask < 8; mask++) {
    const testModules = modules.map((row) => [...row]);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isFunction[r][c]) {
          if (maskCondition(mask, r, c)) {
            testModules[r][c] = !testModules[r][c];
          }
        }
      }
    }

    // Write format info
    const formatBits = getFormatBits(mask);
    const formatPos = [
      [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
      [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    ];
    for (let i = 0; i < 15; i++) {
      const bit = ((formatBits >>> (14 - i)) & 1) === 1;
      const [r, c] = formatPos[i];
      testModules[r][c] = bit;
    }

    for (let i = 0; i < 7; i++) {
      const bit = ((formatBits >>> i) & 1) === 1;
      testModules[size - 1 - i][8] = bit;
    }
    for (let i = 7; i < 15; i++) {
      const bit = ((formatBits >>> i) & 1) === 1;
      testModules[8][size - 15 + i] = bit;
    }

    if (spec.version >= 7) {
      const vBits = getVersionBits(spec.version);
      for (let i = 0; i < 18; i++) {
        const bit = ((vBits >>> i) & 1) === 1;
        const r = Math.floor(i / 3);
        const c = size - 11 + (i % 3);
        testModules[r][c] = bit;
        testModules[c][r] = bit;
      }
    }

    // Evaluate penalty
    let penalty = 0;
    // Penalty 1: Consecutive lines
    for (let r = 0; r < size; r++) {
      let run = 1;
      for (let c = 1; c < size; c++) {
        if (testModules[r][c] === testModules[r][c - 1]) {
          run++;
        } else {
          if (run >= 5) penalty += 3 + (run - 5);
          run = 1;
        }
      }
      if (run >= 5) penalty += 3 + (run - 5);
    }
    for (let c = 0; c < size; c++) {
      let run = 1;
      for (let r = 1; r < size; r++) {
        if (testModules[r][c] === testModules[r - 1][c]) {
          run++;
        } else {
          if (run >= 5) penalty += 3 + (run - 5);
          run = 1;
        }
      }
      if (run >= 5) penalty += 3 + (run - 5);
    }

    // Penalty 2: 2x2 blocks
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const color = testModules[r][c];
        if (
          testModules[r + 1][c] === color &&
          testModules[r][c + 1] === color &&
          testModules[r + 1][c + 1] === color
        ) {
          penalty += 3;
        }
      }
    }

    if (penalty < lowestPenalty) {
      lowestPenalty = penalty;
      bestModules = testModules;
    }
  }

  return bestModules;
}

/**
 * Converts a QR boolean matrix into SVG path data.
 */
export function getQrPathData(matrix: boolean[][], margin: number = 2): string {
  const matrixSize = matrix.length;
  let pathData = "";
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = c + margin;
        const y = r + margin;
        pathData += `M${x},${y}h1v1h-1z `;
      }
    }
  }
  return pathData.trim();
}

/**
 * Generates an SVG string representation of the QR code for a given string or URL.
 *
 * @param text The string or URL to encode.
 * @param size The rendered width and height in pixels (default: 200).
 * @returns SVG XML string.
 */
export function generateQrSvg(text: string, size: number = 200): string {
  if (!text || typeof text !== "string") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"></svg>`;
  }

  const matrix = generateQrMatrix(text);
  const matrixSize = matrix.length;
  const margin = 2; // modules quiet zone
  const totalGridSize = matrixSize + margin * 2;
  const pathData = getQrPathData(matrix, margin);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalGridSize} ${totalGridSize}" width="${size}" height="${size}" fill="currentColor" shape-rendering="crispEdges"><path d="${pathData}" /></svg>`;
}

