const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

// Compression percentage for files > 5MB
const COMPRESSION_PERCENTAGE = 0.7; // Change this value to set compression percentage (e.g., 0.7 for 70%, 0.5 for 50%)

// Paths
const inputDir = 'input';
const outputDir = 'output';

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Function to check file size
const getFileSizeMB = (filePath) => {
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    return fileSizeInMB;
};

// Function to resize MP4 to specified percentage of the original size
const resizeMP4 = (inputPath, outputFilePath, compressionPercentage, callback) => {
    ffmpeg(inputPath)
        .outputOptions([
            `-vf scale=iw*${compressionPercentage}:ih*${compressionPercentage}` // Resize video
        ])
        .output(outputFilePath)
        .on('progress', (progress) => console.log(`Resizing: ${progress.percent.toFixed(2)}% done`))
        .on('end', () => {
            console.log(`File ${inputPath} has been resized successfully.`);
            callback(null);
        })
        .on('error', (err) => {
            console.error(`An error occurred with file ${inputPath}: ` + err.message);
            callback(err);
        })
        .run();
}

// Process all MP4 files in the input directory
fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('An error occurred while reading the input directory: ' + err.message);
        return;
    }

    const mp4Files = files.filter(file => path.extname(file).toLowerCase() === '.mp4');
    const totalFileCount = mp4Files.length;

    mp4Files.forEach((file, index) => {
        const inputPath = path.join(inputDir, file);
        const fileNameWithoutExt = path.parse(file).name;
        const outputFilePath = path.join(outputDir, file);

        // Check file size
        const fileSizeMB = getFileSizeMB(inputPath);

        if (fileSizeMB <= 2) {
            // If file size is <= 2MB, just convert without resizing
            createHLSPlaylist(inputPath, outputDir, fileNameWithoutExt, (err) => {
                if (!err) {
                    console.log(`HLS playlist created for ${fileNameWithoutExt}`);
                }
            });
        } else {
            // Resize the file if larger than 2MB
            resizeMP4(inputPath, outputFilePath, COMPRESSION_PERCENTAGE, (err) => {
                if (!err) {
                    console.log(`File ${file} has been resized.`);
                }
            });
        }
    });
});
