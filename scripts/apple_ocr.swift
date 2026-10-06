import Foundation
import PDFKit
import Vision
import AppKit

func extractTextFromPDF(at path: String) {
    let url = URL(fileURLWithPath: path)
    guard let pdfDocument = PDFDocument(url: url) else {
        print("❌ Could not load PDF at \(path)")
        exit(1)
    }

    let pageCount = pdfDocument.pageCount
    print("📄 Found \(pageCount) pages. Starting Apple Vision OCR...")
    
    var fullText = ""

    for i in 0..<pageCount {
        autoreleasepool {
            guard let page = pdfDocument.page(at: i) else { return }
            let pageRect = page.bounds(for: .mediaBox)
            
            // Create a bitmap image representation at 2x resolution for better OCR accuracy
            let rep = NSBitmapImageRep(
                bitmapDataPlanes: nil,
                pixelsWide: Int(pageRect.width * 2),
                pixelsHigh: Int(pageRect.height * 2),
                bitsPerSample: 8,
                samplesPerPixel: 4,
                hasAlpha: true,
                isPlanar: false,
                colorSpaceName: .calibratedRGB,
                bytesPerRow: 0,
                bitsPerPixel: 0
            )
            
            guard let representation = rep else { return }
            
            NSGraphicsContext.saveGraphicsState()
            guard let context = NSGraphicsContext(bitmapImageRep: representation) else { return }
            NSGraphicsContext.current = context
            
            // Fill white background
            NSColor.white.set()
            context.cgContext.fill(CGRect(x: 0, y: 0, width: pageRect.width * 2, height: pageRect.height * 2))
            
            // Scale context by 2x for higher res render
            context.cgContext.scaleBy(x: 2.0, y: 2.0)
            
            // Draw PDF page
            page.draw(with: .mediaBox, to: context.cgContext)
            NSGraphicsContext.restoreGraphicsState()
            
            guard let cgImage = representation.cgImage else { return }
            
            let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
            let request = VNRecognizeTextRequest { (request, error) in
                guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
                
                var pageText = ""
                for observation in observations {
                    if let topCandidate = observation.topCandidates(1).first {
                        pageText += topCandidate.string + "\n"
                    }
                }
                fullText += "--- PAGE \(i + 1) ---\n" + pageText + "\n\n"
            }
            
            // Configure for highest accuracy
            request.recognitionLevel = .accurate
            request.usesLanguageCorrection = true
            
            do {
                try requestHandler.perform([request])
                print("✅ Processed page \(i + 1)/\(pageCount)")
            } catch {
                print("❌ Error processing page \(i + 1): \(error)")
            }
        }
    }
    
    let outputPath = (path as NSString).deletingPathExtension + "_ocr_output.txt"
    do {
        try fullText.write(toFile: outputPath, atomically: true, encoding: .utf8)
        print("\n🎉 Success! OCR text saved to: \(outputPath)")
    } catch {
        print("❌ Failed to save output to \(outputPath): \(error)")
    }
}

if CommandLine.arguments.count < 2 {
    print("Usage: swift apple_ocr.swift <path_to_pdf>")
    exit(1)
}

let pdfPath = CommandLine.arguments[1]
extractTextFromPDF(at: pdfPath)
