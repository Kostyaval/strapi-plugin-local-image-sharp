const { parseImageUrl, applyPresets, applyStrictMode} = require('../middleware');

const presets = {
  mobile: {
    resize: "200x200",
    embed: '',
    q: '70'
  },
  desktop: {
    resize: "200x200",
    embed: '',
    q: '90'
  },
  square: {
    width: '500',
    height: '500'
  }

}
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

  describe('parse url and apply presets', () => {

    it('Should extract modifier and preset from path. Should not change modifiers in applyPresets, du to preset not present in url', () => {
      const url = '/uploads/width_2000/neutral_front_a_1_88f17a7dd7.jpg'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual({ width: '2000'});
    });

    it('Should extract modifier and preset from path. Should apply preset modifier', () => {
      const url = '/uploads/preset_square,width_2000/neutral_front_a_1_88f17a7dd7.jpg'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual({ width: '500', height: '500'});
    });


    it('Should extract modifier and preset from query. Should apply preset modifier', () => {
      const url = '/uploads/neutral_front_a_1_88f17a7dd7.jpg?preset=mobile&format=webp'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual({resize: "200x200", embed: '', q: '70', format: 'webp'});
    });

    it('Should extract modifier and preset from path, and ignore query. Should apply preset modifier', () => {
      const url = '/uploads/preset_square,width_2000/neutral_front_a_1_88f17a7dd7.jpg?preset=mobile&format=webp'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual({ width: '500', height: '500'});
    });

    it('Should extract modifier and preset from path. Should not apply preset du to preset not exist', () => {
      const url = '/uploads/neutral_front_a_1_88f17a7dd7.jpg?preset=tablet&format=webp'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual({ format: 'webp'});
    });

    it('Should extract modifier and preset from path. Should not apply preset du to preset not exist in config', () => {
      const url = '/uploads/neutral_front_a_1_88f17a7dd7.jpg?preset=tablet&format=webp'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      const modifiersWithPreset = applyPresets(modifiersFromUrl, {})
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual({ format: 'webp'});
    });

  })


  describe('parse url, apply presets in strict mode', () => {

    it('In strict mode no one modifier should be apply', () => {
      const url = '/uploads/width_2000/neutral_front_a_1_88f17a7dd7.jpg'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      applyStrictMode(modifiersFromUrl, true)
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual(null);
    });

    it('In strict mode no one modifier should be apply', () => {
      const url = '/uploads/neutral_front_a_1_88f17a7dd7.jpg?format=webp&resize=200x200'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      applyStrictMode(modifiersFromUrl, true)
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual(null);
    });

    it('In strict mode, only the preset should be used as a modifier.', () => {
      const url = '/uploads/neutral_front_a_1_88f17a7dd7.jpg?format=webp&resize=200x200&preset=desktop'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      applyStrictMode(modifiersFromUrl, true)
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual(presets.desktop);
    });


    it('In strict mode, only the preset should be used as a modifier.', () => {
      const url = '/uploads/preset_square,width_2000/neutral_front_a_1_88f17a7dd7.jpg'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      applyStrictMode(modifiersFromUrl, true)
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual(presets.square);
    });

    it('In strict mode, with allowed modifiers only the preset and allowed modifiers should be used as a modifier.', () => {
      const url = '/uploads/neutral_front_a_1_88f17a7dd7.jpg?resize=200x200&preset=desktop&format=webp'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      applyStrictMode(modifiersFromUrl, ['format'])
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual({...presets.desktop, format: 'webp'});
    });

    it('In strict mode, with allowed modifiers only the preset and allowed modifiers should be used as a modifier.', () => {
      const url = '/uploads/width_2000,width_3000,format_webp,preset_mobile/neutral_front_a_1_88f17a7dd7.jpg?resize=200x200&preset=desktop&format=webp'
      const {id, modifiers: modifiersFromUrl} = parseImageUrl(url)
      applyStrictMode(modifiersFromUrl, ['format'])
      const modifiersWithPreset = applyPresets(modifiersFromUrl, presets)
      expect(id).toBe('neutral_front_a_1_88f17a7dd7.jpg');
      expect(modifiersWithPreset).toEqual({...presets.mobile, format: 'webp'});
    });
  })
});
