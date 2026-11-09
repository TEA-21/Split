import { isValidUuid, assertValidUuid } from '../src/utils/security';

describe('security utilities', () => {
  describe('isValidUuid', () => {
    it('returns true for valid RFC 4122 UUIDs', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'c8a2b53e-5b7c-4822-90fd-3fbf2a1d2e11',
        'C8A2B53E-5B7C-4822-90FD-3FBF2A1D2E11',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '  a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11  ', // trimmed check
      ];

      for (const uuid of validUuids) {
        expect(isValidUuid(uuid)).toBe(true);
      }
    });

    it('returns false for malicious or invalid injection strings', () => {
      const invalidStrings = [
        'user-123',
        'id,user_b.eq.hacked',
        '',
        '   ',
        '12345',
        'not-a-valid-uuid',
        '123e4567-e89b-12d3-a456-426614174000; DROP TABLE users;',
        '123e4567-e89b-62d3-a456-426614174000', // invalid version (6)
        null as any,
        undefined as any,
        12345 as any,
      ];

      for (const invalid of invalidStrings) {
        expect(isValidUuid(invalid)).toBe(false);
      }
    });
  });

  describe('assertValidUuid', () => {
    it('does not throw when valid UUID is passed', () => {
      expect(() => {
        assertValidUuid('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'currentUserId');
      }).not.toThrow();
    });

    it('throws expected error message on invalid IDs', () => {
      expect(() => {
        assertValidUuid('user-123', 'currentUserId');
      }).toThrow('Invalid currentUserId: must be a valid UUID');

      expect(() => {
        assertValidUuid('id,user_b.eq.hacked', 'matchId');
      }).toThrow('Invalid matchId: must be a valid UUID');

      expect(() => {
        assertValidUuid('bad-id');
      }).toThrow('Invalid ID: must be a valid UUID');
    });
  });
});

