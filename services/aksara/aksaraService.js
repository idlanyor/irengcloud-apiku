/**
 * Native Aksara Jawa Transliteration Service
 * Converts Latin text to Javanese Script (Aksara Jawa) and vice versa.
 * No puppeteer required! Runs in-memory with sub-millisecond latency.
 */
export function createAksaraService({ logger }) {
  // Aksara Nglegena (20 Dasar)
  const NGLEGENA_MAP = {
    'ha': 'ꦲ', 'na': 'ꦤ', 'ca': 'ꦕ', 'ra': 'ꦫ', 'ka': 'ꦏ',
    'da': 'ꦢ', 'ta': 'ꦠ', 'sa': 'ꦱ', 'wa': 'ꦮ', 'la': 'ꦭ',
    'pa': 'ꦯ', 'dha': 'ꦞ', 'ja': 'ꦗ', 'ya': 'ꦪ', 'nya': 'ꦱꦾ',
    'ma': 'ꦩ', 'ga': 'ꦒ', 'ba': 'ꦧ', 'tha': 'ꦛ', 'nga': 'ꦔ',
    'a': 'ꦲ', 'i': 'ꦲꦶ', 'u': 'ꦲꦸ', 'e': 'ꦲꦺ', 'o': 'ꦲꦺꦴ'
  };

  // Aksara Murda (Honorific/Capital)
  const MURDA_MAP = {
    'Na': 'ꦟ', 'Ka': 'ꦑ', 'Ta': 'ꦡ', 'Pa': 'ꦰ',
    'Ga': 'ꦓ', 'Ba': 'ꦨ', 'Sa': 'ꦯ', 'Nya': 'ꦘ'
  };

  // Aksara Swara
  const SWARA_MAP = {
    'A': 'ꦄ', 'I': 'ꦆ', 'U': 'ꦈ', 'E': 'ꦌ', 'O': 'ꦎ'
  };

  // Sandhangan Swara
  const VOWEL_SANDHANGAN = {
    'i': 'ꦶ',
    'u': 'ꦸ',
    'e': 'ꦺ',
    'o': 'ꦺꦴ',
    'è': 'ꦺ',
    'é': 'ꦺ',
    'ê': 'ꦼ'
  };

  // Sandhangan Panyigeging Wanda (Final consonants)
  const FINAL_CONSONANTS = {
    'h': 'ꦃ',
    'r': 'ꦂ',
    'ng': 'ꦁ'
  };

  // Javanese Numbers
  const NUMBERS = {
    '0': '꧐', '1': '꧑', '2': '꧒', '3': '꧓', '4': '꧔',
    '5': '꧕', '6': '꧖', '7': '꧗', '8': '꧘', '9': '꧙'
  };

  // Reverse mapping for Jawa -> Latin
  const JAWA_TO_LATIN_MAP = {
    'ꦲ': 'ha', 'ꦤ': 'na', 'ꦕ': 'ca', 'ꦫ': 'ra', 'ꦏ': 'ka',
    'ꦢ': 'da', 'ꦠ': 'ta', 'ꦱ': 'sa', 'ꦮ': 'wa', 'ꦭ': 'la',
    'ꦯ': 'pa', 'ꦞ': 'dha', 'ꦗ': 'ja', 'ꦪ': 'ya', 'ꦩ': 'ma',
    'ꦒ': 'ga', 'ꦧ': 'ba', 'ꦛ': 'tha', 'ꦔ': 'nga',
    'ꦄ': 'A', 'ꦆ': 'I', 'ꦈ': 'U', 'ꦌ': 'E', 'ꦎ': 'O',
    'ꦶ': 'i', 'ꦸ': 'u', 'ꦺ': 'e', 'ꦺꦴ': 'o', 'ꦼ': 'e',
    'ꦃ': 'h', 'ꦂ': 'r', 'ꦁ': 'ng', '꧀': '',
    '꧐': '0', '꧑': '1', '꧒': '2', '꧓': '3', '꧔': '4',
    '꧕': '5', '꧖': '6', '꧗': '7', '꧘': '8', '꧙': '9'
  };

  /**
   * Transliterate Latin text to Aksara Jawa
   * @param {string} text
   * @param {Object} [options]
   * @param {boolean} [options.murda=false] - Use Aksara Murda for capitals
   * @param {boolean} [options.space=true] - Preserve spaces
   */
  function latinToJawa(text, options = {}) {
    if (!text) return '';
    const useMurda = options.murda ?? false;
    const useSpace = options.space ?? true;

    let input = String(text);
    let output = '';
    let i = 0;

    while (i < input.length) {
      const char = input[i];

      // Handle spaces & punctuation
      if (/\s/.test(char)) {
        if (useSpace) output += ' ';
        i++;
        continue;
      }

      // Handle numbers
      if (/[0-9]/.test(char)) {
        output += (NUMBERS[char] || char);
        i++;
        continue;
      }

      // Check 3-letter clusters (e.g. 'dha', 'tha', 'nga', 'nya')
      const threeChar = input.substr(i, 3).toLowerCase();
      const twoChar = input.substr(i, 2).toLowerCase();

      if (threeChar === 'dha') { output += 'ꦞ'; i += 3; continue; }
      if (threeChar === 'tha') { output += 'ꦛ'; i += 3; continue; }
      if (threeChar === 'nga') { output += 'ꦔ'; i += 3; continue; }
      if (threeChar === 'nya') { output += 'ꦚ'; i += 3; continue; }

      if (twoChar === 'ha') { output += 'ꦲ'; i += 2; continue; }
      if (twoChar === 'na') { output += 'ꦤ'; i += 2; continue; }
      if (twoChar === 'ca') { output += 'ꦕ'; i += 2; continue; }
      if (twoChar === 'ra') { output += 'ꦫ'; i += 2; continue; }
      if (twoChar === 'ka') { output += 'ꦏ'; i += 2; continue; }
      if (twoChar === 'da') { output += 'ꦢ'; i += 2; continue; }
      if (twoChar === 'ta') { output += 'ꦠ'; i += 2; continue; }
      if (twoChar === 'sa') { output += 'ꦱ'; i += 2; continue; }
      if (twoChar === 'wa') { output += 'ꦮ'; i += 2; continue; }
      if (twoChar === 'la') { output += 'ꦭ'; i += 2; continue; }
      if (twoChar === 'pa') { output += 'ꦯ'; i += 2; continue; }
      if (twoChar === 'ja') { output += 'ꦗ'; i += 2; continue; }
      if (twoChar === 'ya') { output += 'ꦪ'; i += 2; continue; }
      if (twoChar === 'ma') { output += 'ꦩ'; i += 2; continue; }
      if (twoChar === 'ga') { output += 'ꦒ'; i += 2; continue; }
      if (twoChar === 'ba') { output += 'ꦧ'; i += 2; continue; }

      // Check Murda capital letters
      if (useMurda && CHAR_IS_UPPER(char) && MURDA_MAP[char]) {
        output += MURDA_MAP[char];
        i++;
        continue;
      }

      // Check Swara standalone vowels
      if (SWARA_MAP[char]) {
        output += SWARA_MAP[char];
        i++;
        continue;
      }

      // Fallback single character
      const lower = char.toLowerCase();
      if (NGLEGENA_MAP[lower]) {
        output += NGLEGENA_MAP[lower];
      } else if (VOWEL_SANDHANGAN[lower]) {
        output += VOWEL_SANDHANGAN[lower];
      } else {
        output += char;
      }
      i++;
    }

    return output;
  }

  function CHAR_IS_UPPER(c) {
    return c >= 'A' && c <= 'Z';
  }

  /**
   * Transliterate Aksara Jawa text to Latin
   * @param {string} text
   */
  function jawaToLatin(text) {
    if (!text) return '';
    let output = '';

    for (const char of String(text)) {
      if (JAWA_TO_LATIN_MAP[char]) {
        output += JAWA_TO_LATIN_MAP[char];
      } else {
        output += char;
      }
    }

    return output;
  }

  return {
    latinToJawa,
    jawaToLatin
  };
}
