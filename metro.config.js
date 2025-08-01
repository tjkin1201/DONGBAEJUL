const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 이미지 파일 형식 지원 추가
config.resolver.assetExts.push('jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg');

module.exports = config;