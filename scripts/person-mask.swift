// Writes a person-segmentation mask (white = person) for each photo with
// Apple's Vision framework, so promo art can drop the background.
//   swift scripts/person-mask.swift <out-dir> photo1 photo2 ...
import CoreImage
import Foundation
import ImageIO
import UniformTypeIdentifiers
import Vision

let args = CommandLine.arguments.dropFirst()
guard let outDir = args.first else {
  FileHandle.standardError.write("usage: person-mask.swift <out-dir> <photos...>\n".data(using: .utf8)!)
  exit(1)
}
try FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)
let context = CIContext()

for path in args.dropFirst() {
  guard
    let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
    let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
  else {
    FileHandle.standardError.write("Could not read \(path)\n".data(using: .utf8)!)
    continue
  }
  let request = VNGeneratePersonSegmentationRequest()
  request.qualityLevel = .accurate
  request.outputPixelFormat = kCVPixelFormatType_OneComponent8
  try VNImageRequestHandler(cgImage: image, options: [:]).perform([request])
  guard let mask = request.results?.first?.pixelBuffer else { continue }

  // Scale the mask back to the photo's size.
  var mapped = CIImage(cvPixelBuffer: mask)
  mapped = mapped.transformed(by: CGAffineTransform(
    scaleX: CGFloat(image.width) / mapped.extent.width,
    y: CGFloat(image.height) / mapped.extent.height))
  guard let output = context.createCGImage(mapped, from: CGRect(x: 0, y: 0, width: image.width, height: image.height)) else { continue }

  let name = ((path as NSString).lastPathComponent as NSString).deletingPathExtension + ".png"
  let url = URL(fileURLWithPath: outDir).appendingPathComponent(name)
  guard let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else { continue }
  CGImageDestinationAddImage(destination, output, nil)
  CGImageDestinationFinalize(destination)
  print(url.path)
}
