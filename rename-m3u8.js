const fs = require('fs');
const path = require('path');

function renameAndReplaceInM3U8(pathLocation, oldFilename, newFilename) {
    // Step 1: Find the .m3u8 file and replace old filenames with newFilename
    fs.readdir(pathLocation, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        const m3u8File = files.find(file => path.extname(file) === '.m3u8');
        if (!m3u8File) {
            console.error('No .m3u8 file found in directory.');
            return;
        }

        const m3u8Path = path.join(pathLocation, m3u8File);
        fs.readFile(m3u8Path, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading .m3u8 file:', err);
                return;
            }

            // Step 2: Replace old filenames with newFilename in the .m3u8 content
            const replacedContent = data.replace(new RegExp(oldFilename, 'g'), newFilename);

            // Step 3: Write the modified content back to the .m3u8 file
            fs.writeFile(m3u8Path, replacedContent, 'utf8', err => {
                if (err) {
                    console.error('Error writing to .m3u8 file:', err);
                    return;
                }

                console.log(`Successfully replaced filenames in ${m3u8File}`);

                // Step 4: Rename all files starting with oldFilename to newFilename
                fs.readdir(pathLocation, (err, files) => {
                    if (err) {
                        console.error('Error reading directory:', err);
                        return;
                    }

                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        if (file.startsWith(oldFilename)) {
                            const ext = path.extname(file);
                            const fileNumber = file.substring(oldFilename.length, file.length - ext.length);
                            const oldPath = path.join(pathLocation, file);
                            const newPath = path.join(pathLocation, `${newFilename}${fileNumber}${ext}`);

                            fs.rename(oldPath, newPath, err => {
                                if (err) {
                                    console.error(`Error renaming ${file}:`, err);
                                } else {
                                    console.log(`Renamed ${file} to ${newFilename}${fileNumber}${ext}`);
                                }
                            });
                        }
                    }

                    // Step 5: Rename the parent directory (pathLocation) to newFilename
                    const newFolderPath = path.join(path.dirname(pathLocation), newFilename);
                    fs.rename(pathLocation, newFolderPath, err => {
                        if (err) {
                            console.error(`Error renaming directory ${pathLocation}:`, err);
                        } else {
                            console.log(`Successfully renamed directory ${pathLocation} to ${newFolderPath}`);
                        }
                    });
                });
            });
        });
    });
}

// Example usage:
// /Users/cmd/Desktop/project/lh-m3u8/
const oldFilename = 'wan';
const newFilename = 'wan-new';
const folderPath = '/Users/cmd/Desktop/project/lh-m3u8';

const pathLocation = `${folderPath}/${oldFilename}`;

renameAndReplaceInM3U8(pathLocation, oldFilename, newFilename);
// https://lh-assets-dev.s3.ap-southeast-1.amazonaws.com