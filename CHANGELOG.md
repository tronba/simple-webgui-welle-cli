# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Local audio recording functionality for DAB+ streams
  - Record button to start/stop audio stream recording
  - Automatic file download with service name and timestamp
  - Support for WebM and OGG audio formats
  - MediaRecorder API integration with Web Audio API
- Error counter formatting for large values
  - Numbers over 1,000 display with "k" suffix (e.g., 1.01k)
  - Numbers over 1,000,000 display with "M" suffix (e.g., 1.01M)

### Changed
- Improved UI layout
  - Play button now displays as full-width primary action
  - Record button positioned inline with error indicators for compact layout
  - Optimized button sizing for better visual hierarchy

### Technical Details
- Implemented `MediaRecorder` for capturing live audio streams
- Added `AudioContext` for stream processing without interrupting playback
- Recording files named with format: `ServiceName_YYYYMMDD_HHMMSS.webm`
- Automatic fallback to OGG format for browsers without WebM support
