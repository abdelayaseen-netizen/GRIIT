import Cocoa
import WebKit

// Build 90 10.4: HTML → PDF with WebKit, no browser install needed.
// swiftc -O -o /tmp/griit-html2pdf agents/tools/html2pdf.swift && /tmp/griit-html2pdf in.html out.pdf
let args = CommandLine.arguments
guard args.count >= 3 else { fputs("usage: html2pdf in.html out.pdf\n", stderr); exit(2) }
let input = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2])

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)

final class Delegate: NSObject, WKNavigationDelegate {
  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
      webView.createPDF(configuration: WKPDFConfiguration()) { result in
        switch result {
        case .success(let data):
          do { try data.write(to: output); print("wrote \(output.path) \(data.count) bytes") } catch { fputs("write failed: \(error)\n", stderr); exit(1) }
          exit(0)
        case .failure(let error):
          fputs("pdf failed: \(error)\n", stderr)
          exit(1)
        }
      }
    }
  }
  func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    fputs("load failed: \(error)\n", stderr); exit(1)
  }
}

let delegate = Delegate()
let webView = WKWebView(frame: NSRect(x: 0, y: 0, width: 794, height: 1123))
webView.navigationDelegate = delegate
webView.loadFileURL(input, allowingReadAccessTo: input.deletingLastPathComponent())
DispatchQueue.main.asyncAfter(deadline: .now() + 60) { fputs("timed out\n", stderr); exit(1) }
app.run()
