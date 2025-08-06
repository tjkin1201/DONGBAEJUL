import React, { useState, useRef, useCallback } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Keyboard,
  Alert,
  Platform 
} from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import EmojiSelector from 'react-native-emoji-selector';

const ChatInput = ({ 
  onSendMessage, 
  onTyping, 
  placeholder = "메시지를 입력하세요...",
  disabled = false 
}) => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 타이핑 인디케이터 관리
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping && onTyping(true);
    }

    // 기존 타이핑 타임아웃 클리어
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 3초 후 타이핑 중단
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping && onTyping(false);
    }, 3000);
  }, [isTyping, onTyping]);

  // 메시지 입력 처리
  const handleTextChange = (text) => {
    setMessage(text);
    if (text.length > 0) {
      handleTyping();
    } else {
      // 텍스트가 비어있으면 타이핑 중단
      if (isTyping) {
        setIsTyping(false);
        onTyping && onTyping(false);
      }
    }
  };

  // 메시지 전송
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) return;

    // 타이핑 중단
    if (isTyping) {
      setIsTyping(false);
      onTyping && onTyping(false);
    }

    // 메시지 전송
    onSendMessage({
      content: trimmedMessage,
      messageType: 'text'
    });

    // 입력 필드 초기화
    setMessage('');
    setShowEmojiPicker(false);
  };

  // 이모지 선택
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // 이미지 선택 및 전송
  const handleImagePicker = async () => {
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '권한 필요',
          '사진을 선택하려면 갤러리 접근 권한이 필요합니다.',
          [{ text: '확인' }]
        );
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // 이미지 메시지 전송
        onSendMessage({
          content: imageUri,
          messageType: 'image',
          caption: message.trim() || undefined
        });

        // 입력 필드 초기화
        setMessage('');
      }
    } catch (error) {
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  // 카메라로 사진 촬영
  const handleCamera = async () => {
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '권한 필요',
          '사진을 촬영하려면 카메라 접근 권한이 필요합니다.',
          [{ text: '확인' }]
        );
        return;
      }

      // 카메라 실행
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // 이미지 메시지 전송
        onSendMessage({
          content: imageUri,
          messageType: 'image',
          caption: message.trim() || undefined
        });

        // 입력 필드 초기화
        setMessage('');
      }
    } catch (error) {
      Alert.alert('오류', '사진을 촬영하는 중 오류가 발생했습니다.');
    }
  };

  // 첨부 파일 옵션 표시
  const showAttachmentOptions = () => {
    Alert.alert(
      '첨부 파일',
      '어떤 방식으로 사진을 추가하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '갤러리에서 선택', onPress: handleImagePicker },
        { text: '카메라로 촬영', onPress: handleCamera },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 이모지 선택기 */}
      {showEmojiPicker && (
        <View style={styles.emojiPickerContainer}>
          <EmojiSelector
            onEmojiSelected={handleEmojiSelect}
            showSearchBar={false}
            showTabs={true}
            showHistory={true}
            columns={8}
          />
        </View>
      )}

      {/* 입력 영역 */}
      <View style={[
        styles.inputContainer,
        { backgroundColor: theme.colors.surface }
      ]}>
        {/* 첨부 파일 버튼 */}
        <IconButton
          icon="plus"
          size={24}
          iconColor={theme.colors.primary}
          onPress={showAttachmentOptions}
          disabled={disabled}
          style={styles.attachButton}
        />

        {/* 텍스트 입력 */}
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            { 
              backgroundColor: theme.colors.background,
              color: theme.colors.onSurface,
              borderColor: theme.colors.outline 
            }
          ]}
          value={message}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.outline}
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        {/* 이모지 버튼 */}
        <IconButton
          icon={showEmojiPicker ? "keyboard" : "emoticon-happy-outline"}
          size={24}
          iconColor={theme.colors.primary}
          onPress={() => {
            setShowEmojiPicker(!showEmojiPicker);
            if (!showEmojiPicker) {
              Keyboard.dismiss();
            } else {
              inputRef.current?.focus();
            }
          }}
          disabled={disabled}
          style={styles.emojiButton}
        />

        {/* 전송 버튼 */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            { 
              backgroundColor: message.trim().length > 0 && !disabled
                ? theme.colors.primary 
                : theme.colors.outline 
            }
          ]}
          onPress={handleSendMessage}
          disabled={disabled || message.trim().length === 0}
          activeOpacity={0.7}
        >
          <IconButton
            icon="send"
            size={20}
            iconColor="#FFFFFF"
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  emojiPickerContainer: {
    height: 300,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    ...Platform.select({
      ios: {
        paddingBottom: 8,
      },
      android: {
        paddingBottom: 8,
      },
    }),
  },
  attachButton: {
    margin: 0,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    maxHeight: 100,
    fontSize: 16,
    lineHeight: 20,
  },
  emojiButton: {
    margin: 0,
    marginLeft: 4,
  },
  sendButton: {
    borderRadius: 20,
    marginLeft: 4,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    margin: 0,
  },
});

export default ChatInput;
