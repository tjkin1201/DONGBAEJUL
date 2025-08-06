import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';
import {
  Text,
  Card,
  Divider
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import LoadingScreen from '../../components/LoadingScreen';
import theme from '../../utils/theme';

const { width } = Dimensions.get('window');
const ALBUM_WIDTH = (width - 48) / 2; // 2열 그리드

const PhotoAlbumsScreen = ({ navigation, route }) => {
  const { albums: initialAlbums } = route.params;
  const [albums, setAlbums] = useState(initialAlbums);
  const [loading, setLoading] = useState(false);

  const navigateToAlbumPhotos = (album) => {
    navigation.navigate('AlbumPhotos', { album });
  };

  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => navigateToAlbumPhotos(item)}
      activeOpacity={0.8}
    >
      <Card style={styles.albumCard}>
        <View style={styles.albumCover}>
          {item.photos && item.photos.length > 0 ? (
            <Image
              source={{ uri: item.photos[0].thumbnailUrl || item.photos[0].url }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.emptyCover}>
              <MaterialCommunityIcons
                name="image-off-outline"
                size={48}
                color={theme.colors.outline}
              />
            </View>
          )}
          <View style={styles.photoCount}>
            <Text style={styles.countText}>{item.count}</Text>
          </View>
        </View>
        <View style={styles.albumInfo}>
          <Text variant="titleMedium" numberOfLines={1}>
            {item.title}
          </Text>
          {item.date && (
            <Text variant="bodySmall" style={styles.albumDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  const mainAlbums = [albums.recent, albums.band, albums.games].filter(Boolean);
  const gameAlbums = albums.gameAlbums || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={() => (
          <>
            {/* 메인 앨범들 */}
            <View style={styles.section}>
              <Text variant="headlineSmall" style={styles.sectionTitle}>
                앨범
              </Text>
              <FlatList
                data={mainAlbums}
                renderItem={renderAlbumItem}
                numColumns={2}
                columnWrapperStyle={styles.albumRow}
                scrollEnabled={false}
              />
            </View>

            {gameAlbums.length > 0 && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.section}>
                  <Text variant="headlineSmall" style={styles.sectionTitle}>
                    경기별 앨범
                  </Text>
                  <FlatList
                    data={gameAlbums}
                    renderItem={renderAlbumItem}
                    numColumns={2}
                    columnWrapperStyle={styles.albumRow}
                    scrollEnabled={false}
                  />
                </View>
              </>
            )}
          </>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  albumRow: {
    justifyContent: 'space-between',
  },
  albumItem: {
    width: ALBUM_WIDTH,
    marginBottom: 16,
  },
  albumCard: {
    backgroundColor: theme.colors.surface,
  },
  albumCover: {
    position: 'relative',
    height: ALBUM_WIDTH,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  emptyCover: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  photoCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  albumInfo: {
    padding: 12,
  },
  albumDate: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
});

export default PhotoAlbumsScreen;
