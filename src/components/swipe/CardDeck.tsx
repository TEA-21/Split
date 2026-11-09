import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SwipeCard } from './SwipeCard';
import { ActionButtons } from './ActionButtons';
import { EmptyDeckView } from './EmptyDeckView';
import { ProfileDetailModal } from './ProfileDetailModal';
import { RoommateProfile, SwipeDirection } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { theme } from '../../theme/tokens';
import { useAppTheme } from '../../theme/useAppTheme';

interface CardDeckProps {
  onOpenReportModal?: (profile: RoommateProfile) => void;
}

export const CardDeck: React.FC<CardDeckProps> = ({ onOpenReportModal }) => {
  const { isDark, currentTheme } = useAppTheme();

  const {
    feed,
    isLoading,
    swipedHistory,
    swipe,
    undoSwipe,
    loadFeed,
    setFilters,
    setIsFilterModalVisible,
  } = useAppStore();

  const [inspectingProfile, setInspectingProfile] = useState<RoommateProfile | null>(null);

  const handleSwipe = async (direction: SwipeDirection) => {
    await swipe(direction);
  };

  const handleProgrammaticSwipe = (direction: SwipeDirection) => {
    if (feed.length === 0) return;
    handleSwipe(direction);
  };

  const handleExpandRadius = () => {
    setFilters({ radiusMiles: 50 });
  };

  const handleOpenFilters = () => {
    setIsFilterModalVisible(true);
  };

  const handleOpenReport = (profile: RoommateProfile) => {
    setInspectingProfile(null);
    if (onOpenReportModal) {
      onOpenReportModal(profile);
    }
  };

  if (isLoading && feed.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={currentTheme.accent} />
      </View>
    );
  }

  if (feed.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyDeckView
          onExpandRadius={handleExpandRadius}
          onOpenFilters={handleOpenFilters}
          onRefresh={loadFeed}
        />
        <ProfileDetailModal
          profile={inspectingProfile}
          visible={inspectingProfile !== null}
          onClose={() => setInspectingProfile(null)}
          onReport={handleOpenReport}
        />
      </View>
    );
  }

  // Display top 2 cards
  const topCard = feed[0];
  const secondCard = feed.length > 1 ? feed[1] : null;

  return (
    <View style={styles.container}>
      {/* Cards stack */}
      <View style={styles.deckArea}>
        {secondCard && (
          <View style={[styles.cardWrapper, styles.secondCardWrapper]} pointerEvents="none">
            <SwipeCard
              key={secondCard.id}
              profile={secondCard}
              isTopCard={false}
              onSwipe={handleSwipe}
              onPressDetails={() => setInspectingProfile(secondCard)}
            />
          </View>
        )}

        {topCard && (
          <View style={[styles.cardWrapper, styles.topCardWrapper]}>
            <SwipeCard
              key={topCard.id}
              profile={topCard}
              isTopCard={true}
              onSwipe={handleSwipe}
              onPressDetails={() => setInspectingProfile(topCard)}
            />
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <ActionButtons
        onRewind={undoSwipe}
        onPass={() => handleProgrammaticSwipe('pass')}
        onSuperlike={() => handleProgrammaticSwipe('superlike')}
        onLike={() => handleProgrammaticSwipe('like')}
        onInfo={() => topCard && setInspectingProfile(topCard)}
        canRewind={swipedHistory.length > 0}
        disabled={feed.length === 0}
      />

      {/* Profile Detail Bottom Sheet Modal */}
      <ProfileDetailModal
        profile={inspectingProfile}
        visible={inspectingProfile !== null}
        onClose={() => setInspectingProfile(null)}
        onReport={handleOpenReport}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  deckArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cardWrapper: {
    position: 'absolute',
  },
  topCardWrapper: {
    zIndex: 2,
  },
  secondCardWrapper: {
    zIndex: 1,
    transform: [{ scale: 0.96 }, { translateY: 10 }],
    opacity: 0.85,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});

