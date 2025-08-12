# tinyTokenizer()

A tiny, character-level tokenizer in js.

## Features

- Deterministic special tokens: <PAD>=0, <UNK>=1, <CLS>=2, <SEP>=3
- Simple vocab builder: `buildVocab(text)` adds all characters present in `text`
- encode/decode are straightforward and predictable

## Requirements

- Node.js

## Usage

### 1) Build vocab from a corpus

Create `corpus.txt`, then run:

```bash
node tokenizer.js train corpus.txt vocab.json
```

Example output:

```
Trained. Vocab size: 128. Saved -> vocab.json
```

### 2) Encode text (using saved vocab)

```bash
node tokenizer.js encode vocab.json "hello world"
```

Example output (IDs are illustrative):

```
12,5,7,7,11,1,24,11,14,7,3
```

### 3) Decode ids

```bash
node tokenizer.js decode vocab.json "12,5,7,7,11"
```

Example output:

```
hello
```
