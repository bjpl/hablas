/**
 * Sanitization Tests
 * Tests for XSS protection and input sanitization
 */

import {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizePhone,
  sanitizeFilename,
  sanitizeSearchQuery,
  sanitizeEventData,
  stripDangerousChars,
  sanitizeObject
} from '../lib/sanitize'

describe('Sanitization', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const dirty = '<p>Hello</p><script>alert("XSS")</script>'
      const clean = sanitizeHtml(dirty)
      expect(clean).not.toContain('<script>')
      expect(clean).not.toContain('alert')
      expect(clean).toContain('Hello')
    })

    it('should remove onclick attributes', () => {
      const dirty = '<div onclick="alert(1)">Click me</div>'
      const clean = sanitizeHtml(dirty)
      expect(clean).not.toContain('onclick')
    })

    it('should allow safe tags', () => {
      const dirty = '<p>Hello <strong>World</strong></p>'
      const clean = sanitizeHtml(dirty)
      expect(clean).toContain('<p>')
      expect(clean).toContain('<strong>')
      expect(clean).toContain('Hello')
    })

    it('should remove iframe tags', () => {
      const dirty = '<p>Hello</p><iframe src="evil.com"></iframe>'
      const clean = sanitizeHtml(dirty)
      expect(clean).not.toContain('<iframe>')
    })
  })

  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const dirty = '<p>Hello <strong>World</strong></p>'
      const clean = sanitizeText(dirty)
      expect(clean).toBe('Hello World')
      expect(clean).not.toContain('<')
    })

    it('should encode special characters after removing tags', () => {
      const dirty = 'Price: 5 < 10 and 15 > 10'
      const clean = sanitizeText(dirty)
      expect(clean).toContain('&lt;')
      expect(clean).toContain('&gt;')
      expect(clean).not.toContain(' < ')
      expect(clean).not.toContain(' > ')
    })

    it('should handle empty input', () => {
      expect(sanitizeText('')).toBe('')
      expect(sanitizeText(null as any)).toBe('')
      expect(sanitizeText(undefined as any)).toBe('')
    })
  })

  describe('sanitizeEmail', () => {
    it('should accept valid emails', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com')
      expect(sanitizeEmail('user+tag@domain.co')).toBe('user+tag@domain.co')
    })

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('not-an-email')).toBe('')
      expect(sanitizeEmail('missing@domain')).toBe('')
      expect(sanitizeEmail('@nodomain.com')).toBe('')
    })

    it('should trim and lowercase', () => {
      expect(sanitizeEmail('  Test@Example.COM  ')).toBe('test@example.com')
    })

    it('should handle empty input', () => {
      expect(sanitizeEmail('')).toBe('')
      expect(sanitizeEmail(null as any)).toBe('')
    })
  })

  describe('sanitizeUrl', () => {
    it('should allow safe protocols', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com')
      expect(sanitizeUrl('tel:+573001234567')).toBe('tel:+573001234567')
    })

    it('should block javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('')
      expect(sanitizeUrl('JavaScript:alert(1)')).toBe('')
    })

    it('should block data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('')
    })

    it('should block vbscript: protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('')
    })

    it('should block file: protocol', () => {
      expect(sanitizeUrl('file:///etc/passwd')).toBe('')
    })

    it('should handle relative URLs', () => {
      expect(sanitizeUrl('/path/to/resource')).toBe('/path/to/resource')
      expect(sanitizeUrl('resource.html')).toBe('resource.html')
    })
  })

  describe('sanitizePhone', () => {
    it('should accept valid Colombian phone numbers', () => {
      expect(sanitizePhone('3001234567')).toBe('3001234567')
      expect(sanitizePhone('+57 300 123 4567')).toBe('+57 300 123 4567')
      expect(sanitizePhone('+573001234567')).toBe('+573001234567')
    })

    it('should reject invalid phone numbers', () => {
      expect(sanitizePhone('123')).toBe('')
      expect(sanitizePhone('abc123')).toBe('')
      expect(sanitizePhone('+1 555 1234')).toBe('')
    })

    it('should remove invalid characters', () => {
      const phone = sanitizePhone('300-123-4567')
      expect(phone).not.toContain('abc')
    })

    it('should handle empty input', () => {
      expect(sanitizePhone('')).toBe('')
      expect(sanitizePhone(null as any)).toBe('')
    })
  })

  describe('sanitizeFilename', () => {
    it('should accept safe filenames', () => {
      expect(sanitizeFilename('document.pdf')).toBe('document.pdf')
      expect(sanitizeFilename('my-file_123.txt')).toBe('my-file_123.txt')
    })

    it('should remove directory traversal', () => {
      expect(sanitizeFilename('../../../etc/passwd')).not.toContain('..')
      expect(sanitizeFilename('../../../../etc/passwd')).not.toContain('..')
    })

    it('should remove path separators', () => {
      expect(sanitizeFilename('path/to/file.txt')).not.toContain('/')
      expect(sanitizeFilename('path\\to\\file.txt')).not.toContain('\\')
    })

    it('should remove special characters', () => {
      expect(sanitizeFilename('file<script>.txt')).not.toContain('<')
      expect(sanitizeFilename('file<script>.txt')).not.toContain('>')
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('should accept safe queries', () => {
      expect(sanitizeSearchQuery('hello world')).toBe('hello world')
      expect(sanitizeSearchQuery('conductor inglés')).toBe('conductor inglés')
    })

    it('should remove SQL injection attempts', () => {
      const query = sanitizeSearchQuery("'; DROP TABLE users;--")
      expect(query).not.toContain("'")
      expect(query).not.toContain(';')
      expect(query).not.toContain('DROP')
    })

    it('should remove HTML tags', () => {
      const query = sanitizeSearchQuery('<script>alert(1)</script>')
      expect(query).not.toContain('<script>')
    })

    it('should limit length', () => {
      const longQuery = 'a'.repeat(300)
      const query = sanitizeSearchQuery(longQuery)
      expect(query.length).toBeLessThanOrEqual(200)
    })
  })

  describe('sanitizeEventData', () => {
    it('should sanitize string values', () => {
      const data = {
        event: '<script>alert(1)</script>',
        name: 'Test User'
      }
      const clean = sanitizeEventData(data)
      expect(clean.event).not.toContain('<script>')
      expect(clean.name).toBe('Test User')
    })

    it('should preserve numbers and booleans', () => {
      const data = {
        count: 42,
        enabled: true
      }
      const clean = sanitizeEventData(data)
      expect(clean.count).toBe(42)
      expect(clean.enabled).toBe(true)
    })

    it('should sanitize nested objects', () => {
      const data = {
        user: {
          name: '<script>evil</script>',
          age: 25
        }
      }
      const clean = sanitizeEventData(data)
      const user = clean.user as Record<string, unknown>
      expect(user.name).not.toContain('<script>')
      expect(user.age).toBe(25)
    })

    it('should sanitize arrays', () => {
      const data = {
        tags: ['<script>evil</script>', 'safe-tag']
      }
      const clean = sanitizeEventData(data)
      const tags = clean.tags as string[]
      expect(tags[0]).not.toContain('<script>')
      expect(tags[1]).toBe('safe-tag')
    })
  })

  describe('stripDangerousChars', () => {
    it('should remove null bytes', () => {
      const input = 'hello\0world'
      const clean = stripDangerousChars(input)
      expect(clean).not.toContain('\0')
      expect(clean).toBe('helloworld')
    })

    it('should remove control characters', () => {
      const input = 'hello\x01\x02\x03world'
      const clean = stripDangerousChars(input)
      expect(clean).toBe('helloworld')
    })

    it('should preserve newlines and tabs', () => {
      const input = 'hello\nworld\ttab'
      const clean = stripDangerousChars(input)
      expect(clean).toContain('\n')
      expect(clean).toContain('\t')
    })
  })

  describe('sanitizeObject', () => {
    it('should keep only allowed keys', () => {
      const obj = {
        name: 'Test',
        age: 25,
        password: 'secret',
        admin: true
      }
      const clean = sanitizeObject(obj, ['name', 'age'])
      expect(clean).toHaveProperty('name')
      expect(clean).toHaveProperty('age')
      expect(clean).not.toHaveProperty('password')
      expect(clean).not.toHaveProperty('admin')
    })

    it('should handle missing keys', () => {
      const obj = { name: 'Test' }
      const clean = sanitizeObject(obj, ['name', 'age'])
      expect(clean).toHaveProperty('name')
      expect(clean).not.toHaveProperty('age')
    })
  })
})
