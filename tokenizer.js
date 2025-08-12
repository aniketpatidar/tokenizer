const fs = require('fs');

class Tokenizer {
  constructor() {
    this.specialOrder = ['<PAD>', '<UNK>', '<CLS>', '<SEP>'];
    this.vocab = {};
    this.reverseVocab = {};
    this.nextId = 0;

    for (const tok of this.specialOrder) {
      this.vocab[tok] = this.nextId;
      this.reverseVocab[this.nextId] = tok;
      this.nextId++;
    }
  }

  buildVocab(text) {
    if (typeof text !== 'string') return;
    for (const ch of Array.from(text)) {
      if (!(ch in this.vocab)) {
        this.vocab[ch] = this.nextId;
        this.reverseVocab[this.nextId] = ch;
        this.nextId++;
      }
    }
    return this.nextId;
  }

  encode(text, opts = { addNew: false }) {
    if (typeof text !== 'string') return [];
    const out = [];
    const unkId = this.vocab['<UNK>'];
    for (const ch of Array.from(text)) {
      if (ch in this.vocab) {
        out.push(this.vocab[ch]);
      } else if (opts.addNew) {
        this.vocab[ch] = this.nextId;
        this.reverseVocab[this.nextId] = ch;
        out.push(this.nextId);
        this.nextId++;
      } else {
        out.push(unkId);
      }
    }
    return out;
  }

  decode(ids) {
    if (!Array.isArray(ids)) return '';
    return ids
      .map(i => {
        const t = this.reverseVocab[Number(i)];
        return t === undefined ? '<UNK>' : t;
      })
      .join('');
  }

  save(path) {
    const payload = {
      vocab: this.vocab,
      nextId: this.nextId
    };
    fs.writeFileSync(path, JSON.stringify(payload, null, 2), 'utf8');
  }

  load(path) {
    const raw = fs.readFileSync(path, 'utf8');
    const data = JSON.parse(raw);
    this.vocab = data.vocab || {};
    this.nextId = data.nextId || Object.keys(this.vocab).length;
    this.reverseVocab = {};
    for (const [tok, id] of Object.entries(this.vocab)) {
      this.reverseVocab[id] = tok;
    }
  }
}

if (require.main === module) {
  const [cmd, a, b, c] = process.argv.slice(2);
  const tk = new Tokenizer();

  if (cmd === 'train') {
    if (!a) return console.log('Usage: node tokenizer.js train <corpus.txt> [out.json]');
    const text = fs.readFileSync(a, 'utf8');
    const size = tk.buildVocab(text);
    const out = b || 'vocab.json';
    tk.save(out);
    console.log(`Trained. Vocab size: ${size}. Saved -> ${out}`);
    return;
  }

  if (cmd === 'encode') {
    if (!a || !b) return console.log('Usage: node tokenizer.js encode <vocab.json> "text" [addNew]');
    tk.load(a);
    const addNew = (b === 'true' || c === 'addNew');
    const text = process.argv[4] || process.argv[3] || '';
    const ids = tk.encode(text, { addNew });
    console.log(ids.join(','));
    return;
  }

  if (cmd === 'decode') {
    if (!a || !b) return console.log('Usage: node tokenizer.js decode <vocab.json> \"id1,id2,...\"');
    tk.load(a);
    const ids = b.split(',').map(x => Number(x));
    console.log(tk.decode(ids));
    return;
  }

  console.log(`SimpleCharTokenizer CLI
Commands:
  train <corpus.txt> [out.json]        Build vocab from corpus and save vocab
  encode <vocab.json> "text" [addNew]  Encode text (optionally add unseen chars)
  decode <vocab.json> "id,id,..."      Decode ids to text
`);
}

module.exports = Tokenizer;
