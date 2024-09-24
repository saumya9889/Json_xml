import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist/webpack"; // Browser-compatible build

// Set the worker source to the local public path
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.js`;

function PdfToJsonConverter() {
  const [pdfFile, setPdfFile] = useState(null);
  const [jsonContent, setJsonContent] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file");
    }
  };

  const convertPdfToJson = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first!");
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;

      const jsonArray = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items.map((item) => item.str).join(" ");
        jsonArray.push({ page: i, content: pageText });
      }

      setJsonContent(jsonArray);
    };

    fileReader.readAsArrayBuffer(pdfFile);
  };

  const downloadJson = () => {
    if (!jsonContent) {
      alert("No JSON content to download!");
      return;
    }

    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "pdf-content.json");
  };

  return (
    <div style={{margin:"1rem auto", width:"90%"}}>
      <h2>PDF to JSON Converter</h2>
      <input
       style={{marginBottom:".5rem"}}
       type="file" accept="application/pdf" onChange={handleFileChange} />
      <button
       style={{marginRight:".5rem",background:"#eee",border:"1px solid #999", borderRadius:"5px", padding:".4rem"}}
       onClick={convertPdfToJson}>Convert PDF to JSON</button>
      <button
      style={{marginRight:".5rem",background:"#eee",border:"1px solid #999", borderRadius:"5px", padding:".4rem"}}
       onClick={downloadJson} disabled={!jsonContent}>
        Download JSON
      </button>

      {jsonContent && (
        <pre style={{ textAlign: "left", maxHeight: "400px", overflow: "auto" }}>
          {JSON.stringify(jsonContent, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default PdfToJsonConverter;
