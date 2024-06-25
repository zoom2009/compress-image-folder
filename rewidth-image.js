const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const inputDir = path.join(__dirname, 'input');
const outputDir = path.join(__dirname, 'output');
const maxWidth = 2200;
const quality = 70; // Compress images to 70% quality

// Ensure the output directory exists
fs.ensureDirSync(outputDir);

// Function to process a single file
const processFile = async (inputFilePath, outputFilePath) => {
  const fileExtension = path.extname(inputFilePath).toLowerCase();

  // Allow resizing only for specific file types
  const allowedExtensions = ['.webp', '.jpg', '.jpeg', '.png'];
  if (!allowedExtensions.includes(fileExtension)) {
    // Copy the file without processing if it's not an allowed extension
    try {
      await fs.copy(inputFilePath, outputFilePath);
      console.log(`Copied without processing: ${inputFilePath}`);
    } catch (err) {
      console.error(`Error copying file ${inputFilePath}:`, err);
    }
    return;
  }

  try {
    const metadata = await sharp(inputFilePath).metadata();
    if (metadata.width > maxWidth) {
      // Resize the image if its width is greater than maxWidth
      await sharp(inputFilePath)
        .resize({ width: maxWidth })
        .toFormat(fileExtension === '.png' ? 'png' : fileExtension === '.webp' ? 'webp' : 'jpeg', { quality })
        .toFile(outputFilePath);
    } else {
      // Compress the image to 70% quality without resizing if its width is less than or equal to maxWidth
      await sharp(inputFilePath)
        .toFormat(fileExtension === '.png' ? 'png' : fileExtension === '.webp' ? 'webp' : 'jpeg', { quality })
        .toFile(outputFilePath);
    }
    console.log(`Processed: ${inputFilePath}`);
  } catch (err) {
    console.error(`Error processing file ${inputFilePath}:`, err);
  }
};

// Function to recursively process a directory
const processDirectory = async (dir) => {
  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(inputDir, fullPath);
    const outputFilePath = path.join(outputDir, relativePath);

    if (item.isDirectory()) {
      // Ensure the output directory exists
      await fs.ensureDir(outputFilePath);
      // Recursively process the directory
      await processDirectory(fullPath);
    } else if (item.isFile()) {
      // Process the file
      await processFile(fullPath, outputFilePath);
    }
  }
};

// Start processing the input directory
processDirectory(inputDir)
  .then(() => {
    console.log('Processing complete.');
  })
  .catch(err => {
    console.error('Error processing directories:', err);
  });
