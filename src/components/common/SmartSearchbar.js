import { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList
} from 'react-native';
import {
  Searchbar,
  Surface,
  List
} from 'react-native-paper';
import searchService from '../../services/SearchService';

const SmartSearchbar = ({ 
  onSearch, 
  placeholder = "검색어를 입력하세요...",
  style
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    searchService.initialize();
  }, []);

  const updateSuggestions = useCallback(async (searchQuery) => {
    if (searchQuery.trim().length === 0) {
      const historySuggestions = searchService.getAutocompleteSuggestions('');
      setSuggestions(historySuggestions);
    } else {
      const autocompleteSuggestions = searchService.getAutocompleteSuggestions(searchQuery);
      setSuggestions(autocompleteSuggestions);
    }
  }, []);

  const handleQueryChange = (text) => {
    setQuery(text);
    updateSuggestions(text);
    setShowSuggestions(true);
  };

  const handleSearch = async (searchQuery = query) => {
    if (searchQuery.trim().length > 0) {
      await searchService.addToHistory(searchQuery);
      onSearch(searchQuery);
    }
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const renderSuggestion = ({ item }) => (
    <List.Item
      title={item.text}
      left={() => (
        <List.Icon 
          icon={item.type === 'history' ? 'history' : 'magnify'} 
          color="#666"
        />
      )}
      onPress={() => handleSuggestionSelect(item)}
      style={{ paddingVertical: 8 }}
    />
  );

  return (
    <View style={style}>
      <Surface style={{ elevation: 2 }}>
        <Searchbar
          placeholder={placeholder}
          value={query}
          onChangeText={handleQueryChange}
          onSubmitEditing={() => handleSearch()}
          onFocus={() => {
            updateSuggestions(query);
            setShowSuggestions(true);
          }}
          style={{ elevation: 0 }}
          inputStyle={{ fontSize: 14 }}
        />

        {/* 자동완성 제안 */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            backgroundColor: 'white',
            elevation: 4,
            zIndex: 1000,
            maxHeight: 200
          }}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item, index) => `${item.text}_${index}`}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </Surface>

      {/* 터치 영역 (제안 숨기기) */}
      {showSuggestions && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            bottom: -1000,
            zIndex: 999
          }}
          onPress={() => setShowSuggestions(false)}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

export default SmartSearchbar;
