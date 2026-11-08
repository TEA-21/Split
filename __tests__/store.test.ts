import { useAppStore } from '../src/store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState());
  });

  it('loads roommate feed profiles with valid attributes', async () => {
    await useAppStore.getState().loadFeed();
    const feed = useAppStore.getState().feed;
    expect(feed.length).toBeGreaterThan(0);
    expect(feed[0]).toHaveProperty('fullName');
    expect(feed[0]).toHaveProperty('budgetMin');
    expect(feed[0]).toHaveProperty('cleanlinessLevel');
  });

  it('handles right swipe and triggers mutual match on reciprocal profile', async () => {
    await useAppStore.getState().loadFeed();
    const initialFeed = useAppStore.getState().feed;
    const initialCount = initialFeed.length;

    // Julian Vance (user-002) is pre-configured as reciprocal match
    const julian = initialFeed.find((p) => p.id === 'user-002');
    expect(julian).toBeDefined();

    // Reorder feed so Julian is first
    useAppStore.setState({
      feed: [julian!, ...initialFeed.filter((p) => p.id !== 'user-002')],
    });

    const result = await useAppStore.getState().swipe('like');
    expect(result.isMatch).toBe(true);
    expect(result.match?.matchedUser.id).toBe('user-002');
    expect(useAppStore.getState().activeMatch?.matchedUser.id).toBe('user-002');
    expect(useAppStore.getState().feed.length).toBe(initialCount - 1);
  });

  it('supports undoing a swipe via undoSwipe', async () => {
    await useAppStore.getState().loadFeed();
    const initialFeed = useAppStore.getState().feed;
    const firstProfile = initialFeed[0];

    await useAppStore.getState().swipe('pass');
    expect(useAppStore.getState().feed[0]?.id).not.toBe(firstProfile.id);

    await useAppStore.getState().undoSwipe();
    expect(useAppStore.getState().feed[0]?.id).toBe(firstProfile.id);
  });
});

