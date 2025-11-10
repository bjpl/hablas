# Hablas Design System

> Sistema de diseño completo para la plataforma Hablas - recursos de inglés para trabajadores colombianos móviles.

[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/bjpl/hablas)
[![Status](https://img.shields.io/badge/status-active-success.svg)](https://bjpl.github.io/hablas/)
[![Accessibility](https://img.shields.io/badge/a11y-WCAG%202.1%20AA-blue.svg)](#-accesibilidad)

## 📖 Documentación

- **[Style Guide Interactivo](./style-guide.html)** - Guía visual completa con ejemplos en vivo y componentes interactivos
- **[Código fuente](https://github.com/bjpl/hablas)** - Repositorio completo en GitHub

## 🎨 Visión General

El Design System de Hablas está diseñado específicamente para:
- **Trabajadores móviles**: Conductores y domiciliarios que usan celulares mientras trabajan
- **Conexión limitada**: Optimizado para funcionar offline y con datos móviles
- **Accesibilidad**: Touch targets grandes, alto contraste, legibilidad óptima
- **Velocidad**: Componentes ligeros y optimizados para rendimiento

## 🎯 Principios de Diseño

### 1. **♿ Accesibilidad Primero**

- ✅ Touch targets mínimo 44x44px (WCAG 2.1 AA)
- ✅ Contraste de texto 4.5:1 mínimo
- ✅ Navegación completa por teclado
- ✅ Semántica HTML5 con landmarks ARIA
- ✅ Funcionalidad offline-first

### 2. **📱 Mobile First**

- Diseñado para pantallas desde 375px
- Optimizado para uso con una sola mano
- Conexión limitada y datos móviles
- Progressive enhancement desde HTML base

### 3. **✨ Claridad y Simplicidad**

- Jerarquía visual clara con espaciado consistente
- Mensajes directos, motivadores y prácticos
- Íconos universales y reconocibles
- Lenguaje cercano (tutear), sin jerga técnica

### 4. **⚡ Rendimiento**

- CSS inline crítico para renderizado instantáneo
- Lazy loading de imágenes y recursos pesados
- Service worker para caché agresivo
- Bundle JavaScript optimizado y minificado

## 🎨 Sistema de Colores

### Colores de Marca (Brand Colors)

| Color | Hex | Variable CSS | Uso Principal |
|-------|-----|--------------|---------------|
| WhatsApp Green | `#25D366` | `--whatsapp` | CTAs principales, grupos comunitarios |
| WhatsApp Dark | `#128C7E` | `--whatsapp-dark` | Hover states, emphasis |
| Rappi Orange | `#FF4E00` | `--rappi` | Tags de domiciliarios |
| Uber Black | `#000000` | `--uber` | Tags de conductores |
| DiDi Orange | `#FFA033` | `--didi` | Tags de conductores alternativos |

### Colores de UI

| Categoría | Variables | Uso |
|-----------|-----------|-----|
| Backgrounds | `--bg-primary`, `--bg-secondary`, `--bg-tertiary` | Fondos principales, tarjetas, y secciones |
| Text | `--text-primary`, `--text-secondary`, `--text-tertiary` | Jerarquía tipográfica |
| Borders | `--border-default`, `--border-hover` | Bordes y divisores |
| Accents | `--accent-blue`, `--accent-green`, `--accent-purple` | Estados semánticos |

## 📝 Tipografía

### Familia de Fuentes (System Font Stack)

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;
```

**Ventajas:**
- ⚡ Carga instantánea (sin web fonts)
- 📱 Nativa en cada plataforma
- ♿ Optimizada para legibilidad

### Escala Tipográfica

| Elemento | Tamaño Desktop | Tamaño Móvil | Uso |
|----------|----------------|----------------|-----|
| H1 | 48px (3rem) | 36px (2.25rem) | Títulos principales de página |
| H2 | 36px (2.25rem) | 28px (1.75rem) | Títulos de sección |
| H3 | 24px (1.5rem) | 20px (1.25rem) | Subtítulos |
| H4 | 20px (1.25rem) | 18px (1.125rem) | Encabezados menores |
| Body | 16px (1rem) | 16px (1rem) | Texto principal |
| Small | 14px (0.875rem) | 14px (0.875rem) | Texto secundario |
| XSmall | 12px (0.75rem) | 12px (0.75rem) | Metadata, captions |

## 🧩 Componentes Principales

### Botones (Buttons)

| Componente | Descripción | Uso |
|------------|-------------|-----|
| **WhatsApp CTA** | Botón verde destacado | Unirse a grupos comunitarios |
| **Download Button** | Botón con ícono de descarga | Descargar recursos offline |
| **Filter Pills** | Botones pequeños redondeados | Filtrar y categorizar contenido |

**Requisitos:**
- Mínimo 44x44px touch target
- Estados claros: default, hover, focus, active, disabled
- Focus visible para navegación por teclado

### Tarjetas (Cards)

| Componente | Descripción | Elementos |
|------------|-------------|----------|
| **Resource Card** | Tarjeta de recurso descargable | Título, descripción, botón, metadata |
| **WhatsApp Group Card** | Invitación a grupo | Título, participantes, link de acceso |
| **Stat Card** | Métricas y estadísticas | Número grande, label, ícono |

### Etiquetas (Tags)

| Tipo | Colores | Ejemplos |
|------|---------|----------|
| **Platform Tags** | Brand colors | Rappi, Uber, DiDi |
| **Level Tags** | Semantic colors | Básico, Intermedio, Avanzado |
| **Status Tags** | State colors | Offline, Descargado, Nuevo |

## 📱 Responsive Breakpoints

### Breakpoints Principales

| Breakpoint | Min Width | Dispositivo | Notas |
|------------|-----------|-------------|-------|
| `xs` | 375px | Teléfonos pequeños | iPhone SE, base mínima |
| `sm` | 640px | Teléfonos grandes | iPhone 14, Pixel |
| `md` | 768px | Tablets | iPad Mini, tablets Android |
| `lg` | 1024px | Desktop pequeño | Laptops, iPad Pro |
| `xl` | 1280px | Desktop grande | Monitores grandes |

### Mobile-First Media Queries

```css
/* Base: Móvil (375px+) */
.component { font-size: 16px; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .component { font-size: 18px; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .component { font-size: 20px; }
}
```

## ✍️ Guías de Contenido

### Tono de Voz
- ✓ Cercano (tutear)
- ✓ Motivador
- ✓ Práctico
- ✓ Directo

### Evitar
- ✗ Lenguaje académico
- ✗ Jerga técnica
- ✗ Instrucciones largas
- ✗ Formalidad excesiva

### Ejemplos

**Bien**: "Descarga estas frases y úsalas sin datos mientras trabajas"

**Evitar**: "Puede descargar el archivo PDF para su posterior consulta offline"

## 🔧 Uso del Sistema

### Instalación

El sistema usa Tailwind CSS con configuración personalizada:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'whatsapp': '#25D366',
        'rappi': '#FF4E00',
        'didi': '#FFA033',
        'uber': '#000000',
      }
    }
  }
}
```

### Clases Utilitarias

```css
/* Botón WhatsApp */
.btn-whatsapp {
  @apply bg-whatsapp text-white font-bold py-4 px-6
         rounded-lg shadow-lg active:scale-95 transition-transform
         flex items-center justify-center gap-3 text-lg;
}

/* Card de Recurso */
.card-resource {
  @apply bg-white rounded-lg shadow-md p-4
         border border-gray-100 active:shadow-lg transition-shadow;
}

/* Tag de Trabajo */
.tag-job {
  @apply inline-block px-3 py-1 rounded-full text-sm font-medium;
}
```

## ♿ Accesibilidad

### Estándares de Cumplimiento

✅ **WCAG 2.1 Nivel AA** - Cumplimiento completo

### Requisitos Implementados

| Criterio | Requisito | Implementación |
|----------|-----------|------------------|
| **Contraste** | 4.5:1 mínimo texto | Todas las combinaciones de color verificadas |
| **Touch Targets** | 44x44px mínimo | Botones y elementos interactivos |
| **Semántica** | HTML5 + ARIA | `<header>`, `<main>`, `<nav>`, `role`, `aria-label` |
| **Teclado** | Navegación completa | Tab, Enter, Escape, flechas |
| **Foco visible** | Indicador claro | Outline de 2-3px en color brand |
| **Imágenes** | Alt text descriptivo | Todas las imágenes con contexto |
| **Labels** | Asociados correctamente | `<label for>` o `aria-label` |
| **JavaScript** | Funcional sin JS | Progressive enhancement |

### Checklist de Testing

- [ ] **Screen Readers**: NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android)
- [ ] **Teclado**: Tab, Shift+Tab, Enter, Escape, flechas
- [ ] **Zoom**: Probar 200% y 400% sin pérdida de funcionalidad
- [ ] **Alto Contraste**: Windows High Contrast Mode
- [ ] **Color Blindness**: Simuladores Deuteranopia, Protanopia, Tritanopia
- [ ] **Conexión**: Offline, 3G lenta, intermitente
- [ ] **Dispositivos Reales**: iPhone SE, Android budget, tablets

## 📚 Recursos y Referencias

### Documentación Oficial

- 🌐 [Sitio Web Hablas](https://bjpl.github.io/hablas/)
- 💻 [Repositorio GitHub](https://github.com/bjpl/hablas)
- 🎨 [Style Guide Interactivo](./style-guide.html)

### Tecnologías Utilizadas

- [Next.js 14+](https://nextjs.org/docs) - Framework React con SSG
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) - Variables nativas

### Referencias de Accesibilidad

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## 🤝 Contribuir

### Cómo Contribuir al Design System

1. **Fork** el repositorio
2. **Crea una branch**: `git checkout -b feature/nuevo-componente`
3. **Sigue los principios** de diseño establecidos
4. **Mantén la accesibilidad** (WCAG 2.1 AA mínimo)
5. **Documenta** el nuevo componente en el style guide
6. **Prueba** en dispositivos móviles reales
7. **Commit**: `git commit -m 'feat: add nuevo componente'`
8. **Push**: `git push origin feature/nuevo-componente`
9. **Pull Request** con descripción detallada

### Guía de Estilo para Commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formato, punto y coma faltantes
- `refactor:` Refactorización de código
- `test:` Añadir tests faltantes
- `chore:` Tareas de mantenimiento

## 📄 Licencia

Este design system es parte del proyecto Hablas y está disponible bajo licencia MIT.

---

<div align="center">

**Versión**: 1.0.0
**Última actualización**: Septiembre 2025
**Mantenido por**: [Equipo Hablas](https://github.com/bjpl/hablas)

Hecho con ❤️ para trabajadores colombianos móviles

</div>