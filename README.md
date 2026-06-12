# SAFE-SO Annotator Tool

**SAFE-SO (Simplified Analytic Framework for Evaluation — Syntactic Order)** is a lightweight, offline-first React application designed to assess Neural Machine Translation (NMT) quality, with a specific focus on linguistic nuances and syntactic ordering in morphologically rich languages like Nepali.

This tool provides a distraction-free, localized interface for human annotators to evaluate translation outputs (e.g., from fine-tuned IndicTrans2 or NLLB-200 models) independently, preventing side-by-side bias. It runs entirely locally on your machine—no dataset ever leaves your computer.

---

## 🚀 How to Download and Run

### Prerequisites
You must have [Node.js](https://nodejs.org/) installed on your computer.

### Installation Steps

**Download the tool:**
   Clone this repository via your terminal, or click the green **Code** button at the top of this page and select **Download ZIP** (extract it after downloading).
   ```bash
   git clone [https://github.com/anudeep-sh-nlp/SAFE-SO-EVALUATION-TOOL.git](https://github.com/anudeep-sh-nlp/SAFE-SO-EVALUATION-TOOL.git)
   cd SAFE-SO-EVALUATION-TOOL

📊 The SAFE-SO Evaluation Framework
Each translation output is evaluated independently. Annotators must view one output at a time to ensure unbiased judging. The following pivot configurations are evaluated independently: Direct, Ja, Ko, Tr, Fr, Hi.

D1 · Adequacy
How much meaning from the source sentence is preserved in the translation?

5: Complete

4: Full — minor gaps

3: Most

2: Little

1: None

D2 · Fluency
Is the translation grammatical and natural-sounding in Nepali, regardless of the source sentence?

5: Native-like

4: Good

3: Acceptable

2: Disfluent

1: Unreadable

D3 · Structural Naturalness
Does the sentence follow natural Nepali word order (typically SOV), or does it exhibit interference from English syntax?

5: Native SOV

4: Mostly SOV

3: Mixed

2: Mostly SVO

1: English order

🚩 Structural Error Flags (Check all that apply)
[ ] Verb non-final

[ ] Object displaced

[ ] Clause inversion

[ ] Postposition error

D4 · Reference Comprehension (Gold Reference Only)
How naturally readable and comprehensible is the reference Nepali sentence?

5: Effortless

4: Clear

3: Understandable

2: Requires effort

1: Unclear

📝 Mandatory Remarks
A remark is required whenever D1 ≤ 2, and/or D3 ≤ 2.

Annotators must briefly identify the specific problem observed.
Examples: "Verb placed after object", "Postposition dropped", "Clause reversed", "English SVO structure retained."

🛠 Tech Stack
Frontend: React 18 & Vite

Styling: TailwindCSS

Storage: Dexie.js (Local IndexedDB Storage for offline session saving)

Data Processing: SheetJS (Excel/CSV parsing and export)
