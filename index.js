const express = require("express");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.post("/convert", upload.array("images"), (req, res) => {
    try {
        const doc = new PDFDocument({ autoFirstPage: false });
        const filePath = `output-${Date.now()}.pdf`;
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        req.files.forEach((file) => {
            const img = doc.openImage(file.buffer);
            doc.addPage({ size: [img.width, img.height] });
            doc.image(img, 0, 0);
        });

        doc.end();

        writeStream.on("finish", () => {
            res.download(filePath, "converted.pdf", () => {
                fs.unlinkSync(filePath); // delete file after sending
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating PDF");
    }
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
