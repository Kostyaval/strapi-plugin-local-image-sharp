const { parseImageUrl } = require('../middleware');

describe('middleware extract modifiers test', () => {
  describe('parse url', () => {
    it('Should extract modifier from path', () => {
      const url = '/uploads/width_2000/neutral_front_a_1_88f17a7dd7.jpg'
      const result = parseImageUrl(url);
      expect(result.id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(result.modifiers).toEqual({width: "2000"});
    });

    it('Should extract modifiers from path', () => {
      const url = '/uploads/width_2000,width_3000,format_webp/neutral_front_a_1_88f17a7dd7.jpg'
      const result = parseImageUrl(url);
      expect(result.id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(result.modifiers).toEqual({width: "3000", format: 'webp'});
    });

    it('Should extract modifier from query', () => {
      const url = '/uploads/neutral_front_a_1_88f17a7dd7.jpg?format=webp'
      const result = parseImageUrl(url);
      expect(result.id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(result.modifiers).toEqual({format: 'webp'});
    });

    it('Should extract modifiers from query', () => {
      const url = '/uploads/neutral_front_a_1_88f17a7dd7.jpg?format=webp&resize=200x200&embed'
      const result = parseImageUrl(url);
      expect(result.id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(result.modifiers).toEqual({resize: "200x200", format: 'webp', embed: ''});
    });

    it('Should extract modifiers from path and ignore query', () => {
      const url = '/uploads/width_2000,width_3000,format_webp/neutral_front_a_1_88f17a7dd7.jpg?format=webp&resize=200x200&embed'
      const result = parseImageUrl(url);
      expect(result.id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(result.modifiers).toEqual({width: "3000", format: 'webp'});
    });

    it('Should return empty modifiers', () => {
      const url = '/uploads/neutral_front_a_1_88f17a7dd7.jpg'
      const result = parseImageUrl(url);
      expect(result.id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(result.modifiers).toBe(null);
    });

  })
});
