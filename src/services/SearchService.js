import AsyncStorage from '@react-native-async-storage/async-storage';

class SearchService {
  constructor() {
    this.searchHistory = [];
    this.searchSuggestions = new Set();
    this.initialized = false;
    this.listeners = new Set();
    
    // 한국어 검색 최적화를 위한 설정
    this.KOREAN_JAMO = {
      초성: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'],
      중성: ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'],
      종성: ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
    };
    
    this.SEARCH_OPERATORS = {
      AND: '&',
      OR: '|',
      NOT: '!',
      EXACT: '"',
      WILDCARD: '*'
    };
    
    this.MAX_HISTORY_SIZE = 50;
    this.MAX_SUGGESTIONS = 10;
  }

  async initialize() {
    if (this.initialized) return;

    await this.loadSearchHistory();
    await this.loadSearchSuggestions();
    
    this.initialized = true;
  }

  async loadSearchHistory() {
    try {
      const cachedHistory = await AsyncStorage.getItem('search_history');
      if (cachedHistory) {
        this.searchHistory = JSON.parse(cachedHistory);
      }
    } catch {
      this.searchHistory = [];
    }
  }

  async loadSearchSuggestions() {
    try {
      const cachedSuggestions = await AsyncStorage.getItem('search_suggestions');
      if (cachedSuggestions) {
        const suggestions = JSON.parse(cachedSuggestions);
        this.searchSuggestions = new Set(suggestions);
      }
    } catch {
      this.searchSuggestions = new Set();
    }
  }

  async saveSearchHistory() {
    try {
      await AsyncStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    } catch {
      // Handle save error silently
    }
  }

  async saveSearchSuggestions() {
    try {
      const suggestions = Array.from(this.searchSuggestions);
      await AsyncStorage.setItem('search_suggestions', JSON.stringify(suggestions));
    } catch {
      // Handle save error silently
    }
  }

  // 한국어 문자 분해 (자모 분리)
  decomposeKorean(char) {
    const charCode = char.charCodeAt(0);
    if (charCode < 0xAC00 || charCode > 0xD7A3) {
      return [char]; // 한글이 아닌 경우 원래 문자 반환
    }

    const code = charCode - 0xAC00;
    const 초성 = Math.floor(code / 588);
    const 중성 = Math.floor((code % 588) / 28);
    const 종성 = code % 28;

    const result = [
      this.KOREAN_JAMO.초성[초성],
      this.KOREAN_JAMO.중성[중성]
    ];

    if (종성 > 0) {
      result.push(this.KOREAN_JAMO.종성[종성]);
    }

    return result;
  }

  // 초성 검색 지원
  extractInitialConsonants(text) {
    return text.split('').map(char => {
      const decomposed = this.decomposeKorean(char);
      return decomposed[0] || char;
    }).join('');
  }

  // 검색어 정규화
  normalizeSearchTerm(term) {
    return term
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' '); // 연속된 공백을 하나로
  }

  // 고급 검색 쿼리 파싱
  parseSearchQuery(query) {
    const normalizedQuery = this.normalizeSearchTerm(query);
    const result = {
      terms: [],
      exactPhrases: [],
      excludeTerms: [],
      operators: []
    };

    // 따옴표로 묶인 정확한 구문 추출
    let tempQuery = normalizedQuery;
    const exactMatches = tempQuery.match(/"([^"]+)"/g);
    if (exactMatches) {
      exactMatches.forEach(match => {
        const phrase = match.slice(1, -1); // 따옴표 제거
        result.exactPhrases.push(phrase);
        tempQuery = tempQuery.replace(match, '');
      });
    }

    // 제외 키워드 처리 (!키워드)
    const excludeMatches = tempQuery.match(/!(\S+)/g);
    if (excludeMatches) {
      excludeMatches.forEach(match => {
        const term = match.slice(1); // ! 제거
        result.excludeTerms.push(term);
        tempQuery = tempQuery.replace(match, '');
      });
    }

    // 나머지 검색어들
    const remainingTerms = tempQuery
      .split(/[&|]/)
      .map(term => term.trim())
      .filter(term => term.length > 0);

    result.terms = remainingTerms;

    // AND/OR 연산자 감지
    if (normalizedQuery.includes('&')) {
      result.operators.push('AND');
    }
    if (normalizedQuery.includes('|')) {
      result.operators.push('OR');
    }

    return result;
  }

  // 텍스트 매칭 점수 계산
  calculateMatchScore(text, searchTerms, options = {}) {
    const { exactPhrases = [], excludeTerms = [] } = options;
    let score = 0;

    const normalizedText = this.normalizeSearchTerm(text);
    const initialConsonants = this.extractInitialConsonants(text);

    // 제외 키워드가 포함되어 있으면 0점
    for (const excludeTerm of excludeTerms) {
      if (normalizedText.includes(excludeTerm.toLowerCase())) {
        return 0;
      }
    }

    // 정확한 구문 매칭 (높은 점수)
    for (const phrase of exactPhrases) {
      if (normalizedText.includes(phrase.toLowerCase())) {
        score += 100;
      }
    }

    // 일반 검색어 매칭
    for (const term of searchTerms) {
      const lowerTerm = term.toLowerCase();
      
      // 완전 일치
      if (normalizedText === lowerTerm) {
        score += 50;
      }
      // 단어 시작 부분 일치
      else if (normalizedText.startsWith(lowerTerm)) {
        score += 30;
      }
      // 포함
      else if (normalizedText.includes(lowerTerm)) {
        score += 20;
      }
      // 초성 검색
      else if (initialConsonants.includes(lowerTerm)) {
        score += 10;
      }
      // 부분 문자열 매칭
      else {
        for (let i = 0; i < lowerTerm.length; i++) {
          if (normalizedText.includes(lowerTerm.slice(i))) {
            score += 5;
            break;
          }
        }
      }
    }

    return score;
  }

  // 검색 실행
  search(data, query, options = {}) {
    const {
      fields = ['title', 'content', 'authorName'],
      limit = 20,
      sortBy = 'relevance'
    } = options;

    if (!query || query.trim().length === 0) {
      return { results: [], searchInfo: { query: '', totalResults: 0 } };
    }

    const parsedQuery = this.parseSearchQuery(query);
    const { terms, exactPhrases, excludeTerms } = parsedQuery;

    if (terms.length === 0 && exactPhrases.length === 0) {
      return { results: [], searchInfo: { query, totalResults: 0 } };
    }

    const results = data.map(item => {
      let totalScore = 0;
      const fieldScores = {};

      for (const field of fields) {
        const fieldValue = item[field] || '';
        const fieldScore = this.calculateMatchScore(fieldValue, terms, {
          exactPhrases,
          excludeTerms
        });
        
        fieldScores[field] = fieldScore;
        
        // 필드별 가중치 적용
        switch (field) {
          case 'title':
            totalScore += fieldScore * 3; // 제목은 3배 가중치
            break;
          case 'content':
            totalScore += fieldScore * 1; // 내용은 기본 가중치
            break;
          case 'authorName':
            totalScore += fieldScore * 2; // 작성자는 2배 가중치
            break;
          default:
            totalScore += fieldScore;
        }
      }

      return totalScore > 0 ? {
        item,
        score: totalScore,
        fieldScores,
        matchInfo: {
          query: parsedQuery,
          highlightTerms: [...terms, ...exactPhrases]
        }
      } : null;
    }).filter(Boolean);

    // 정렬
    if (sortBy === 'relevance') {
      results.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'date') {
      results.sort((a, b) => new Date(b.item.createdAt) - new Date(a.item.createdAt));
    }

    // 제한
    const limitedResults = results.slice(0, limit);

    return {
      results: limitedResults,
      searchInfo: {
        query,
        parsedQuery,
        totalResults: results.length,
        executedAt: new Date().toISOString()
      }
    };
  }

  // 검색 기록 추가
  async addToHistory(query) {
    if (!query || query.trim().length === 0) return;

    const normalizedQuery = this.normalizeSearchTerm(query);
    
    // 중복 제거
    this.searchHistory = this.searchHistory.filter(item => item.query !== normalizedQuery);
    
    // 새로운 검색 기록 추가 (맨 앞에)
    this.searchHistory.unshift({
      query: normalizedQuery,
      timestamp: new Date().toISOString(),
      count: 1
    });

    // 최대 크기 제한
    if (this.searchHistory.length > this.MAX_HISTORY_SIZE) {
      this.searchHistory = this.searchHistory.slice(0, this.MAX_HISTORY_SIZE);
    }

    await this.saveSearchHistory();
    this.notifyListeners('history_updated', { history: this.searchHistory });
  }

  // 검색 제안 추가
  async addSuggestion(text) {
    if (!text || text.trim().length < 2) return;

    const words = this.normalizeSearchTerm(text).split(' ');
    for (const word of words) {
      if (word.length >= 2) {
        this.searchSuggestions.add(word);
      }
    }

    // 최대 크기 제한
    if (this.searchSuggestions.size > 1000) {
      const suggestions = Array.from(this.searchSuggestions);
      this.searchSuggestions = new Set(suggestions.slice(-800)); // 뒤에서 800개만 유지
    }

    await this.saveSearchSuggestions();
  }

  // 자동완성 제안 생성
  getAutocompleteSuggestions(query) {
    if (!query || query.trim().length === 0) {
      return this.searchHistory.slice(0, this.MAX_SUGGESTIONS).map(item => ({
        type: 'history',
        text: item.query,
        timestamp: item.timestamp
      }));
    }

    const normalizedQuery = this.normalizeSearchTerm(query);
    const suggestions = [];

    // 검색 기록에서 매칭되는 항목
    const historyMatches = this.searchHistory
      .filter(item => item.query.includes(normalizedQuery))
      .slice(0, 5)
      .map(item => ({
        type: 'history',
        text: item.query,
        timestamp: item.timestamp
      }));

    // 제안 단어에서 매칭되는 항목
    const suggestionMatches = Array.from(this.searchSuggestions)
      .filter(suggestion => suggestion.includes(normalizedQuery))
      .slice(0, 5)
      .map(suggestion => ({
        type: 'suggestion',
        text: suggestion
      }));

    suggestions.push(...historyMatches, ...suggestionMatches);

    // 중복 제거 및 제한
    const uniqueSuggestions = suggestions
      .filter((item, index, self) => 
        index === self.findIndex(s => s.text === item.text)
      )
      .slice(0, this.MAX_SUGGESTIONS);

    return uniqueSuggestions;
  }

  // 검색 기록 가져오기
  getSearchHistory() {
    return [...this.searchHistory];
  }

  // 검색 기록 삭제
  async clearSearchHistory() {
    this.searchHistory = [];
    await this.saveSearchHistory();
    this.notifyListeners('history_cleared', {});
  }

  // 특정 검색 기록 삭제
  async removeFromHistory(query) {
    this.searchHistory = this.searchHistory.filter(item => item.query !== query);
    await this.saveSearchHistory();
    this.notifyListeners('history_updated', { history: this.searchHistory });
  }

  // 텍스트 하이라이트 정보 생성
  generateHighlights(text, searchTerms) {
    if (!searchTerms || searchTerms.length === 0) {
      return [{ text, isHighlight: false }];
    }

    const normalizedText = text.toLowerCase();
    const highlights = [];
    let currentIndex = 0;

    // 모든 매칭 위치 찾기
    const matches = [];
    for (const term of searchTerms) {
      const lowerTerm = term.toLowerCase();
      let index = normalizedText.indexOf(lowerTerm);
      while (index !== -1) {
        matches.push({
          start: index,
          end: index + lowerTerm.length,
          term: lowerTerm
        });
        index = normalizedText.indexOf(lowerTerm, index + 1);
      }
    }

    // 매칭 위치 정렬
    matches.sort((a, b) => a.start - b.start);

    // 중복 제거 및 병합
    const mergedMatches = [];
    for (const match of matches) {
      const lastMatch = mergedMatches[mergedMatches.length - 1];
      if (lastMatch && match.start <= lastMatch.end) {
        lastMatch.end = Math.max(lastMatch.end, match.end);
      } else {
        mergedMatches.push(match);
      }
    }

    // 하이라이트 배열 생성
    for (const match of mergedMatches) {
      if (currentIndex < match.start) {
        highlights.push({
          text: text.slice(currentIndex, match.start),
          isHighlight: false
        });
      }
      highlights.push({
        text: text.slice(match.start, match.end),
        isHighlight: true
      });
      currentIndex = match.end;
    }

    if (currentIndex < text.length) {
      highlights.push({
        text: text.slice(currentIndex),
        isHighlight: false
      });
    }

    return highlights.length > 0 ? highlights : [{ text, isHighlight: false }];
  }

  // 리스너 관리
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch {
        // Handle listener error silently
      }
    });
  }

  cleanup() {
    this.listeners.clear();
    this.initialized = false;
  }
}

const searchService = new SearchService();

export default searchService;
