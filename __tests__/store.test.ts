import { useAppStore } from '../src/store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState());
  });

  it('loads roommate feed profiles with valid attributes and verifies radiusKm: 25', async () => {
    expect(useAppStore.getState().filters.radiusKm).toBe(25);
    await useAppStore.getState().loadFeed();
    const feed = useAppStore.getState().feed;
    expect(feed.length).toBeGreaterThan(0);
    expect(feed[0]).toHaveProperty('fullName');
    expect(feed[0]).toHaveProperty('budgetMin');
    expect(feed[0]).toHaveProperty('cleanlinessLevel');
  });

  it('handles right swipe and triggers mutual match on reciprocal profile user-002', async () => {
    await useAppStore.getState().loadFeed();
    const initialFeed = useAppStore.getState().feed;
    const initialCount = initialFeed.length;

    // user-002 (Ananya Iyer) is pre-configured as reciprocal match
    const reciprocalUser = initialFeed.find((p) => p.id === 'user-002');
    expect(reciprocalUser).toBeDefined();

    // Reorder feed so reciprocal candidate is first
    useAppStore.setState({
      feed: [reciprocalUser!, ...initialFeed.filter((p) => p.id !== 'user-002')],
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

  it('updates search filters and theme preference', () => {
    expect(useAppStore.getState().filters.radiusKm).toBe(25);
    useAppStore.getState().setFilters({ radiusKm: 40, budgetMax: 50000 });
    expect(useAppStore.getState().filters.radiusKm).toBe(40);
    expect(useAppStore.getState().filters.budgetMax).toBe(50000);

    expect(useAppStore.getState().themePreference).toBe('system');

    useAppStore.getState().setThemePreference('dark');
    expect(useAppStore.getState().themePreference).toBe('dark');

    useAppStore.getState().setThemePreference('light');
    expect(useAppStore.getState().themePreference).toBe('light');

    useAppStore.getState().setThemePreference('system');
    expect(useAppStore.getState().themePreference).toBe('system');
  });
});
