# simple-webgui-welle-cli
This repository provides an alternative, simplified Web GUI for welle-cli, specifically optimized for mobile phone.
These files are modified versions of the original web interface, updated with the assistance of AI to streamline the user experience.

## Features
- Country selector – pick your country and the block list filters to only show channels active there.
- Antenna length recommendation – shows the ideal quarter-wave antenna length for the selected block.
- Channel data in a separate `dab-channels.json` file – easy to update without touching the HTML/JS.
- Manual mode – select "Manual" as country to browse all 38 DAB+ blocks.
- 32 countries with documented DAB+/T-DMB assignments.

## Installation
Note: This is an addon. You must have welle-cli already installed on your system.

1. Locate your webgui folder: On most Linux installations, this is found at: /usr/share/welle-io/html (or /usr/local/share/welle-io/html).
2. Backup your original files: Before making changes, rename your existing index.html so you can revert if needed.
3. Upload the new files: Copy `index.html`, `player.js`, and `dab-channels.json` from this repository into that same folder.
4. Access the GUI: A restart of the welle-cli service is usually not necessary. Simply refresh your browser. By default, the GUI is accessible at: http://[YOUR-IP-ADDRESS]:8080

## Updating channel data
The file `dab-channels.json` contains all block frequencies, antenna lengths, and per-country channel assignments. To update it, edit the JSON directly – no changes to `index.html` are needed.


![on phone](https://github.com/user-attachments/assets/f8df9c9b-5df1-406a-b4ee-b6884fb03585)

License & Credits

Original Project: by Albrecht Lohofener.
License: This addon is distributed under the same license as the original project (GPLv2).
