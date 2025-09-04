# Loading Component Usage Examples

## Các tùy chọn centerType:

### 1. `default` - Loading trong container hiện tại
```html
<app-loading 
  size="medium"
  message="Loading data..."
  centerType="default">
</app-loading>
```

### 2. `center-viewport` - Loading ở giữa viewport với background (che phủ toàn trang)
```html
<app-loading 
  size="large"
  message="Loading recipe..."
  centerType="center-viewport">
</app-loading>
```

### 3. `center-container` - Loading ở giữa container với background (chỉ che phủ container)
```html
<app-loading 
  size="large"
  message="Loading recipe..."
  centerType="center-container">
</app-loading>
```

### 4. `full-page` - Loading toàn màn hình
```html
<app-loading 
  size="large"
  message="Loading application..."
  centerType="full-page">
</app-loading>
```

## Các tùy chọn size:

- `small`: 32px spinner, phù hợp cho buttons
- `medium`: 48px spinner, phù hợp cho sections
- `large`: 64px spinner, phù hợp cho full page

## Các tùy chọn khác:

```html
<app-loading 
  size="large"
  message="Loading with progress..."
  centerType="center-viewport"
  [showProgress]="true"
  [progressValue]="75"
  [showDots]="true">
</app-loading>
```

## Sử dụng trong các trường hợp:

### Route Loading (App Component)
```html
<app-loading 
  size="large"
  message="Loading page"
  centerType="full-page"
  [showProgress]="true"
  [progressValue]="routeLoadingService.loadingProgress()">
</app-loading>
```

### Data Loading (Components)
```html
<app-loading 
  size="medium"
  message="Loading data..."
  centerType="center-container">
</app-loading>
```

### Button Loading (Inline)
```html
<app-loading 
  size="small"
  message="Saving..."
  centerType="default">
</app-loading>
```
