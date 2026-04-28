import Foundation
import Vision
import AppKit
import PDFKit

let arguments = CommandLine.arguments
if arguments.count < 2 {
    print("Usage: ocr-tool <file-path>")
    exit(1)
}

let filePath = arguments[1]
let fileUrl = URL(fileURLWithPath: filePath)
let ext = fileUrl.pathExtension.lowercased()

func performOCR(on cgImage: CGImage) {
    let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    let request = VNRecognizeTextRequest { (request, error) in
        if let error = error {
            return
        }
        guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
        let recognizedText = observations.compactMap { observation in
            observation.topCandidates(1).first?.string
        }.joined(separator: " ")
        print(recognizedText)
    }
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    try? requestHandler.perform([request])
}

if ext == "pdf" {
    guard let pdfDocument = PDFDocument(url: fileUrl) else {
        print("Error: Could not load PDF")
        exit(1)
    }
    
    for i in 0..<pdfDocument.pageCount {
        autoreleasepool {
            guard let page = pdfDocument.page(at: i) else { return }
            let pageRect = page.bounds(for: .mediaBox)
            let scale: CGFloat = 2.0
            let size = CGSize(width: pageRect.width * scale, height: pageRect.height * scale)
            
            let image = NSImage(size: size)
            image.lockFocus()
            if let context = NSGraphicsContext.current?.cgContext {
                context.scaleBy(x: scale, y: scale)
                page.draw(with: .mediaBox, to: context)
            }
            image.unlockFocus()
            
            if let tiffData = image.tiffRepresentation,
               let imageSource = CGImageSourceCreateWithData(tiffData as CFData, nil),
               let cgImage = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) {
                print("--- PAGE \(i + 1) ---")
                performOCR(on: cgImage)
                // Flush stdout to keep Node script updated
                fflush(stdout)
            }
        }
    }
} else {
    guard let image = NSImage(contentsOf: fileUrl),
          let tiffData = image.tiffRepresentation,
          let imageSource = CGImageSourceCreateWithData(tiffData as CFData, nil),
          let cgImage = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) else {
        exit(1)
    }
    performOCR(on: cgImage)
}
