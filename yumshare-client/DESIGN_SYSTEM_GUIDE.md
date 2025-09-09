# 🎨 YumShare Design System Guide

## 📋 Tổng quan

Design System của YumShare đã được hoàn thiện với 4 hệ thống chính:

1. ✅ **Color System** - Đã có sẵn
2. ✅ **Button Component System** - Mới bổ sung
3. ✅ **Spacing System** - Mới bổ sung  
4. ✅ **Border Radius System** - Mới bổ sung

---

## 🎨 1. Color System

### Sử dụng CSS Variables
```scss
// ✅ Đúng - Sử dụng CSS variables
.my-component {
  background: var(--primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

// ❌ Sai - Hard-code colors
.my-component {
  background: #8DC63F;
  color: #1c1c1a;
  border: 1px solid #e0e0e0;
}
```

### Import Mixins vào Component
```scss
// Thêm vào đầu file component SCSS (Sử dụng @use thay vì @import)
@use '../../shared/mixins' as *;
```

### Available Color Variables
```scss
// Primary Colors
--primary: #8DC63F
--primary-dark: #7FC520
--primary-light: #92da37
--primary-lighter: #e8f5d8
--primary-lightest: #f0f8e6

// Semantic Colors
--success: #4CAF50
--error: #F44336
--warning: #FF9800
--info: #2196F3

// Text Colors
--text-primary: #1c1c1a
--text-secondary: #555
--text-muted: #666
--text-light: #999
--text-disabled: #ccc

// Surface Colors
--background: #fcf9f6
--surface: #ffffff
--surface-variant: #f8faf5
--surface-hover: #f5f5f5
--surface-active: #eeeeee

// Border Colors
--border: #e0e0e0
--border-light: #f0f0f0
--border-dark: #bdbdbd
```

---

## 🔘 2. Button Component System

### Sử dụng Button Mixins
```scss
// ✅ Đúng - Sử dụng mixins
.my-button {
  @include button-primary;
  @include button-size(var(--spacing-sm), var(--spacing-lg), 16px, 40px);
}

// ❌ Sai - Custom styling
.my-button {
  background: #8DC63F;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}
```

### Available Button Mixins
```scss
// Style variants
@mixin button-primary     // Primary button với background xanh
@mixin button-secondary   // Secondary button với border
@mixin button-outline     // Outline button
@mixin button-ghost       // Ghost button (transparent)
@mixin button-danger      // Danger button (đỏ)
@mixin button-success     // Success button (xanh lá)

// Size variants
@mixin button-size($padding-y, $padding-x, $font-size, $min-height)
```

### Sử dụng Button Classes
```html
<!-- Button với class -->
<button class="btn-primary btn-md">
  <mat-icon>save</mat-icon>
  Save Recipe
</button>

<button class="btn-secondary btn-sm">
  Cancel
</button>

<button class="btn-icon">
  <mat-icon>favorite</mat-icon>
</button>
```

### Available Button Classes
```scss
// Size classes
.btn-xs    // 24px height
.btn-sm    // 32px height  
.btn-md    // 40px height
.btn-lg    // 48px height
.btn-xl    // 56px height

// Style classes
.btn-primary
.btn-secondary
.btn-outline
.btn-ghost
.btn-danger
.btn-success
.btn-icon

// Icon classes
.btn-icon-text
.btn-icon-text-reverse
```

---

## 📏 3. Spacing System

### Sử dụng Spacing Variables
```scss
// ✅ Đúng - Sử dụng spacing variables
.my-component {
  padding: var(--spacing-md);
  margin: var(--spacing-lg);
  gap: var(--spacing-sm);
}

// ❌ Sai - Hard-code spacing
.my-component {
  padding: 16px;
  margin: 24px;
  gap: 8px;
}
```

### Available Spacing Variables
```scss
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-xxl: 48px
--spacing-xxxl: 64px
```

### Sử dụng Spacing Utility Classes
```html
<!-- Padding -->
<div class="p-md">Padding medium</div>
<div class="px-lg py-sm">Padding x large, y small</div>

<!-- Margin -->
<div class="m-lg">Margin large</div>
<div class="mx-md my-sm">Margin x medium, y small</div>

<!-- Gap -->
<div class="flex gap-md">Flex with medium gap</div>
```

### Available Spacing Classes
```scss
// Padding
.p-xs, .p-sm, .p-md, .p-lg, .p-xl, .p-xxl, .p-xxxl
.py-xs, .py-sm, .py-md, .py-lg, .py-xl
.px-xs, .px-sm, .px-md, .px-lg, .px-xl

// Margin  
.m-xs, .m-sm, .m-md, .m-lg, .m-xl, .m-xxl, .m-xxxl
.my-xs, .my-sm, .my-md, .my-lg, .my-xl
.mx-xs, .mx-sm, .mx-md, .mx-lg, .mx-xl

// Gap
.gap-xs, .gap-sm, .gap-md, .gap-lg, .gap-xl, .gap-xxl
```

---

## 🔲 4. Border Radius System

### Sử dụng Border Radius Variables
```scss
// ✅ Đúng - Sử dụng radius variables
.my-component {
  border-radius: var(--radius-md);
  border-top-left-radius: var(--radius-lg);
}

// ❌ Sai - Hard-code radius
.my-component {
  border-radius: 8px;
  border-top-left-radius: 12px;
}
```

### Available Border Radius Variables
```scss
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-xxl: 20px
--radius-round: 50%
```

### Sử dụng Border Radius Utility Classes
```html
<!-- All corners -->
<div class="rounded-md">Medium radius</div>
<div class="rounded-lg">Large radius</div>
<div class="rounded-full">Fully rounded</div>

<!-- Specific corners -->
<div class="rounded-t-lg">Top corners large</div>
<div class="rounded-b-md">Bottom corners medium</div>
```

### Available Border Radius Classes
```scss
// All corners
.rounded-sm, .rounded-md, .rounded-lg, .rounded-xl, .rounded-xxl, .rounded-full

// Top corners
.rounded-t-sm, .rounded-t-md, .rounded-t-lg, .rounded-t-xl

// Bottom corners  
.rounded-b-sm, .rounded-b-md, .rounded-b-lg, .rounded-b-xl
```

---

## 🧩 5. Component Mixins

### Card Component
```scss
.my-card {
  @include card-base;
  @include card-hover;
  
  // Hoặc
  @include card-elevated;
}
```

### Input Component
```scss
.my-input {
  @include input-base;
}
```

---

## 📱 6. Responsive Utilities

### Flexbox Utilities
```html
<div class="flex flex-col items-center justify-between gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Responsive Classes
```html
<!-- Hide on mobile -->
<div class="hidden-mobile">Desktop only</div>

<!-- Show only on mobile -->
<div class="visible-mobile">Mobile only</div>

<!-- Responsive flex -->
<div class="flex-mobile flex-row-tablet">Responsive flex</div>
```

---

## 🚀 7. Migration Guide

### Từ Hard-coded sang Design System

#### Before (❌)
```scss
.search-button {
  background: #8DC63F;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

.recipe-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin: 20px;
}
```

#### After (✅)
```scss
.search-button {
  @include button-primary;
  @include button-size(var(--spacing-sm), var(--spacing-lg), 16px, 40px);
}

.recipe-card {
  @include card-base;
  @include card-hover;
  padding: var(--spacing-md);
  margin: var(--spacing-lg);
}
```

### Hoặc sử dụng Utility Classes
```html
<!-- Before -->
<button style="background: #8DC63F; color: white; padding: 12px 24px; border-radius: 8px;">
  Search
</button>

<!-- After -->
<button class="btn-primary btn-md">
  Search
</button>
```

---

## 📚 8. Best Practices

### ✅ Do's
- Sử dụng CSS variables thay vì hard-code values
- Sử dụng mixins cho components phức tạp
- Sử dụng utility classes cho styling đơn giản
- Tuân thủ spacing và border radius scale
- Sử dụng semantic color names

### ❌ Don'ts
- Không hard-code colors, spacing, hoặc border radius
- Không tạo custom button styles khi đã có mixins
- Không sử dụng random values cho spacing
- Không override design system variables

---

## 🔧 9. Customization

### Thêm Custom Colors
```scss
:root {
  --custom-accent: #ff6b6b;
  --custom-accent-dark: #ff5252;
}
```

### Thêm Custom Spacing
```scss
:root {
  --spacing-custom: 28px;
}
```

### Thêm Custom Button Variant
```scss
@mixin button-custom {
  @include button-base;
  background: var(--custom-accent);
  color: white;
  
  &:hover:not(:disabled) {
    background: var(--custom-accent-dark);
  }
}
```

---

## 📖 10. Examples

### Complete Button Example
```html
<button class="btn-primary btn-lg btn-icon-text">
  <mat-icon>add</mat-icon>
  Add Recipe
</button>
```

### Complete Card Example
```html
<div class="rounded-lg shadow-medium p-lg m-md">
  <h3 class="text-primary mb-sm">Recipe Title</h3>
  <p class="text-secondary mb-md">Recipe description...</p>
  <button class="btn-secondary btn-sm">View Recipe</button>
</div>
```

### Complete Form Example
```html
<form class="flex flex-col gap-md p-lg">
  <input class="rounded-md p-sm border-default" placeholder="Recipe name">
  <textarea class="rounded-md p-sm border-default" placeholder="Description"></textarea>
  <div class="flex gap-sm justify-end">
    <button class="btn-outline btn-md">Cancel</button>
    <button class="btn-primary btn-md">Save</button>
  </div>
</form>
```

---

## 🎯 Kết luận

Design System của YumShare giờ đây đã hoàn chỉnh với:

- ✅ **Color System**: CSS variables cho tất cả colors
- ✅ **Button System**: Mixins và classes cho buttons
- ✅ **Spacing System**: Variables và utility classes
- ✅ **Border Radius System**: Variables và utility classes
- ✅ **Component Mixins**: Card, Input, và các components khác
- ✅ **Responsive Utilities**: Flexbox và responsive classes

Hãy sử dụng các hệ thống này để đảm bảo tính nhất quán trong toàn bộ ứng dụng!
