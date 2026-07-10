<?php
namespace App\Services;

class ResumeParserService
{
    public function extractText(string $filePath, string $fileType): string
    {
        $abs = storage_path("app/public/{$filePath}");
        if (!file_exists($abs)) throw new \RuntimeException("File not found: {$abs}");
        $text = match(strtolower($fileType)) {
            "pdf"        => $this->fromPdf($abs),
            "docx","doc" => $this->fromDocx($abs),
            default      => throw new \RuntimeException("Unsupported: {$fileType}"),
        };
        return $this->clean($text);
    }

    private function fromPdf(string $path): string
    {
        // 1. Try smalot/pdfparser — pure PHP, works on all platforms including Windows
        if (class_exists(\Smalot\PdfParser\Parser::class)) {
            try {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf    = $parser->parseFile($path);
                $text   = $pdf->getText();
                if (!empty(trim($text))) return $text;
            } catch (\Throwable $e) {
                // fall through to next method
            }
        }

        // 2. Try pdftotext (Linux/Mac/Windows with poppler installed)
        if ($this->has('pdftotext')) {
            $out = shell_exec('pdftotext ' . escapeshellarg($path) . ' - 2>/dev/null');
            if (!empty($out)) return $out;
        }

        // 3. Try Python (pdfplumber / PyPDF2)
        $python = $this->has('python3') ? 'python3' : ($this->has('python') ? 'python' : null);
        if ($python) {
            $script = escapeshellarg("
try:
    import pdfplumber
    with pdfplumber.open('" . addslashes($path) . "') as pdf:
        print(' '.join(p.extract_text() or '' for p in pdf.pages))
except:
    try:
        import PyPDF2
        with open('" . addslashes($path) . "', 'rb') as f:
            r = PyPDF2.PdfReader(f)
            print(' '.join(p.extract_text() or '' for p in r.pages))
    except: pass
");
            $out = shell_exec("{$python} -c {$script} 2>/dev/null");
            if (!empty(trim($out))) return $out;
        }

        // 4. Raw regex fallback for older uncompressed PDFs
        return $this->rawPdf($path);
    }

    private function rawPdf(string $path): string
    {
        $c    = file_get_contents($path);
        $text = '';
        if (preg_match_all('/BT(.*?)ET/s', $c, $m)) {
            foreach ($m[1] as $block) {
                if (preg_match_all('/\(([^)]+)\)/', $block, $s)) {
                    foreach ($s[1] as $str) $text .= ' ' . preg_replace('/[^\x20-\x7E]/', ' ', stripcslashes($str));
                }
            }
        }
        return $text ?: 'Unable to extract text from PDF.';
    }

    private function fromDocx(string $path): string
    {
        if (!class_exists("ZipArchive")) throw new \RuntimeException("ZipArchive required.");
        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) throw new \RuntimeException("Cannot open DOCX.");
        $xml = $zip->getFromName("word/document.xml");
        $zip->close();
        if (!$xml) throw new \RuntimeException("Cannot read DOCX contents.");
        $xml = str_replace("</w:p>", "\n", $xml);
        return strip_tags($xml);
    }

    private function clean(string $t): string
    {
        $t = str_replace("\x00", "", $t);
        $t = preg_replace("/\r\n|\r/", "\n", $t);
        $t = preg_replace("/[ \t]+/", " ", $t);
        $t = preg_replace("/\n{3,}/", "\n\n", $t);
        return trim($t);
    }

    private function has(string $cmd): bool
    {
        $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        if ($isWindows) {
            $out = shell_exec('where ' . escapeshellarg($cmd) . ' 2>nul');
        } else {
            $out = shell_exec('which ' . escapeshellarg($cmd) . ' 2>/dev/null');
        }
        return !empty(trim($out ?? ''));
    }


    public function extractBasicSections(string $raw): array
    {
        return [
            "skills"      => $this->section($raw, ["skills","technical skills","core competencies","technologies"]),
            "education"   => $this->section($raw, ["education","qualifications","academic"]),
            "experience"  => $this->section($raw, ["experience","work experience","employment"]),
            "projects"    => $this->section($raw, ["projects","portfolio"]),
        ];
    }

    private function section(string $text, array $headings): ?string
    {
        foreach ($headings as $h) {
            $pat = "/(?:^|\n)\s*" . preg_quote($h, "/") . "\s*:?\s*\n(.*?)(?=\n\s*[A-Z][A-Za-z ]{2,}\s*:?\s*\n|\z)/is";
            if (preg_match($pat, $text, $m)) {
                $ex = trim($m[1]);
                if (strlen($ex) > 10) return substr($ex, 0, 2000);
            }
        }
        return null;
    }
}
