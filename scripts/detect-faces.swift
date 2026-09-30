// Finds the faces in each portrait with Apple's Vision framework and prints
// their boxes as JSON (pixels, top-left origin, largest face first), so the
// badge generator can frame every photo the same way.
//   swift badges/detect-faces.swift assets/people/* > badges/caras.json
import Foundation
import ImageIO
import Vision

var results: [String: Any] = [:]
for path in CommandLine.arguments.dropFirst() {
  guard
    let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
    let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
  else {
    FileHandle.standardError.write("Could not read \(path)\n".data(using: .utf8)!)
    continue
  }
  let request = VNDetectFaceRectanglesRequest()
  try VNImageRequestHandler(cgImage: image, options: [:]).perform([request])
  let width = Double(image.width)
  let height = Double(image.height)
  let faces = (request.results ?? [])
    .map { face -> [String: Double] in
      let box = face.boundingBox
      return [
        "x": box.minX * width,
        "y": (1 - box.maxY) * height,
        "w": box.width * width,
        "h": box.height * height,
        "confidence": Double(face.confidence),
      ]
    }
    .sorted { $0["w"]! * $0["h"]! > $1["w"]! * $1["h"]! }
  results[(path as NSString).lastPathComponent] = ["width": width, "height": height, "faces": faces]
}
let json = try JSONSerialization.data(withJSONObject: results, options: [.prettyPrinted, .sortedKeys])
print(String(data: json, encoding: .utf8)!)
