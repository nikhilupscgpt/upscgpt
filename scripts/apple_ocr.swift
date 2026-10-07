import Foundation
import PDFKit
import Vision
import AppKit

func extractTextFromPDF(at path: String, twoColumns: Bool = true) {
    let url = URL(fileURLWithPath: path)
    guard let pdfDocument = PDFDocument(url: url) else {
        print("❌ Could not load PDF at \(path)")
        exit(1)
    }

    let pageCount = pdfDocument.pageCount
    print("📄 Found \(pageCount) pages. Starting Apple Vision OCR (Mode: \(twoColumns ? "2-Column Split" : "Standard Single Column"))...")
    
    var fullText = ""

    for i in 0..<pageCount {
        autoreleasepool {
            guard let page = pdfDocument.page(at: i) else { return }
            let pageRect = page.bounds(for: .mediaBox)
            
            // Create a bitmap image representation at 2x resolution for high accuracy
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

                if twoColumns {
                    // Split into left and right columns using 0.48 horizontal boundary
                    let leftColumn = observations.filter { $0.boundingBox.origin.x < 0.48 }
                        .sorted { $0.boundingBox.origin.y > $1.boundingBox.origin.y }
                    
                    let rightColumn = observations.filter { $0.boundingBox.origin.x >= 0.48 }
                        .sorted { $0.boundingBox.origin.y > $1.boundingBox.origin.y }
                    
                    // Column 1 (Left)
                    for obs in leftColumn {
                        if let top = obs.topCandidates(1).first {
                            pageText += top.string + "\n"
                        }
                    }
                    
                    // Column 2 (Right)
                    for obs in rightColumn {
                        if let top = obs.topCandidates(1).first {
                            pageText += top.string + "\n"
                        }
                    }
                } else {
                    for obs in observations {
                        if let top = obs.topCandidates(1).first {
                            pageText += top.string + "\n"
                        }
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

let args = CommandLine.arguments
if args.count < 2 {
    print("Usage: swift scripts/apple_ocr.swift <path_to_pdf> [--single-column]")
    exit(1)
}

let pdfPath = args[1]
let isSingleColumn = args.contains("--single-column")
extractTextFromPDF(at: pdfPath, twoColumns: !isSingleColumn)
