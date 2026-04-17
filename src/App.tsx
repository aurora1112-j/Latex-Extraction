import { useState, useRef, useEffect, DragEvent, ChangeEvent, ClipboardEvent } from 'react';
import { UploadCloud, Check, Copy, RefreshCw, Layers, FileImage } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-latex';
import { extractLatex } from './lib/gemini';
import { cn } from './lib/utils';

// Helper component to render KaTeX safely
function KatexDisplay({ expression, inline = false }: { expression: string, inline?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && expression) {
      try {
        katex.render(expression, containerRef.current, {
          displayMode: !inline,
          throwOnError: false,
          output: 'html',
        });
      } catch (err) {
        // Katex handles throwOnError: false by rendering the error string
      }
    } else if (containerRef.current && !expression) {
      containerRef.current.innerHTML = '';
    }
  }, [expression, inline]);

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "flex items-center justify-center font-serif",
        inline ? "" : "w-full text-lg md:text-2xl min-h-[120px]"
      )}
    />
  );
}

const TEMPLATES = [
  { id: 'quad', label: 'Quadratic Formula', code: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { id: 'int', label: 'Definite Integral', code: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)' },
  { id: 'lim', label: 'Limit to Infinity', code: '\\lim_{x \\to \\infty} f(x)' },
  { id: 'mat', label: '2x2 Matrix', code: 'A = \\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}' },
  { id: 'sum', label: 'Summation Series', code: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' }
];

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [latexCode, setLatexCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSynthesize = async () => {
    if (!file && !inputText.trim()) {
      setError('Please provide an image or text input.');
      return;
    }
    
    setError(null);
    setLatexCode('');
    setIsProcessing(true);

    try {
      const extracted = await extractLatex(file, inputText);
      setLatexCode(extracted);
    } catch (err: any) {
      setError(err.message || 'Failed to extract LaTeX. API key might be missing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      const pastedFile = e.clipboardData.files[0];
      if (pastedFile.type.startsWith('image/')) {
        handleFile(pastedFile);
      }
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#000000] font-sans overflow-hidden">
        {/* Header - Editorial Style */}
        <header className="px-[60px] py-[40px] flex justify-between items-end border-b-[2px] border-[#000000] shrink-0">
            <div className="font-serif text-[84px] font-[900] leading-[0.8] tracking-[-4px] uppercase">Lxtract</div>
            <div className="text-right text-[12px] tracking-[2px] uppercase font-[600]">
                Visual Intelligence / Formula Synthesis<br />
                Edition 2024.05.v1
            </div>
        </header>

        <main className="flex-1 lg:grid lg:grid-cols-[420px_1fr] flex flex-col overflow-hidden">
            {/* Left Section: Source */}
            <section className="lg:border-r border-b lg:border-b-0 border-[#000000] py-[40px] px-[60px] flex flex-col shrink-0 lg:overflow-y-auto bg-[#FFFFFF]">
                <div className="font-serif italic text-[24px] mb-[30px] flex items-center">
                    <span className="font-sans not-italic text-[10px] font-bold border border-[#000000] px-[5px] py-[2px] mr-[10px]">01</span>
                    Input Source
                </div>

                <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onPaste={handlePaste}
                    className={cn(
                        "flex-1 border border-[#000000] bg-[#F9F9F9] flex flex-col relative min-h-[350px] overflow-hidden",
                        isDragging ? "bg-black/5" : ""
                    )}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={onFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type text, paste screenshot (Cmd/Ctrl+V), or drop image here..."
                        className={cn(
                            "absolute inset-0 w-full h-full bg-transparent resize-none outline-none p-6 font-sans text-[16px] leading-[1.6] placeholder:text-[#888888] placeholder:font-serif placeholder:italic z-10 transition-all",
                            file ? "w-[50%] border-r border-[#000000]/20 hidden sm:block" : ""
                        )}
                        spellCheck="false"
                    />

                    <AnimatePresence>
                        {file && previewUrl && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute right-0 top-0 bottom-0 w-full sm:w-[50%] bg-[#FFFFFF] flex flex-col z-20"
                            >
                                <div className="flex justify-between items-center p-4 border-b border-[#000000]/20 bg-[#F9F9F9] shrink-0">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#000000] flex items-center gap-2"><FileImage className="w-3 h-3"/> Image</span>
                                    <button onClick={() => { setFile(null); setPreviewUrl(null); }} className="text-[#888888] hover:text-[#000000] text-[10px] uppercase font-bold transition-colors">✕ Remove</button>
                                </div>
                                <div className="flex-1 p-4 flex items-center justify-center overflow-hidden bg-[#FFFFFF]">
                                    <img src={previewUrl} alt="Equation preview" className="max-w-full max-h-full object-contain" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!file && !inputText && (
                         <div className="absolute inset-x-0 bottom-10 flex flex-col items-center justify-center pointer-events-none z-0 opacity-20">
                             <UploadCloud className="w-12 h-12 mb-3" />
                             <span className="font-serif text-[24px]">Paste or Drop</span>
                         </div>
                    )}
                </div>

                <div className="mt-[20px] flex justify-between items-center shrink-0">
                    <button onClick={() => fileInputRef.current?.click()} className="text-[11px] uppercase tracking-[1px] font-bold border-b border-[#000000] pb-1 hover:text-[#888888] hover:border-[#888888] transition-colors">
                        Browse Files
                    </button>
                    {(file || inputText) && (
                        <button onClick={() => { setFile(null); setPreviewUrl(null); setInputText(''); }} className="text-[11px] uppercase tracking-[1px] font-bold text-[#888888] hover:text-[#000000] transition-colors">
                            Clear All
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mt-[20px] p-4 border border-[#000000] bg-white text-black text-sm shrink-0">
                        <span className="font-bold uppercase tracking-wider text-[11px] block mb-1">Error Processing</span>
                        {error}
                    </div>
                )}
            </section>

            {/* Right Section: Editor */}
            <section className="py-[40px] px-[60px] flex flex-col lg:overflow-y-auto bg-[#FFFFFF]">
                <div className="flex justify-between items-baseline mb-[30px] shrink-0">
                    <div className="font-serif italic text-[24px] flex items-center">
                        <span className="font-sans not-italic text-[10px] font-bold border border-[#000000] px-[5px] py-[2px] mr-[10px]">02</span>
                        Synthesis & Correction
                    </div>
                    <div className="text-[11px] opacity-60 uppercase tracking-[1px] hidden sm:block">
                        {isProcessing ? "Analyzing Image..." : (latexCode ? "98.4% Confidence Score" : "Awaiting Input")}
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                    {/* Visual Preview of LaTeX */}
                    <div className="bg-[#FFFFFF] flex flex-col min-h-[150px] shrink-0 pb-6 relative">
                         {isProcessing ? (
                             <div className="flex flex-col items-center justify-center h-full gap-3 text-[#888888] flex-1 min-h-[150px]">
                               <RefreshCw className="w-5 h-5 animate-spin" />
                               <span className="font-serif text-[18px]">Synthesizing...</span>
                             </div>
                         ) : latexCode ? (
                             <div className="pt-4 pb-2">
                               <KatexDisplay expression={latexCode} />
                             </div>
                         ) : (
                             <div className="flex items-center justify-center h-full text-black/20 font-serif italic text-[24px] flex-1 min-h-[150px]">
                               Rendered equation preview
                             </div>
                         )}
                    </div>

                    {/* Source Code */}
                    <div className="flex flex-col border border-[#000000] bg-[#F9F9F9] focus-within:ring-[1px] focus-within:ring-black transition-shadow flex-1 min-h-[250px]">
                        <div className="flex-1 relative overflow-auto">
                            <Editor
                                value={latexCode}
                                onValueChange={setLatexCode}
                                highlight={code => Prism.highlight(code, Prism.languages.latex || Prism.languages.clike, 'latex')}
                                padding={30}
                                disabled={isProcessing}
                                placeholder={isProcessing ? "Extracting..." : "LaTeX source code will appear here..."}
                                className="font-mono text-[18px] leading-[1.6] min-h-full w-full outline-none"
                                textareaClassName="outline-none placeholder:font-serif placeholder:italic placeholder:text-[#888888] focus:outline-none focus:ring-0"
                                spellCheck={false}
                            />
                        </div>
                        {/* Template Library */}
                        <div className="border-t border-[#000000]/10 p-4 flex flex-wrap gap-2 items-center bg-white min-h-[60px] shrink-0">
                            <span className="font-serif italic text-[14px] text-[#888888] mr-2">Templates:</span>
                            {TEMPLATES.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setLatexCode(t.code)}
                                    className="px-3 py-1.5 border border-[#DDDDDD] font-sans text-[12px] lowercase tracking-wide bg-white hover:border-[#000000] hover:bg-[#000000] hover:text-[#FFFFFF] transition-colors"
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-[30px] flex gap-[20px] shrink-0 flex-wrap">
                    <button 
                        onClick={handleSynthesize}
                        disabled={isProcessing || (!file && !inputText.trim())}
                        className={cn(
                            "py-[15px] px-[30px] font-serif flex items-center justify-center gap-2 text-[18px] font-bold cursor-pointer border transition-colors",
                            isProcessing || (!file && !inputText.trim()) ? "border-[#ddd] text-[#888888] cursor-not-allowed bg-transparent" : "border-[#000000] bg-transparent text-[#000000] hover:bg-[#000000] hover:text-white"
                        )}
                    >
                        {isProcessing ? "Synthesizing..." : "Synthesize Output"}
                    </button>
                    <button 
                        onClick={copyToClipboard}
                        disabled={!latexCode || isProcessing}
                        className={cn(
                            "py-[15px] px-[30px] font-serif flex items-center justify-center gap-2 text-[18px] font-bold cursor-pointer border transition-colors",
                            !latexCode || isProcessing ? "border-[#ddd] text-[#888888] cursor-not-allowed bg-transparent" : "border-[#000000] bg-[#000000] text-[#FFFFFF]"
                        )}
                    >
                        {copied ? 'Copied' : 'Copy to Clipboard'}
                    </button>
                </div>
            </section>
        </main>

        {/* Footer Decoration */}
        <footer className="px-[60px] py-[20px] text-[10px] text-[#888888] flex flex-col md:flex-row gap-4 justify-between items-center border-t border-[#EEE] shrink-0 bg-[#FFFFFF]">
            <div className="uppercase">&copy; 2024 LXTRACT Typographic Labs</div>
            <div className="font-serif text-[14px] font-bold text-[#000000]">LX / 042</div>
            <div className="">Minimalist Mathematical OCR Engine</div>
        </footer>
    </div>
  );
}

